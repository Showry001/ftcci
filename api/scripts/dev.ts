// Development only (`npm run dev`): starts a local Postgres in api/.data/pg and a local mail catcher,
// applies migrations, then runs the API and restarts it when its code or api/.env changes.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, unwatchFile, watch, watchFile } from "node:fs";
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
// Hero videos are compressed with the ffmpeg bundled for development unless FFMPEG_PATH says otherwise.
if (!env.FFMPEG_PATH) {
  const { default: ffmpegPath } = (await import("ffmpeg-static")) as unknown as { default: string | null };
  if (ffmpegPath) apiEnv.FFMPEG_PATH = ffmpegPath;
}
// Restarts the API when its code (src/, ../shared/) or api/.env changes. Node's own --watch is not
// used: on macOS it also reacts to files written under api/.data (uploads, the database).
const startApi = () => spawn(process.execPath, ["--env-file-if-exists=.env", "src/server.ts"], { stdio: "inherit", env: apiEnv });
let api = startApi();
let stopping = false;
const onExit = (code: number | null) => {
  if (!stopping) console.log(`[api] stopped (exit ${code}); it restarts when a file changes`);
};
api.on("exit", onExit);

let pending: NodeJS.Timeout | undefined;
function restart(reason: string) {
  clearTimeout(pending);
  pending = setTimeout(() => {
    console.log(`[api] ${reason}, restarting`);
    const old = api;
    old.off("exit", onExit);
    // New migrations (added while this runs) are applied before the API starts again.
    const next = async () => {
      const migrations = createDb(env.DATABASE_URL!);
      try {
        const done = await migrate(migrations);
        if (done.length) console.log(`[postgres] applied ${done.join(", ")}`);
      } catch (err) {
        console.error(`[postgres] migration failed: ${err instanceof Error ? err.message : err}`);
      } finally {
        await migrations.destroy();
      }
      api = startApi();
      api.on("exit", onExit);
    };
    if (old.exitCode !== null || old.signalCode !== null) next();
    else {
      old.once("exit", next);
      old.kill("SIGTERM");
    }
  }, 300);
}
const watchers = ["src", "../shared"].map((dir) =>
  watch(dir, { recursive: true }, (_event, file) => {
    if (file && /\.(ts|js|json|png)$/.test(file)) restart(`${dir}/${file} changed`);
  }),
);
if (existsSync(".env")) watchFile(".env", { interval: 1000 }, () => restart("api/.env changed"));

async function stop() {
  if (stopping) return;
  stopping = true;
  unwatchFile(".env");
  for (const w of watchers) w.close();
  api.kill("SIGTERM");
  catcher.close();
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
