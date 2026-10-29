import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { db, hallBooking, makeApp, proof, resetDb } from "./helpers.ts";

async function seed(app: any, data = hallBooking()) {
  return (await app.inject({ method: "POST", url: "/api/forms/hall-booking", payload: { data, altcha: await proof(app) } })).json().reference as string;
}

describe("admin API (local only until sign-in exists)", () => {
  beforeEach(resetDb);

  it("lists, filters, searches and opens submissions from this computer", async () => {
    const { app } = await makeApp();
    const a = await seed(app);
    await seed(app, { ...hallBooking(), company: "100% Pure Foods", contact: "Ravi Kumar", email: "ravi@pure.example" });

    const list = (await app.inject({ url: "/api/admin/submissions?type=hall_booking" })).json();
    assert.equal(list.total, 2);
    assert.deepEqual(list.counts, { new: 2, contacted: 0, closed: 0 });
    assert.equal(list.items[0].reference.endsWith("000002"), true);

    const percent = (await app.inject({ url: `/api/admin/submissions?type=hall_booking&q=${encodeURIComponent("100%")}` })).json();
    assert.deepEqual(percent.items.map((i: any) => i.organisation), ["100% Pure Foods"]);
    const wildcard = (await app.inject({ url: `/api/admin/submissions?type=hall_booking&q=${encodeURIComponent("%")}` })).json();
    assert.equal(wildcard.total, 1, "% is searched literally");

    const detail = (await app.inject({ url: `/api/admin/submissions/${a}` })).json();
    assert.equal(detail.submission.reference, a);
    assert.equal(detail.submission.id, undefined);
    assert.equal(detail.emails.length, 2);
  });

  it("changes status and notes", async () => {
    const { app } = await makeApp();
    const ref = await seed(app);
    const res = await app.inject({ method: "PATCH", url: `/api/admin/submissions/${ref}`, payload: { status: "contacted", notes: "Called on 30 Oct\r\nHeld till Friday" } });
    assert.equal(res.statusCode, 200);
    const row = await db.selectFrom("submissions").selectAll().where("reference", "=", ref).executeTakeFirstOrThrow();
    assert.equal(row.status, "contacted");
    assert.equal(row.notes, "Called on 30 Oct\nHeld till Friday");
    assert.equal((await app.inject({ method: "PATCH", url: `/api/admin/submissions/${ref}`, payload: { status: "deleted" } })).statusCode, 400);
    assert.equal((await app.inject({ method: "PATCH", url: `/api/admin/submissions/${ref}`, payload: {} })).statusCode, 400);
  });

  it("retries a failed email on request", async () => {
    const { app, mailer, transport } = await makeApp();
    const ref = await seed(app);
    await mailer.flush();
    await db.updateTable("email_outbox").set({ status: "failed", attempts: 8, last_error: "535" }).execute();
    const { emails } = (await app.inject({ url: `/api/admin/submissions/${ref}` })).json();
    const res = await app.inject({ method: "POST", url: `/api/admin/emails/${emails[0].id}/retry` });
    assert.equal(res.json().email.status, "sent");
    assert.equal((await app.inject({ method: "POST", url: `/api/admin/emails/${emails[0].id}/retry` })).statusCode, 409);
    assert.equal(transport.sent.length, 3);
  });

  it("hides the admin API from other computers, proxies, foreign hosts and foreign pages", async () => {
    const { app } = await makeApp();
    const url = "/api/admin/summary";
    assert.equal((await app.inject({ url })).statusCode, 200);
    assert.equal((await app.inject({ url, remoteAddress: "192.168.1.20" })).statusCode, 404);
    assert.equal((await app.inject({ url, headers: { "x-forwarded-for": "203.0.113.5" } })).statusCode, 404);
    assert.equal((await app.inject({ url, headers: { host: "ftcci.in" } })).statusCode, 404);
    assert.equal((await app.inject({ url, headers: { origin: "https://evil.example" } })).statusCode, 404);
  });

  it("does not exist at all in production", async () => {
    const { app } = await makeApp({ NODE_ENV: "production", PUBLIC_SITE_URL: "https://www.ftcci.in" });
    assert.equal((await app.inject({ url: "/api/admin/summary" })).statusCode, 404);
    assert.equal((await app.inject({ url: "/api/admin/submissions?type=contact" })).statusCode, 404);
  });
});
