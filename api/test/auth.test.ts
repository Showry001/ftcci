import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { setPassword } from "../src/staff/accounts.ts";
import { ADMIN_ORIGIN, db, makeApp, resetDb, signedIn, staffUser } from "./helpers.ts";

type App = Awaited<ReturnType<typeof makeApp>>["app"];
const PASSWORD = "river-lantern-42-quiet";
const fromAdmin = { origin: ADMIN_ORIGIN };
const post = (app: App, url: string, payload: object, remoteAddress = "127.0.0.1") => app.inject({ method: "POST", url, payload, headers: fromAdmin, remoteAddress });
const signInWithPassword = (app: App, email: string, password: string) => post(app, "/api/auth/sign-in/password", { email, password });
const cookieOf = (res: { headers: Record<string, unknown> }) => String(res.headers["set-cookie"]).split(";")[0];
// Account emails are sent without waiting for the mail server.
const settle = () => new Promise((r) => setTimeout(r, 20));
const lastCode = (sent: { text: string }[]) => /Sign-in code: (\d{6})/.exec(sent.at(-1)!.text)![1];

async function withPassword(role: "super_admin" | "admin" = "admin") {
  const user = await staffUser(role);
  await setPassword(db, user.id, PASSWORD);
  return user;
}
const log = async () => (await db.selectFrom("audit_log").select(["action", "summary"]).orderBy("id").execute()).map((e) => e.action);

