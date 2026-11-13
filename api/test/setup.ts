// Starts a throwaway Postgres for the test run (`npm test`); it is deleted afterwards.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { createDb, migrate } from "../src/db/index.ts";

let pg: EmbeddedPostgres;
let mediaDir: string;

export async function globalSetup() {
  const port = 55_000 + Math.floor(Math.random() * 5_000);
  pg = new EmbeddedPostgres({
    databaseDir: mkdtempSync(join(tmpdir(), "ftcci-test-pg-")),
    user: "ftcci_test",
    password: "ftcci_test",
    port,
    persistent: false,
    postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
    onLog: () => {},
    onError: () => {},
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("ftcci_test");
  process.env.TEST_DATABASE_URL = `postgres://ftcci_test:ftcci_test@127.0.0.1:${port}/ftcci_test`;
  mediaDir = mkdtempSync(join(tmpdir(), "ftcci-test-media-"));
  process.env.TEST_MEDIA_DIR = mediaDir;
  const db = createDb(process.env.TEST_DATABASE_URL);
  await migrate(db);
  await db.destroy();
}

export async function globalTeardown() {
  await pg.stop();
  rmSync(mediaDir, { recursive: true, force: true });
}
