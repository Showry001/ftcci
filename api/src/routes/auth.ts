// Staff sign-in: by password or by an emailed 6-digit code, plus forgotten-password links and the
// signed-in person's own account. Sign-in forms are only accepted from the admin's own pages, are rate
// limited per address, and answer the same way whether or not an account exists.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Config } from "../config.ts";
import type { Db } from "../db/schema.ts";
import type { Mailer } from "../mail/outbox.ts";
import { staffPasswordChanged, staffPasswordReset, staffSignInCode } from "../mail/templates.ts";
import { CODE_MINUTES, RESET_MINUTES, checkCode, checkPassword, issueCode, issueReset, normalEmail, resetLinkUser, resetPassword, setPassword } from "../staff/accounts.ts";
import { actorOf, audit, record } from "../staff/audit.ts";
import { passwordProblem, verifyPassword } from "../staff/passwords.ts";
import { type Staff, clearCookie, endSessions, fromAdmin, readSession, requireStaff, startSession } from "../staff/sessions.ts";

const limit = (max: number, minutes: number) => ({ rateLimit: { max, timeWindow: minutes * 60_000 } });
const email = { type: "string", minLength: 3, maxLength: 254 } as const;
const body = (properties: Record<string, object>, required = Object.keys(properties)) => ({ body: { type: "object", additionalProperties: false, required, properties } });
const signedIn = (s: Staff) => ({ user: { id: s.id, name: s.name, email: s.email, role: s.role, hasPassword: s.hasPassword }, csrfToken: s.csrfToken });
const SIGNED_OUT = { error: "signed_out", message: "You were signed out after 8 hours without activity. Please sign in again." };
const SIGN_IN = { error: "sign_in", message: "Please sign in to continue." };

