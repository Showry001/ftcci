// Staff sessions live in the database. The browser holds a random token in an HttpOnly, SameSite=Strict
// cookie (Secure and __Host- prefixed in production); the database stores only its SHA-256. A session
// ends after 8 hours without activity (FTCCI's choice: there is no fixed maximum length), on sign-out,
// or when the account is disabled or its password is reset.
//
// Requests that change something must also come from the admin's own origin and carry the session's
// CSRF token in an x-csrf-token header.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Config } from "../config.ts";
import type { Db, StaffRole, StaffUser } from "../db/schema.ts";

export const IDLE_MS = 8 * 3600_000;
const TOUCH_MS = 60_000;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  hasPassword: boolean;
  sessionId: string;
  csrfToken: string;
}

declare module "fastify" {
  interface FastifyRequest {
    staff: Staff | null;
  }
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const cookieName = (config: Config) => (config.staff.secureCookies ? "__Host-ftcci_admin" : "ftcci_admin");

function readCookie(req: FastifyRequest, name: string): string | null {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

// The cookie's lifetime slides with activity, so closing the browser doesn't sign staff out early.
function setCookie(reply: FastifyReply, config: Config, value: string, maxAgeSeconds: number) {
  const attrs = [`${cookieName(config)}=${value}`, "Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAgeSeconds}`];
  if (config.staff.secureCookies) attrs.push("Secure");
  reply.header("set-cookie", attrs.join("; "));
}
export const clearCookie = (reply: FastifyReply, config: Config) => setCookie(reply, config, "", 0);

/** The account the request is signed in as, or why it isn't. */
export async function readSession(db: Db, config: Config, req: FastifyRequest, reply: FastifyReply): Promise<{ staff: Staff } | { staff: null; expired: boolean }> {
  const token = readCookie(req, cookieName(config));
  if (!token || !TOKEN.test(token)) return { staff: null, expired: false };
  const row = await db
    .selectFrom("staff_sessions as s")
    .innerJoin("staff_users as u", "u.id", "s.user_id")
    .select(["s.id as session_id", "s.csrf_token", "s.last_seen_at", "u.id", "u.name", "u.email", "u.role", "u.password_hash", "u.disabled_at"])
    .where("s.id", "=", sha256(token))
    .executeTakeFirst();
  if (!row) {
    clearCookie(reply, config);
    return { staff: null, expired: false };
  }
  const idle = Date.now() - row.last_seen_at.getTime() > IDLE_MS;
  if (idle || row.disabled_at) {
    await db.deleteFrom("staff_sessions").where("id", "=", row.session_id).execute();
    clearCookie(reply, config);
    return { staff: null, expired: idle };
  }
  if (Date.now() - row.last_seen_at.getTime() > TOUCH_MS) {
    await db.updateTable("staff_sessions").set({ last_seen_at: new Date() }).where("id", "=", row.session_id).execute();
    setCookie(reply, config, token, IDLE_MS / 1000);
  }
  return {
    staff: { id: row.id, name: row.name, email: row.email, role: row.role, hasPassword: row.password_hash !== null, sessionId: row.session_id, csrfToken: row.csrf_token },
  };
}

export async function startSession(db: Db, config: Config, req: FastifyRequest, reply: FastifyReply, user: StaffUser, method: "password" | "code") {
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("base64url");
  const id = sha256(token);
  await db
    .insertInto("staff_sessions")
    .values({ id, user_id: user.id, csrf_token: csrfToken, method, ip: req.ip, user_agent: (req.headers["user-agent"] ?? "").slice(0, 200) })
    .execute();
  await db.updateTable("staff_users").set({ last_sign_in_at: new Date(), failed_passwords: 0, locked_until: null }).where("id", "=", user.id).execute();
  setCookie(reply, config, token, IDLE_MS / 1000);
  const staff: Staff = { id: user.id, name: user.name, email: user.email, role: user.role, hasPassword: user.password_hash !== null, sessionId: id, csrfToken };
  return staff;
}

/** Ends every session of an account, except `keep` (the one making the request) when given. */
export async function endSessions(db: Db, userId: number, keep?: string) {
  let q = db.deleteFrom("staff_sessions").where("user_id", "=", userId);
  if (keep) q = q.where("id", "<>", keep);
  await q.execute();
}

export async function forgetIdleSessions(db: Db) {
  await db.deleteFrom("staff_sessions").where("last_seen_at", "<", new Date(Date.now() - IDLE_MS)).execute();
}

/** True when the request comes from the admin's own pages (checked on every change, and on sign-in). */
export function fromAdmin(req: FastifyRequest, config: Config): boolean {
  const origin = req.headers.origin;
  if (origin) return origin === config.staff.adminOrigin;
  const referer = req.headers.referer;
  return typeof referer === "string" && referer.startsWith(`${config.staff.adminOrigin}/`);
}

const equal = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** onRequest hook for admin routes: a signed-in account, and for changes the CSRF checks. */
export function requireStaff(db: Db, config: Config) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await readSession(db, config, req, reply);
    if (!result.staff) {
      return reply.code(401).send(
        result.expired
          ? { error: "signed_out", message: "You were signed out after 8 hours without activity. Please sign in again." }
          : { error: "sign_in", message: "Please sign in to continue." },
      );
    }
    if (!SAFE.has(req.method)) {
      const token = req.headers["x-csrf-token"];
      if (!fromAdmin(req, config) || typeof token !== "string" || !equal(token, result.staff.csrfToken)) {
        return reply.code(403).send({ error: "csrf", message: "This request couldn't be checked. Reload the page and try again." });
      }
    }
    req.staff = result.staff;
  };
}

/** preHandler for actions only a Super Admin may take. */
export async function superAdminOnly(req: FastifyRequest, reply: FastifyReply) {
  if (req.staff?.role !== "super_admin") return reply.code(403).send({ error: "forbidden", message: "Only a Super Admin can do this." });
}
