import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { sql } from "kysely";
import { db, makeApp, proof, resetDb } from "./helpers.ts";

const signUp = { firstName: "Meena", lastName: "Iyer", phone: "+91 91234 56789", email: "Meena@Example.com", consent: true };
const tokenFrom = (text: string) => /token=([A-Za-z0-9_-]+)/.exec(text)?.[1] ?? "";

describe("newsletter double opt-in", () => {
  beforeEach(resetDb);

  it("adds an address only after its owner confirms, then tells staff", async () => {
    const { app, mailer, transport } = await makeApp();
    const res = await app.inject({ method: "POST", url: "/api/newsletter", payload: { data: signUp, source: "home", altcha: await proof(app) } });
    assert.equal(res.statusCode, 202);
    await mailer.flush();

    const pending = await db.selectFrom("newsletter_subscribers").selectAll().executeTakeFirstOrThrow();
    assert.equal(pending.email, "meena@example.com");
    assert.equal(pending.status, "pending");
    assert.notEqual(pending.token_hash, null);

    const [confirmEmail] = transport.sent;
    assert.equal(confirmEmail.to.address, "meena@example.com");
    const token = tokenFrom(confirmEmail.text);
    assert.ok(token.length >= 40);
    assert.ok(!pending.token_hash!.includes(token), "only a hash of the token is stored");

    const ok = await app.inject({ method: "POST", url: "/api/newsletter/confirm", payload: { token } });
    assert.equal(ok.statusCode, 200);
    await mailer.flush();
    const confirmed = await db.selectFrom("newsletter_subscribers").selectAll().executeTakeFirstOrThrow();
    assert.equal(confirmed.status, "confirmed");
    assert.equal(transport.sent[1].to.address, "news@ftcci.test");

    const again = await app.inject({ method: "POST", url: "/api/newsletter/confirm", payload: { token } });
    assert.equal(again.statusCode, 400);
  });

  it("answers the same way for addresses already on the list, without emailing them", async () => {
    const { app, mailer, transport } = await makeApp();
    await app.inject({ method: "POST", url: "/api/newsletter", payload: { data: { email: "x@example.com" }, source: "footer", altcha: await proof(app) } });
    await sql`update newsletter_subscribers set status = 'confirmed', token_hash = null`.execute(db);
    await mailer.flush();
    const before = transport.sent.length;
    const res = await app.inject({ method: "POST", url: "/api/newsletter", payload: { data: { email: "x@example.com" }, source: "footer", altcha: await proof(app) } });
    assert.equal(res.statusCode, 202);
    assert.deepEqual(res.json(), { status: "check-email" });
    await mailer.flush();
    assert.equal(transport.sent.length, before);
  });

  it("refuses expired links", async () => {
    const { app, mailer, transport } = await makeApp();
    await app.inject({ method: "POST", url: "/api/newsletter", payload: { data: { email: "late@example.com" }, source: "footer", altcha: await proof(app) } });
    await mailer.flush();
    await sql`update newsletter_subscribers set token_expires_at = now() - interval '1 minute'`.execute(db);
    const res = await app.inject({ method: "POST", url: "/api/newsletter/confirm", payload: { token: tokenFrom(transport.sent[0].text) } });
    assert.equal(res.statusCode, 400);
  });

  it("requires consent and the full details on the home page form", async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: "POST", url: "/api/newsletter", payload: { data: { email: "a@b.in" }, source: "home", altcha: await proof(app) } });
    assert.equal(res.statusCode, 400);
    assert.deepEqual(Object.keys(res.json().fields).sort(), ["consent", "firstName", "lastName", "phone"]);
  });
});
