// Signing in, by password or by a code sent to the staff member's email (either one is enough: FTCCI's
// choice), and resetting a forgotten password with a single-use link. Unknown, disabled and real
// accounts get the same answers, so the forms can't be used to find out who has an account.
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { sql } from "kysely";
import type { Config } from "../config.ts";
import type { Db, StaffUser } from "../db/schema.ts";
import { decoyHash, hashPassword, passwordProblem, verifyPassword } from "./passwords.ts";
import { endSessions } from "./sessions.ts";

export const LOCK_AFTER = 5;
export const LOCK_MINUTES = 15;
export const CODE_MINUTES = 10;
export const CODE_TRIES = 5;
export const RESET_MINUTES = 30;
// Limits on emails per account, so a sign-in form can't flood a staff inbox or be used to guess codes.
const CODES_PER_15_MIN = 5;
const CODES_PER_DAY = 20;
const RESETS_PER_HOUR = 3;

const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000);
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const codeHash = (config: Config, userId: number, code: string) => createHmac("sha256", config.staff.codeSecret).update(`${userId}:${code}`).digest("hex");
export const normalEmail = (email: string) => email.trim().toLowerCase();

export async function activeUser(db: Db, email: string): Promise<StaffUser | undefined> {
  return db.selectFrom("staff_users").selectAll().where("email", "=", normalEmail(email)).where("disabled_at", "is", null).executeTakeFirst();
}

export type PasswordResult = { ok: true; user: StaffUser } | { ok: false; reason: "wrong" | "locked"; user?: StaffUser; lockedUntil?: Date; justLocked?: boolean };

/** Checks a password. Five wrong passwords in a row lock password sign-in for 15 minutes. */
export async function checkPassword(db: Db, email: string, password: string): Promise<PasswordResult> {
  const user = await activeUser(db, email);
  if (!user?.password_hash) {
    await verifyPassword(password, await decoyHash());
    return { ok: false, reason: "wrong" };
  }
  if (user.locked_until && user.locked_until > new Date()) return { ok: false, reason: "locked", user, lockedUntil: user.locked_until };
  if (await verifyPassword(password, user.password_hash)) return { ok: true, user };

  const { failed_passwords } = await db
    .updateTable("staff_users")
    .set({ failed_passwords: sql`failed_passwords + 1` })
    .where("id", "=", user.id)
    .returning("failed_passwords")
    .executeTakeFirstOrThrow();
  if (failed_passwords < LOCK_AFTER) return { ok: false, reason: "wrong", user };
  const lockedUntil = minutesFromNow(LOCK_MINUTES);
  await db.updateTable("staff_users").set({ failed_passwords: 0, locked_until: lockedUntil }).where("id", "=", user.id).execute();
  return { ok: false, reason: "locked", user, lockedUntil, justLocked: true };
}

/** A new 6-digit code for an active account (earlier codes stop working), or null if none is sent. */
export async function issueCode(db: Db, config: Config, email: string): Promise<{ user: StaffUser; code: string } | null> {
  const user = await activeUser(db, email);
  if (!user) return null;
  const { recent, today } = await db
    .selectFrom("staff_codes")
    .select([
      sql<number>`count(*) filter (where created_at > now() - interval '15 minutes')`.as("recent"),
      sql<number>`count(*) filter (where created_at > now() - interval '1 day')`.as("today"),
    ])
    .where("user_id", "=", user.id)
    .executeTakeFirstOrThrow();
  if (Number(recent) >= CODES_PER_15_MIN || Number(today) >= CODES_PER_DAY) return null;
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.updateTable("staff_codes").set({ used_at: new Date() }).where("user_id", "=", user.id).where("used_at", "is", null).execute();
  await db.insertInto("staff_codes").values({ user_id: user.id, code_hash: codeHash(config, user.id, code), expires_at: minutesFromNow(CODE_MINUTES) }).execute();
  return { user, code };
}

export type CodeResult = { ok: true; user: StaffUser } | { ok: false; triesLeft: number; user?: StaffUser };

