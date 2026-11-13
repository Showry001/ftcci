import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { db, hallBooking, makeApp, proof, publishHalls, resetDb, signedIn } from "./helpers.ts";

async function seed(app: any, data = hallBooking()) {
  return (await app.inject({ method: "POST", url: "/api/forms/hall-booking", payload: { data, altcha: await proof(app) } })).json().reference as string;
}

describe("admin API (local only until sign-in exists)", () => {
  beforeEach(async () => {
    await resetDb();
    await publishHalls();
  });

  it("lists, filters, searches and opens submissions from this computer", async () => {
    const { app, admin } = await makeApp();
    const a = await seed(app);
    await seed(app, { ...hallBooking(), company: "100% Pure Foods", contact: "Ravi Kumar", email: "ravi@pure.example" });

    const list = (await admin.inject({ url: "/api/admin/submissions?type=hall_booking" })).json();
    assert.equal(list.total, 2);
    assert.deepEqual(list.counts, { new: 2, contacted: 0, closed: 0 });
    assert.equal(list.items[0].reference.endsWith("000002"), true);

    const percent = (await admin.inject({ url: `/api/admin/submissions?type=hall_booking&q=${encodeURIComponent("100%")}` })).json();
    assert.deepEqual(percent.items.map((i: any) => i.organisation), ["100% Pure Foods"]);
    const wildcard = (await admin.inject({ url: `/api/admin/submissions?type=hall_booking&q=${encodeURIComponent("%")}` })).json();
    assert.equal(wildcard.total, 1, "% is searched literally");

    const detail = (await admin.inject({ url: `/api/admin/submissions/${a}` })).json();
    assert.equal(detail.submission.reference, a);
    assert.equal(detail.submission.id, undefined);
    assert.equal(detail.emails.length, 2);
  });

  it("changes status and notes", async () => {
    const { app, admin } = await makeApp();
    const ref = await seed(app);
    const res = await admin.inject({ method: "PATCH", url: `/api/admin/submissions/${ref}`, payload: { status: "contacted", notes: "Called on 30 Oct\r\nHeld till Friday" } });
    assert.equal(res.statusCode, 200);
    const row = await db.selectFrom("submissions").selectAll().where("reference", "=", ref).executeTakeFirstOrThrow();
    assert.equal(row.status, "contacted");
    assert.equal(row.notes, "Called on 30 Oct\nHeld till Friday");
    assert.equal((await admin.inject({ method: "PATCH", url: `/api/admin/submissions/${ref}`, payload: { status: "deleted" } })).statusCode, 400);
    assert.equal((await admin.inject({ method: "PATCH", url: `/api/admin/submissions/${ref}`, payload: {} })).statusCode, 400);
  });

  it("retries a failed email on request", async () => {
    const { app, admin, mailer, transport } = await makeApp();
    const ref = await seed(app);
    await mailer.flush();
    await db.updateTable("email_outbox").set({ status: "failed", attempts: 8, last_error: "535" }).execute();
    const { emails } = (await admin.inject({ url: `/api/admin/submissions/${ref}` })).json();
    const res = await admin.inject({ method: "POST", url: `/api/admin/emails/${emails[0].id}/retry` });
    assert.equal(res.json().email.status, "sent");
    assert.equal((await admin.inject({ method: "POST", url: `/api/admin/emails/${emails[0].id}/retry` })).statusCode, 409);
    assert.equal(transport.sent.length, 3);
  });

  it("needs a signed-in account, and for changes the admin's own pages and its CSRF token", async () => {
    const { app, admin } = await makeApp();
    const ref = await seed(app);
    const url = `/api/admin/submissions/${ref}`;
    const res = await app.inject({ url: "/api/admin/summary" });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, "sign_in");
    assert.equal((await admin.inject({ url: "/api/admin/summary" })).statusCode, 200);

    const change = { method: "PATCH" as const, url, payload: { status: "closed" } };
    assert.equal((await admin.inject({ ...change, headers: { "x-csrf-token": "wrong".padEnd(43, "x") } })).statusCode, 403);
    assert.equal((await admin.inject({ ...change, headers: { origin: "https://evil.example" } })).statusCode, 403);
    const { cookie } = admin.headers;
    assert.equal((await app.inject({ ...change, headers: { cookie, origin: admin.headers.origin } })).statusCode, 403, "no CSRF token");
    assert.equal((await admin.inject(change)).statusCode, 200);
  });

  it("keeps staff accounts, the activity log and the bin for Super Admins", async () => {
    const { app } = await makeApp();
    const staff = await signedIn(app, "admin");
    assert.equal((await staff.inject({ url: "/api/admin/submissions?type=contact" })).statusCode, 200);
    for (const url of ["/api/admin/staff", "/api/admin/activity", "/api/admin/bin"]) {
      const res = await staff.inject({ url });
      assert.equal(res.statusCode, 403, url);
      assert.equal(res.json().message, "Only a Super Admin can do this.");
    }
  });
});