describe("staff sign-in", () => {
  beforeEach(resetDb);

  it("signs in with a password into a secure, HttpOnly session cookie", async () => {
    const { app } = await makeApp();
    const user = await withPassword();
    const res = await signInWithPassword(app, user.email.toUpperCase(), PASSWORD);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().user.email, user.email);
    assert.equal(res.json().user.hasPassword, true);
    const header = String(res.headers["set-cookie"]);
    assert.match(header, /^ftcci_admin=[\w-]{43}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=28800$/);

    const me = await app.inject({ url: "/api/auth/me", headers: { cookie: cookieOf(res) } });
    assert.equal(me.json().user.id, user.id);
    assert.equal(me.json().csrfToken, res.json().csrfToken);
    const session = await db.selectFrom("staff_sessions").selectAll().executeTakeFirstOrThrow();
    assert.notEqual(session.id, cookieOf(res).split("=")[1], "only a hash of the token is stored");
    assert.ok((await log()).includes("auth.sign_in"));
  });

  it("gives the same answer for a wrong password, an unknown email and a disabled account", async () => {
    const { app } = await makeApp();
    const user = await withPassword();
    const disabled = await withPassword();
    await db.updateTable("staff_users").set({ disabled_at: new Date() }).where("id", "=", disabled.id).execute();
    const answers = await Promise.all([
      signInWithPassword(app, user.email, "not-the-password"),
      signInWithPassword(app, "nobody@ftcci.test", PASSWORD),
      signInWithPassword(app, disabled.email, PASSWORD),
    ]);
    for (const res of answers) {
      assert.equal(res.statusCode, 401);
      assert.equal(res.json().message, "That email and password don't match. If you haven't set a password, sign in with an emailed code.");
    }
  });

  it("pauses password sign-in for 15 minutes after 5 wrong passwords, but still allows a code", async () => {
    const { app, transport } = await makeApp();
    const user = await withPassword();
    for (let i = 0; i < 4; i++) assert.equal((await signInWithPassword(app, user.email, "wrong-password-123")).statusCode, 401);
    const fifth = await signInWithPassword(app, user.email, "wrong-password-123");
    assert.equal(fifth.statusCode, 423);
    assert.match(fifth.json().message, /paused for 15 minutes/);
    assert.equal((await signInWithPassword(app, user.email, PASSWORD)).statusCode, 423, "even the right password waits");
    assert.ok((await log()).includes("auth.locked"));

    await post(app, "/api/auth/sign-in/code/request", { email: user.email });
    await settle();
    assert.equal((await post(app, "/api/auth/sign-in/code", { email: user.email, code: lastCode(transport.sent) })).statusCode, 200);

    await db.updateTable("staff_users").set({ locked_until: new Date(Date.now() - 1000) }).where("id", "=", user.id).execute();
    assert.equal((await signInWithPassword(app, user.email, PASSWORD)).statusCode, 200);
  });

  it("signs in with an emailed code that works once, for 10 minutes, with 5 tries", async () => {
    const { app, transport } = await makeApp();
    const user = await staffUser();
    const requested = await post(app, "/api/auth/sign-in/code/request", { email: user.email });
    assert.match(requested.json().message, /If this email belongs to an FTCCI admin account/);
    await settle();
    assert.equal(transport.sent.length, 1);
    assert.equal(transport.sent[0].to.address, user.email);
    assert.doesNotMatch(transport.sent[0].subject, /\d{6}/, "the code isn't in the subject line");
    assert.equal((await db.selectFrom("email_outbox").selectAll().execute()).length, 0, "codes are never stored in the outbox");
    const code = lastCode(transport.sent);

    const wrong = await post(app, "/api/auth/sign-in/code", { email: user.email, code: code === "000000" ? "111111" : "000000" });
    assert.equal(wrong.statusCode, 401);
    const ok = await post(app, "/api/auth/sign-in/code", { email: user.email, code });
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.json().user.hasPassword, false);
    assert.equal((await post(app, "/api/auth/sign-in/code", { email: user.email, code })).statusCode, 401, "a code works once");

    // A new code replaces the previous one; five wrong tries use it up.
    await post(app, "/api/auth/sign-in/code/request", { email: user.email });
    await settle();
    const first = lastCode(transport.sent);
    await post(app, "/api/auth/sign-in/code/request", { email: user.email });
    await settle();
    const second = lastCode(transport.sent);
    if (first !== second) assert.equal((await post(app, "/api/auth/sign-in/code", { email: user.email, code: first })).statusCode, 401);
    const guess = second === "999999" ? "999998" : "999999";
    for (let i = 0; i < 5; i++) await post(app, "/api/auth/sign-in/code", { email: user.email, code: guess }, `10.0.0.${i}`);
    assert.equal((await post(app, "/api/auth/sign-in/code", { email: user.email, code: second })).statusCode, 401, "no tries left");

    await post(app, "/api/auth/sign-in/code/request", { email: user.email }, "10.0.1.1");
    await settle();
    await db.updateTable("staff_codes").set({ expires_at: new Date(Date.now() - 1000) }).where("used_at", "is", null).execute();
    assert.equal((await post(app, "/api/auth/sign-in/code", { email: user.email, code: lastCode(transport.sent) }, "10.0.1.1")).statusCode, 401, "expired");
  });

  it("sends no code to unknown or disabled accounts, and limits codes per account", async () => {
    const { app, transport } = await makeApp();
    const disabled = await staffUser();
    await db.updateTable("staff_users").set({ disabled_at: new Date() }).where("id", "=", disabled.id).execute();
    const unknown = await post(app, "/api/auth/sign-in/code/request", { email: "nobody@ftcci.test" });
    const off = await post(app, "/api/auth/sign-in/code/request", { email: disabled.email });
    assert.deepEqual([unknown.statusCode, off.statusCode], [200, 200]);
    assert.equal(unknown.json().message, off.json().message);
    await settle();
    assert.equal(transport.sent.length, 0);

    const user = await staffUser();
    for (let i = 0; i < 6; i++) await post(app, "/api/auth/sign-in/code/request", { email: user.email }, `10.0.2.${i}`);
    await settle();
    assert.equal(transport.sent.length, 5, "five codes per 15 minutes");
  });

  it("only accepts sign-in from the admin's own pages", async () => {
    const { app } = await makeApp();
    const user = await withPassword();
    const foreign = await app.inject({ method: "POST", url: "/api/auth/sign-in/password", payload: { email: user.email, password: PASSWORD }, headers: { origin: "https://evil.example" } });
    assert.equal(foreign.statusCode, 403);
    const none = await app.inject({ method: "POST", url: "/api/auth/sign-in/password", payload: { email: user.email, password: PASSWORD } });
    assert.equal(none.statusCode, 403);
    assert.equal(none.headers["set-cookie"], undefined);
  });

  it("signs out after 8 hours without activity, and keeps active sessions going", async () => {
    const { app } = await makeApp();
    const staff = await signedIn(app);
    await sql`update staff_sessions set last_seen_at = now() - interval '7 hours 59 minutes' where user_id = ${staff.user.id}`.execute(db);
    const active = await staff.inject({ url: "/api/auth/me" });
    assert.equal(active.statusCode, 200);
    assert.match(String(active.headers["set-cookie"]), /Max-Age=28800/, "the cookie's lifetime slides");
    const seen = await db.selectFrom("staff_sessions").select("last_seen_at").where("user_id", "=", staff.user.id).executeTakeFirstOrThrow();
    assert.ok(Date.now() - seen.last_seen_at.getTime() < 5000);

    await sql`update staff_sessions set last_seen_at = now() - interval '8 hours 1 minute' where user_id = ${staff.user.id}`.execute(db);
    const idle = await staff.inject({ url: "/api/admin/summary" });
    assert.equal(idle.statusCode, 401);
    assert.equal(idle.json().error, "signed_out");
    assert.equal((await db.selectFrom("staff_sessions").selectAll().where("user_id", "=", staff.user.id).execute()).length, 0);
  });

  it("signs out", async () => {
    const { app } = await makeApp();
    const staff = await signedIn(app);
    const res = await staff.inject({ method: "POST", url: "/api/auth/sign-out" });
    assert.equal(res.statusCode, 200);
    assert.match(String(res.headers["set-cookie"]), /Max-Age=0/);
    assert.equal((await staff.inject({ url: "/api/auth/me" })).statusCode, 401);
  });

  it("uses a Secure __Host- cookie in production", async () => {
    const origin = "https://www.ftcci.in";
    const { app } = await makeApp({ NODE_ENV: "production", PUBLIC_SITE_URL: origin, ADMIN_URL: `${origin}/admin` });
    const user = await withPassword();
    const res = await app.inject({ method: "POST", url: "/api/auth/sign-in/password", payload: { email: user.email, password: PASSWORD }, headers: { origin } });
    assert.equal(res.statusCode, 200);
    assert.match(String(res.headers["set-cookie"]), /^__Host-ftcci_admin=[\w-]{43}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=28800; Secure$/);
  });
});