/** Checks a code. Each code works once, for 10 minutes, and allows 5 tries. */
export async function checkCode(db: Db, config: Config, email: string, code: string): Promise<CodeResult> {
  const user = await activeUser(db, email);
  if (!user) return { ok: false, triesLeft: 0 };
  // Taking a try and reading the code is one statement, so parallel guesses can't exceed the limit.
  const { rows } = await sql<{ id: number; code_hash: string; attempts: number }>`
    update staff_codes set attempts = attempts + 1
    where id = (
      select id from staff_codes
      where user_id = ${user.id} and used_at is null and expires_at > now()
      order by id desc limit 1
    ) and attempts < ${CODE_TRIES}
    returning id, code_hash, attempts
  `.execute(db);
  const row = rows[0];
  if (!row) return { ok: false, triesLeft: 0, user };
  const expected = Buffer.from(row.code_hash, "hex");
  const given = Buffer.from(codeHash(config, user.id, code), "hex");
  if (timingSafeEqual(expected, given)) {
    const used = await db.updateTable("staff_codes").set({ used_at: new Date() }).where("id", "=", row.id).where("used_at", "is", null).returning("id").executeTakeFirst();
    if (used) return { ok: true, user };
    return { ok: false, triesLeft: 0, user };
  }
  const triesLeft = CODE_TRIES - row.attempts;
  if (!triesLeft) await db.updateTable("staff_codes").set({ used_at: new Date() }).where("id", "=", row.id).execute();
  return { ok: false, triesLeft, user };
}

/** A single-use password reset link token for an active account, or null if none is sent. */
export async function issueReset(db: Db, email: string): Promise<{ user: StaffUser; token: string } | null> {
  const user = await activeUser(db, email);
  if (!user) return null;
  const { n } = await db
    .selectFrom("staff_password_resets")
    .select(sql<number>`count(*)`.as("n"))
    .where("user_id", "=", user.id)
    .where("created_at", ">", sql<Date>`now() - interval '1 hour'`)
    .executeTakeFirstOrThrow();
  if (Number(n) >= RESETS_PER_HOUR) return null;
  const token = randomBytes(32).toString("base64url");
  await db.updateTable("staff_password_resets").set({ used_at: new Date() }).where("user_id", "=", user.id).where("used_at", "is", null).execute();
  await db.insertInto("staff_password_resets").values({ user_id: user.id, token_hash: sha256(token), expires_at: minutesFromNow(RESET_MINUTES) }).execute();
  return { user, token };
}

/** The account a reset link belongs to, while the link is unused and unexpired. */
export async function resetLinkUser(db: Db, token: string): Promise<StaffUser | undefined> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return undefined;
  return db
    .selectFrom("staff_password_resets as r")
    .innerJoin("staff_users as u", "u.id", "r.user_id")
    .selectAll("u")
    .where("r.token_hash", "=", sha256(token))
    .where("r.used_at", "is", null)
    .where("r.expires_at", ">", new Date())
    .where("u.disabled_at", "is", null)
    .executeTakeFirst();
}

export type ResetResult = { ok: true; user: StaffUser } | { ok: false; error: "expired" } | { ok: false; error: "password"; message: string };

/** Sets a new password from a reset link. The link is used up, and every session of the account ends. */
export async function resetPassword(db: Db, token: string, password: unknown): Promise<ResetResult> {
  const user = await resetLinkUser(db, token);
  if (!user) return { ok: false, error: "expired" };
  const problem = passwordProblem(password, user.email);
  if (problem) return { ok: false, error: "password", message: problem };
  const used = await db
    .updateTable("staff_password_resets")
    .set({ used_at: new Date() })
    .where("token_hash", "=", sha256(token))
    .where("used_at", "is", null)
    .returning("id")
    .executeTakeFirst();
  if (!used) return { ok: false, error: "expired" };
  await setPassword(db, user.id, password as string);
  await endSessions(db, user.id);
  return { ok: true, user };
}

export async function setPassword(db: Db, userId: number, password: string) {
  await db
    .updateTable("staff_users")
    .set({ password_hash: await hashPassword(password), failed_passwords: 0, locked_until: null, updated_at: new Date() })
    .where("id", "=", userId)
    .execute();
}

export async function forgetUsedTokens(db: Db) {
  await db.deleteFrom("staff_codes").where("created_at", "<", sql<Date>`now() - interval '2 days'`).execute();
  await db.deleteFrom("staff_password_resets").where("created_at", "<", sql<Date>`now() - interval '2 days'`).execute();
}
