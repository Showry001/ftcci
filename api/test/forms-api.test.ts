import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { db, hallBooking, makeApp, proof, resetDb } from "./helpers.ts";

const post = (app: any, form: string, payload: object, remoteAddress = "203.0.113.10") =>
  app.inject({ method: "POST", url: `/api/forms/${form}`, payload, remoteAddress });

describe("form submissions", () => {
  beforeEach(resetDb);

  it("saves a hall booking as New, returns its reference and emails staff and the visitor", async () => {
    const { app, mailer, transport } = await makeApp();
    const res = await post(app, "hall-booking", { data: hallBooking(), altcha: await proof(app), hp: "" });
    assert.equal(res.statusCode, 201);
    const { reference } = res.json();
    assert.match(reference, /^FTCCI-HB-\d{4}-000001$/);

    const row = await db.selectFrom("submissions").selectAll().where("reference", "=", reference).executeTakeFirstOrThrow();
    assert.equal(row.status, "new");
    assert.equal(row.type, "hall_booking");
    assert.equal(row.name, "Priya Rao");
    assert.deepEqual(row.data.halls, ["FTCCI Surana Auditorium (A/C)"]);

    await mailer.flush();
    const [staff, visitor] = transport.sent;
    assert.equal(staff.to.address, "bookings@ftcci.test");
    assert.equal(staff.replyTo?.address, "priya@deccan.example");
    assert.match(staff.subject, new RegExp(reference));
    assert.match(staff.text, /Members' meet/);
    assert.equal(visitor.to.address, "priya@deccan.example");
    assert.match(visitor.subject, new RegExp(reference));
    assert.match(visitor.html, /cid:ftcci-logo/);
    assert.match(visitor.text, /not a confirmed booking/);
    assert.equal(staff.attachments[0].cid, "ftcci-logo");
  });

  it("escapes what visitors type before it goes into the staff email", async () => {
    const { app, mailer, transport } = await makeApp();
    const data = { ...hallBooking(), purpose: '<img src=x onerror="alert(1)">', company: "A & B <Co>" };
    assert.equal((await post(app, "hall-booking", { data, altcha: await proof(app) })).statusCode, 201);
    await mailer.flush();
    const html = transport.sent[0].html;
    assert.ok(!html.includes("<img src=x"));
    assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
    assert.match(html, /A &amp; B &lt;Co&gt;/);
  });

  it("rejects invalid details with field messages and saves nothing", async () => {
    const { app } = await makeApp();
    const res = await post(app, "hall-booking", { data: { ...hallBooking(), email: "not-an-email", halls: [] }, altcha: await proof(app) });
    assert.equal(res.statusCode, 400);
    assert.deepEqual(Object.keys(res.json().fields).sort(), ["email", "halls"]);
    assert.equal((await db.selectFrom("submissions").selectAll().execute()).length, 0);
  });

  it("turns away bots: honeypot, missing, forged and replayed proofs", async () => {
    const { app } = await makeApp();
    const data = hallBooking();
    assert.equal((await post(app, "hall-booking", { data, altcha: await proof(app), hp: "http://spam" })).statusCode, 400);
    assert.equal((await post(app, "hall-booking", { data })).statusCode, 403);
    assert.equal((await post(app, "hall-booking", { data, altcha: Buffer.from('{"challenge":{},"solution":{}}').toString("base64") })).statusCode, 403);
    const altcha = await proof(app);
    assert.equal((await post(app, "hall-booking", { data, altcha })).statusCode, 201);
    assert.equal((await post(app, "hall-booking", { data, altcha })).statusCode, 403);
    assert.equal((await db.selectFrom("submissions").selectAll().execute()).length, 1);
  });

  it("limits each visitor to five submissions in ten minutes", async () => {
    const { app } = await makeApp();
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await post(app, "contact", { data: {} }, "198.51.100.7")).statusCode);
    assert.deepEqual(codes, [400, 400, 400, 400, 400, 429]);
    assert.equal((await post(app, "contact", { data: {} }, "198.51.100.8")).statusCode, 400);
  });

  it("caps confirmation emails to one address at three an hour, but still saves and notifies staff", async () => {
    const { app, mailer, transport } = await makeApp();
    const data = { name: "Asha", email: "asha@example.org", subject: "Events", message: "Hello", agree: true };
    for (let i = 0; i < 4; i++) {
      assert.equal((await post(app, "contact", { data, altcha: await proof(app) }, `192.0.2.${i}`)).statusCode, 201);
    }
    await mailer.flush();
    assert.equal(transport.sent.filter((m) => m.to.address === "asha@example.org").length, 3);
    assert.equal(transport.sent.filter((m) => m.to.address === "info@ftcci.test").length, 4);
  });

  it("refuses non-JSON posts, unknown forms and unknown routes with plain messages", async () => {
    const { app } = await makeApp();
    const text = await app.inject({ method: "POST", url: "/api/forms/contact", headers: { "content-type": "text/plain" }, payload: "x" });
    assert.equal(text.statusCode, 415);
    assert.equal((await post(app, "payments", { data: {} })).statusCode, 400);
    const missing = await app.inject({ method: "GET", url: "/api/nothing" });
    assert.deepEqual(missing.json(), { error: "not_found", message: "Not found." });
    assert.equal(missing.headers["x-content-type-options"], "nosniff");
    assert.equal(missing.headers["cache-control"], "no-store");
  });

  it("stores each kind of form under its own reference series", async () => {
    const { app } = await makeApp();
    const membership = {
      organisation: "Sri Lakshmi Polymers", constitution: "LLP", panel: "e", business: ["Manufacturing"], activities: "PVC pipes",
      address: "Plot 12, IDA Cherlapally", city: "Hyderabad", pin: "500051", email: "info@slp.example", repName: "K. Srinivas",
      repDesignation: "Director", repEmail: "k@slp.example", repMobile: "+91 90000 11122",
    };
    const event = { event: "urban-farming-expo-2026", eventTitle: "Urban Farming Expo", name: "Anita", email: "anita@example.org", mobile: "98480 00011", attendees: 2 };
    const refs = [
      (await post(app, "membership", { data: membership, altcha: await proof(app) })).json().reference,
      (await post(app, "event-interest", { data: event, altcha: await proof(app) })).json().reference,
    ];
    assert.match(refs[0], /^FTCCI-MA-/);
    assert.match(refs[1], /^FTCCI-EV-/);
  });
});
