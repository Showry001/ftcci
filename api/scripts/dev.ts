// Development only (`npm run dev`): starts a local Postgres in api/.data/pg and a local mail catcher,
// applies migrations, then runs the API and restarts it when its code or api/.env changes.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import EmbeddedPostgres from "embedded-postgres";
import { createDb, migrate } from "../src/db/index.ts";
import { startMailCatcher } from "./mail-catcher.ts";

const env = process.env;
if (env.NODE_ENV === "production") throw new Error("scripts/dev.ts is for development only.");
if (!env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy api/.env.example to api/.env first.");
  process.exit(1);
}

const url = new URL(env.DATABASE_URL);
if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
  console.error("DATABASE_URL points at another server; the local development database only runs on 127.0.0.1.");
  process.exit(1);
}
const dataDir = new URL("../.data/pg", import.meta.url).pathname;
const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: Number(url.port || 5432),
  authMethod: "scram-sha-256",
  persistent: true,
  postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
  onLog: () => {},
  onError: (message) => console.error(`[postgres] ${String(message).trim()}`),
});

if (!existsSync(`${dataDir}/PG_VERSION`)) await pg.initialise();
await pg.start();
const dbName = decodeURIComponent(url.pathname.slice(1));
const client = pg.getPgClient();
await client.connect();
const { rowCount } = await client.query("select 1 from pg_database where datname = $1", [dbName]);
await client.end();
if (!rowCount) await pg.createDatabase(dbName);
console.log(`[postgres] running on 127.0.0.1:${url.port}, database "${dbName}"`);

const db = createDb(env.DATABASE_URL);
const applied = await migrate(db);
await db.destroy();
if (applied.length) console.log(`[postgres] applied ${applied.join(", ")}`);

// Always running, so SMTP_HOST can switch between it and a real mail server without a restart.
const CATCHER_PORT = 1025;
const catcher = await startMailCatcher(CATCHER_PORT, new URL("../.data/mail", import.meta.url).pathname);
console.log(`[mail] catcher on 127.0.0.1:${CATCHER_PORT} saves to api/.data/mail (used when SMTP_HOST=127.0.0.1, SMTP_PORT=${CATCHER_PORT})`);

// The API reads api/.env itself on every restart. Values this script loaded from the file are left out
// of the API's environment, because they would override later edits to the file.
const fromFile = existsSync(".env") ? Object.keys(parseEnv(readFileSync(".env", "utf8"))) : [];
const apiEnv = Object.fromEntries(Object.entries(env).filter(([key]) => !fromFile.includes(key)));
const watch = ["src", "../shared", ...(existsSync(".env") ? [".env"] : [])].map((path) => `--watch-path=${path}`);
const api = spawn(process.execPath, ["--env-file-if-exists=.env", ...watch, "src/server.ts"], { stdio: "inherit", env: apiEnv });

let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  api.kill("SIGTERM");
  catcher.close();
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
api.on("exit", () => void stop());
