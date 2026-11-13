import { sql } from "kysely";
import type { Db } from "../db/schema.ts";

/**
 * Next reference for a form, e.g. FTCCI-HB-2026-000042. One counter row per prefix and IST year is
 * bumped atomically, so concurrent submissions can never get the same number. Call it inside the
 * transaction that saves the submission, so a failed save does not burn a number.
 */
export async function nextReference(db: Db, prefix: string, now = new Date()): Promise<string> {
  const year = Number(now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 4));
  const { rows } = await sql<{ last_value: number }>`
    insert into reference_counters (prefix, year, last_value) values (${prefix}, ${year}, 1)
    on conflict (prefix, year) do update set last_value = reference_counters.last_value + 1
    returning last_value
  `.execute(db);
  return `FTCCI-${prefix}-${year}-${String(rows[0].last_value).padStart(6, "0")}`;
}
