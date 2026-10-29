import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { sql } from "kysely";
import { MAX_ATTEMPTS, retryDelaySeconds } from "../src/mail/outbox.ts";
import { db, hallBooking, makeApp, proof, resetDb } from "./helpers.ts";

const outbox = () => db.selectFrom("email_outbox").selectAll().orderBy("id").execute();
const makeDue = () => sql`update email_outbox set next_attempt_at = now() where status = 'pending'`.execute(db);

describe("email outbox", () => {
  beforeEach(resetDb);

  it("keeps the submission and confirms it to the visitor even when SMTP is down", async () => {
    const { app, mailer, transport } = await makeApp();
    transport.fail(new Error("connect ECONNREFUSED 127.0.0.1:465"));
    const res = await app.inject({ method: "POST", url: "/api/forms/hall-booking", payload: { data: hallBooking(), altcha: await proof(app) } });
    assert.equal(res.statusCode, 201);
    await mailer.flush();

    const rows = await outbox();
    assert.equal(rows.length, 2);
    for (const row of rows) {
      assert.equal(row.status, "pending");
      assert.equal(row.attempts, 1);
      assert.match(row.last_error ?? "", /ECONNREFUSED/);
      const wait = (row.next_attempt_at.getTime() - Date.now()) / 1000;
      assert.ok(wait > 50 && wait <= 60, `retry in about a minute, got ${wait}s`);
    }
    assert.equal((await db.selectFrom("submissions").selectAll().execute()).length, 1);

    // SMTP comes back: the next run delivers both.
    transport.fail(null);
    await makeDue();
    await mailer.flush();
    assert.deepEqual((await outbox()).map((r) => r.status), ["sent", "sent"]);
    assert.equal(transport.sent.length, 2);
  });

  it("waits longer after each failure and marks the email failed after the last attempt", async () => {
    const { app, mailer, transport } = await makeApp();
    transport.fail(new Error("535 Authentication failed"));
    await app.inject({ method: "POST", url: "/api/forms/hall-booking", payload: { data: hallBooking(), altcha: await proof(app) } });
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await makeDue();
      await mailer.flush();
    }
    const rows = await outbox();
    assert.deepEqual(rows.map((r) => [r.status, r.attempts]), [["failed", MAX_ATTEMPTS], ["failed", MAX_ATTEMPTS]]);
    assert.deepEqual([1, 2, 3, 4].map(retryDelaySeconds), [60, 300, 900, 3600]);
  });

  it("re-sends an email whose sender crashed mid-send once its lock expires", async () => {
    const { app, mailer, transport } = await makeApp();
    transport.fail(new Error("down"));
    await app.inject({ method: "POST", url: "/api/forms/hall-booking", payload: { data: hallBooking(), altcha: await proof(app) } });
    await mailer.flush();
    await sql`update email_outbox set status = 'sending', locked_until = now() - interval '1 second'`.execute(db);
    transport.fail(null);
    await mailer.flush();
    assert.deepEqual((await outbox()).map((r) => r.status), ["sent", "sent"]);
  });
});