describe("passwords", () => {
  beforeEach(resetDb);

  it("resets a forgotten password with a single-use link and ends every session", async () => {
    const { app, transport } = await makeApp();
    const user = await withPassword();
    const old = await signedIn(app, "admin", user);
    const res = await post(app, "/api/auth/password/forgot", { email: user.email });
    assert.match(res.json().message, /works for 30 minutes/);
    await settle();
    const link = /Choose a new password: (\S+)/.exec(transport.sent.at(-1)!.text)![1];
    assert.ok(link.startsWith(`${ADMIN_ORIGIN}/admin/reset-password#`), "the token is after #, so it never reaches server logs");
    const token = link.split("#")[1];

    assert.deepEqual((await post(app, "/api/auth/password/reset/check", { token })).json(), { email: user.email });
    const short = await post(app, "/api/auth/password/reset", { token, password: "short" });
    assert.equal(short.statusCode, 400);
    assert.equal(short.json().fields.password, "Use at least 12 characters.");
    const mine = await post(app, "/api/auth/password/reset", { token, password: `${user.email}-123` });
    assert.match(mine.json().fields.password, /email address/);

    const done = await post(app, "/api/auth/password/reset", { token, password: "a-brand-new-passphrase" });
    assert.equal(done.statusCode, 200);
    await settle();
    assert.match(transport.sent.at(-1)!.subject, /password was changed/);
    assert.equal((await old.inject({ url: "/api/auth/me" })).statusCode, 401, "old sessions end");
    assert.equal((await post(app, "/api/auth/password/reset", { token, password: "another-new-passphrase" })).statusCode, 410, "single use");
    assert.equal((await signInWithPassword(app, user.email, "a-brand-new-passphrase")).statusCode, 200);
    assert.equal((await signInWithPassword(app, user.email, PASSWORD)).statusCode, 401);
  });

  it("refuses expired reset links", async () => {
    const { app, transport } = await makeApp();
    const user = await withPassword();
    await post(app, "/api/auth/password/forgot", { email: user.email });
    await settle();
    const token = /reset-password#(\S+)/.exec(transport.sent.at(-1)!.text)![1];
    await db.updateTable("staff_password_resets").set({ expires_at: new Date(Date.now() - 1000) }).execute();
    assert.equal((await post(app, "/api/auth/password/reset/check", { token })).statusCode, 410);
    assert.equal((await post(app, "/api/auth/password/reset", { token, password: "a-brand-new-passphrase" })).statusCode, 410);
  });

  it("lets staff set or change their own password", async () => {
    const { app, transport } = await makeApp();
    const user = await staffUser();
    const staff = await signedIn(app, "admin", user);
    const other = await signedIn(app, "admin", user);
    const set = await staff.inject({ method: "PUT", url: "/api/auth/me/password", payload: { password: "first-passphrase-here" } });
    assert.equal(set.statusCode, 200, "no current password is needed when none is set");
    assert.equal((await other.inject({ url: "/api/auth/me" })).statusCode, 401, "other sessions end");

    const wrong = await staff.inject({ method: "PUT", url: "/api/auth/me/password", payload: { current: "nope", password: "second-passphrase-here" } });
    assert.equal(wrong.json().fields.current, "Your current password isn't right.");
    const changed = await staff.inject({ method: "PUT", url: "/api/auth/me/password", payload: { current: "first-passphrase-here", password: "second-passphrase-here" } });
    assert.equal(changed.statusCode, 200);
    await settle();
    assert.equal(transport.sent.filter((m) => /password was changed/.test(m.subject)).length, 2);
    assert.equal((await staff.inject({ url: "/api/auth/me" })).statusCode, 200, "this session continues");
  });
});

