import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import pg from "pg";
import * as m001 from "./migrations/001_forms.ts";
import * as m002 from "./migrations/002_content.ts";
import * as m003 from "./migrations/003_staff.ts";
import * as m004 from "./migrations/004_home_photo_lists.ts";
import * as m005 from "./migrations/005_home_privilege_card_text.ts";
import type { Database, Db } from "./schema.ts";

// Dates stay "YYYY-MM-DD" strings (no time zone shifts) and byte counts come back as numbers.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

export function createDb(connectionString: string): Db {
  const pool = new pg.Pool({ connectionString, max: 10 });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}

// Migrations are listed here rather than read from disk, so a deploy can't pick up stray files.
const migrations = { "001_forms": m001, "002_content": m002, "003_staff": m003, "004_home_photo_lists": m004, "005_home_privilege_card_text": m005 };

export async function migrate(db: Db): Promise<string[]> {
  const migrator = new Migrator({ db, provider: { getMigrations: async () => migrations } });
  const { error, results = [] } = await migrator.migrateToLatest();
  if (error) throw error;
  return results.filter((r) => r.status === "Success").map((r) => r.migrationName);
}