export async function authRoutes(app: FastifyInstance, { db, config, mailer }: { db: Db; config: Config; mailer: Mailer }) {
  const guard = requireStaff(db, config);
  const fromAdminPages = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!fromAdmin(req, config)) return reply.code(403).send({ error: "csrf", message: "This request couldn't be checked. Reload the page and try again." });
  };
  const publicForm = (max: number, minutes: number) => ({ onRequest: fromAdminPages, config: limit(max, minutes) });

  app.post<{ Body: { email: string; password: string } }>(
    "/api/auth/sign-in/password",
    { ...publicForm(10, 15), schema: body({ email, password: { type: "string", maxLength: 200 } }) },
    async (req, reply) => {
      const result = await checkPassword(db, req.body.email, req.body.password);
      if (!result.ok) {
        const actor = result.user ? actorOf(result.user) : normalEmail(req.body.email);
        if (result.reason === "locked") {
          await record(db, { action: result.justLocked ? "auth.locked" : "auth.sign_in_failed", userId: result.user?.id, actor, ip: req.ip, summary: result.justLocked ? "Password sign-in paused after 5 wrong passwords" : "Password sign-in is paused" });
          const minutes = Math.max(1, Math.ceil((result.lockedUntil!.getTime() - Date.now()) / 60_000));
          return reply.code(423).send({ error: "locked", message: `Too many wrong passwords, so password sign-in is paused for ${minutes} minute${minutes > 1 ? "s" : ""}. You can sign in with an emailed code instead.` });
        }
        await record(db, { action: "auth.sign_in_failed", userId: result.user?.id, actor, ip: req.ip, summary: result.user ? "Wrong password" : "No active account with a password for this email" });
        return reply.code(401).send({ error: "wrong", message: "That email and password don't match. If you haven't set a password, sign in with an emailed code." });
      }
      const staff = await startSession(db, config, req, reply, result.user, "password");
      await record(db, { action: "auth.sign_in", userId: staff.id, actor: actorOf(staff), ip: req.ip, summary: "Signed in with a password" });
      return signedIn(staff);
    },
  );

  app.post<{ Body: { email: string } }>("/api/auth/sign-in/code/request", { ...publicForm(5, 15), schema: body({ email }) }, async (req) => {
    const issued = await issueCode(db, config, req.body.email);
    if (issued) {
      void mailer.sendNow("staff_code", issued.user.email, staffSignInCode(issued.code, CODE_MINUTES));
      await record(db, { action: "auth.code_sent", userId: issued.user.id, actor: actorOf(issued.user), ip: req.ip, summary: "Sign-in code emailed" });
    }
    return { message: `If this email belongs to an FTCCI admin account, a 6-digit code is on its way. It expires in ${CODE_MINUTES} minutes.` };
  });

  app.post<{ Body: { email: string; code: string } }>(
    "/api/auth/sign-in/code",
    { ...publicForm(20, 15), schema: body({ email, code: { type: "string", pattern: "^[0-9]{6}$" } }) },
    async (req, reply) => {
      const result = await checkCode(db, config, req.body.email, req.body.code);
      if (!result.ok) {
        if (result.user) await record(db, { action: "auth.sign_in_failed", userId: result.user.id, actor: actorOf(result.user), ip: req.ip, summary: "Wrong or expired sign-in code" });
        return reply.code(401).send({ error: "wrong_code", message: "That code isn't right, or it has expired. Check the latest email, or ask for a new code." });
      }
      const staff = await startSession(db, config, req, reply, result.user, "code");
      await record(db, { action: "auth.sign_in", userId: staff.id, actor: actorOf(staff), ip: req.ip, summary: "Signed in with an emailed code" });
      return signedIn(staff);
    },
  );

  app.post<{ Body: { email: string } }>("/api/auth/password/forgot", { ...publicForm(5, 15), schema: body({ email }) }, async (req) => {
    const issued = await issueReset(db, req.body.email);
    if (issued) {
      // The token goes after # so it never reaches server logs.
      const link = `${config.staff.adminUrl}/reset-password#${issued.token}`;
      void mailer.sendNow("staff_reset", issued.user.email, staffPasswordReset(link, RESET_MINUTES));
      await record(db, { action: "auth.reset_requested", userId: issued.user.id, actor: actorOf(issued.user), ip: req.ip, summary: "Password reset link emailed" });
    }
    return { message: `If this email belongs to an FTCCI admin account, we've sent a link to choose a new password. It works for ${RESET_MINUTES} minutes.` };
  });

  const EXPIRED = { error: "expired", message: "This link has expired or was already used. Ask for a new one below." };
  const token = { type: "string", maxLength: 100 } as const;

  app.post<{ Body: { token: string } }>("/api/auth/password/reset/check", { ...publicForm(20, 15), schema: body({ token }) }, async (req, reply) => {
    const user = await resetLinkUser(db, req.body.token);
    return user ? { email: user.email } : reply.code(410).send(EXPIRED);
  });

  app.post<{ Body: { token: string; password: string } }>(
    "/api/auth/password/reset",
    { ...publicForm(10, 15), schema: body({ token, password: { type: "string", maxLength: 200 } }) },
    async (req, reply) => {
      const result = await resetPassword(db, req.body.token, req.body.password);
      if (!result.ok) {
        if (result.error === "expired") return reply.code(410).send(EXPIRED);
        return reply.code(400).send({ error: "password", message: result.message, fields: { password: result.message } });
      }
      await record(db, { action: "auth.password_reset", userId: result.user.id, actor: actorOf(result.user), ip: req.ip, summary: "Password set from a reset link; all sessions ended" });
      void mailer.sendNow("staff_password_changed", result.user.email, staffPasswordChanged(result.user.name, new Date()));
      return { message: "Your new password is set. Sign in with it now." };
    },
  );

  // ---- The signed-in person ----

  app.get("/api/auth/me", async (req, reply) => {
    const result = await readSession(db, config, req, reply);
    if (!result.staff) return reply.code(401).send(result.expired ? SIGNED_OUT : SIGN_IN);
    return signedIn(result.staff);
  });

  app.post("/api/auth/sign-out", { onRequest: guard }, async (req, reply) => {
    await db.deleteFrom("staff_sessions").where("id", "=", req.staff!.sessionId).execute();
    clearCookie(reply, config);
    await audit(db, req, { action: "auth.sign_out" });
    return { ok: true };
  });

  app.patch<{ Body: { name: string } }>("/api/auth/me", { onRequest: guard, schema: body({ name: { type: "string", minLength: 1, maxLength: 120 } }) }, async (req, reply) => {
    const name = req.body.name.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
    if (!name) return reply.code(400).send({ error: "invalid", message: "Enter your name.", fields: { name: "Enter your name." } });
    await db.updateTable("staff_users").set({ name, updated_at: new Date() }).where("id", "=", req.staff!.id).execute();
    await audit(db, req, { action: "account.renamed", summary: `Name changed to ${name}` });
    return signedIn({ ...req.staff!, name });
  });

  app.put<{ Body: { current?: string; password: string } }>(
    "/api/auth/me/password",
    { onRequest: guard, config: limit(10, 15), schema: body({ current: { type: "string", maxLength: 200 }, password: { type: "string", maxLength: 200 } }, ["password"]) },
    async (req, reply) => {
      const user = await db.selectFrom("staff_users").selectAll().where("id", "=", req.staff!.id).executeTakeFirstOrThrow();
      if (user.password_hash && !(await verifyPassword(req.body.current ?? "", user.password_hash))) {
        return reply.code(400).send({ error: "invalid", message: "Your current password isn't right.", fields: { current: "Your current password isn't right." } });
      }
      const problem = passwordProblem(req.body.password, user.email);
      if (problem) return reply.code(400).send({ error: "invalid", message: problem, fields: { password: problem } });
      await setPassword(db, user.id, req.body.password);
      await endSessions(db, user.id, req.staff!.sessionId);
      await audit(db, req, { action: "auth.password_changed", summary: user.password_hash ? "Password changed; other sessions ended" : "Password set; other sessions ended" });
      void mailer.sendNow("staff_password_changed", user.email, staffPasswordChanged(user.name, new Date()));
      return signedIn({ ...req.staff!, hasPassword: true });
    },
  );

  app.post("/api/auth/me/sign-out-others", { onRequest: guard }, async (req) => {
    await endSessions(db, req.staff!.id, req.staff!.sessionId);
    await audit(db, req, { action: "auth.signed_out_others", summary: "Signed out on all other devices" });
    return { ok: true };
  });
}