describe("staff accounts", () => {
  beforeEach(resetDb);

  it("adds staff and emails them an invitation", async () => {
    const { admin, transport } = await makeApp();
    const res = await admin.inject({ method: "POST", url: "/api/admin/staff", payload: { name: " Ravi  Kumar ", email: "Ravi@FTCCI.test", role: "admin" } });
    assert.equal(res.statusCode, 201);
    assert.deepEqual([res.json().name, res.json().email, res.json().role, res.json().hasPassword], ["Ravi Kumar", "ravi@ftcci.test", "admin", false]);
    await settle();
    assert.equal(transport.sent.at(-1)!.to.address, "ravi@ftcci.test");
    assert.match(transport.sent.at(-1)!.text, /127\.0\.0\.1:5174\/admin\/sign-in/);
    assert.equal((await admin.inject({ method: "POST", url: "/api/admin/staff", payload: { name: "Ravi", email: "ravi@ftcci.test", role: "admin" } })).statusCode, 409);
    assert.equal((await admin.inject({ method: "POST", url: "/api/admin/staff", payload: { name: "", email: "not-email", role: "admin" } })).json().fields.email, "Enter a valid email address.");
  });

  it("stops people changing their own access, so a Super Admin always remains", async () => {
    const { app, admin } = await makeApp();
    const self = await admin.inject({ method: "PATCH", url: `/api/admin/staff/${admin.user.id}`, payload: { role: "admin" } });
    assert.equal(self.statusCode, 400);
    assert.match(self.json().message, /can't change your own role/);

    const second = await signedIn(app, "super_admin");
    assert.equal((await second.inject({ method: "PATCH", url: `/api/admin/staff/${admin.user.id}`, payload: { role: "admin" } })).statusCode, 200);
    const last = await admin.inject({ method: "PATCH", url: `/api/admin/staff/${second.user.id}`, payload: { disabled: true } });
    assert.equal(last.statusCode, 403, "the demoted person is no longer a Super Admin");
  });

  it("disables accounts (ending their sessions), enables and unlocks them", async () => {
    const { app, admin } = await makeApp();
    const user = await withPassword();
    const staff = await signedIn(app, "admin", user);
    const off = await admin.inject({ method: "PATCH", url: `/api/admin/staff/${user.id}`, payload: { disabled: true } });
    assert.equal(off.json().disabled, true);
    assert.equal((await staff.inject({ url: "/api/admin/summary" })).statusCode, 401);
    assert.equal((await signInWithPassword(app, user.email, PASSWORD)).statusCode, 401);

    await admin.inject({ method: "PATCH", url: `/api/admin/staff/${user.id}`, payload: { disabled: false } });
    await db.updateTable("staff_users").set({ locked_until: new Date(Date.now() + 600_000) }).where("id", "=", user.id).execute();
    assert.equal((await signInWithPassword(app, user.email, PASSWORD)).statusCode, 423);
    assert.equal((await admin.inject({ method: "POST", url: `/api/admin/staff/${user.id}/unlock` })).json().locked, false);
    assert.equal((await signInWithPassword(app, user.email, PASSWORD)).statusCode, 200);

    const actions = (await admin.inject({ url: "/api/admin/activity?kind=staff" })).json().items.map((e: any) => e.action);
    assert.deepEqual(actions, ["staff.unlocked", "staff.enabled", "staff.disabled"]);
  });

  it("creates the first Super Admin once, with the setup command", () => {
    const script = fileURLToPath(new URL("../scripts/create-admin.ts", import.meta.url));
    const env = {
      PATH: process.env.PATH,
      NODE_ENV: "test",
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      PUBLIC_SITE_URL: "http://localhost:5173/ftcci",
      SMTP_HOST: "127.0.0.1",
      MAIL_FROM: "FTCCI <noreply@ftcci.in>",
      BOOKING_NOTIFY_EMAIL: "a@ftcci.test",
      MEMBERSHIP_NOTIFY_EMAIL: "a@ftcci.test",
      EVENTS_NOTIFY_EMAIL: "a@ftcci.test",
      CONTACT_NOTIFY_EMAIL: "a@ftcci.test",
      NEWSLETTER_NOTIFY_EMAIL: "a@ftcci.test",
      ALTCHA_HMAC_SECRET: "test-secret-test-secret-test-secret-0123",
      MEDIA_DIR: process.env.TEST_MEDIA_DIR,
    };
    const run = (...args: string[]) => spawnSync(process.execPath, [script, ...args], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const first = run("--email", "Head@FTCCI.test", "--name", "Head of IT");
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /Created Super Admin Head of IT <head@ftcci.test>/);
    const again = run("--email", "other@ftcci.test", "--name", "Someone Else");
    assert.equal(again.status, 1);
    assert.match(again.stderr, /A Super Admin already exists/);
    assert.equal(run("--email", "not-an-email", "--name", "X").status, 1);
  });
});
