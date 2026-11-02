import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { displayValue, isEmail, todayInIndia, validate } from "../../shared/forms.js";

// 29 Oct 2026, 10:00 IST
const now = new Date("2026-10-29T04:30:00Z");
// Hall names come from the published Services page.
const options = { halls: ["OPT Board Room (A/C)", "FTCCI Surana Auditorium (A/C)"] };

describe("shared form rules", () => {
  it("trims, collapses whitespace and strips control and direction characters", () => {
    const { values } = validate("contact", { name: "  Ravi‮  Kumar ", email: "r@x.in", subject: "Events", message: "Hi\r\n\r\n\r\n\r\nthere\u0007", agree: true });
    assert.equal(values.name, "Ravi Kumar");
    assert.equal(values.message, "Hi\n\nthere");
  });

  it("drops fields a form does not define", () => {
    const { values } = validate("newsletterQuick", { email: "a@b.in", admin: true, __proto__: { x: 1 } });
    assert.deepEqual(Object.keys(values), ["email"]);
  });

  it("accepts one plain email address only", () => {
    for (const ok of ["a@b.in", "first.last+tag@sub.example.co.in"]) assert.ok(isEmail(ok), ok);
    for (const bad of ['"a"@b.in', "a@b", "a,b@c.in", "a@b.in, c@d.in", "<a@b.in>", "a b@c.in", "a@b.in\nBcc: x@y.in", "a@-b.in"]) {
      assert.ok(!isEmail(bad), bad);
    }
  });

  it("checks phone, PIN, GST, IEC and website formats", () => {
    const { errors, values } = validate("membership", {
      phone: "040-2339 5515",
      pin: "500 004",
      gst: "36aaaca1234a1z5",
      iec: "abcde12345",
      website: "javascript:alert(1)",
      repMobile: "12345",
    });
    assert.equal(values.phone, "040-2339 5515");
    assert.equal(values.pin, "500004");
    assert.equal(values.gst, "36AAACA1234A1Z5");
    assert.equal(values.iec, "ABCDE12345");
    assert.match(errors.website, /website/);
    assert.match(errors.repMobile, /phone number/);
  });

  it("keeps bookings between today (IST) and two years ahead", () => {
    const base = { halls: ["OPT Board Room (A/C)"], from: "10:00", to: "11:00", company: "A", email: "a@b.in", contact: "A" };
    assert.equal(todayInIndia(now), "2026-10-29");
    assert.equal(validate("hallBooking", { ...base, date: "2026-10-29" }, { now, options }).ok, true);
    assert.match(validate("hallBooking", { ...base, date: "2026-10-28" }, { now, options }).errors.date, /today/);
    assert.match(validate("hallBooking", { ...base, date: "2029-01-01" }, { now, options }).errors.date, /two years/);
    assert.match(validate("hallBooking", { ...base, date: "2026-02-30" }, { now, options }).errors.date, /valid date/);
  });

  it("needs the end time after the start time", () => {
    const { errors } = validate("hallBooking", { from: "14:00", to: "09:30" }, { fields: ["from", "to"] });
    assert.equal(errors.to, "The end time must be after the start time.");
  });

  it("only accepts listed options and validates one step at a time", () => {
    assert.match(validate("hallBooking", { halls: ["Main Hall"] }, { fields: ["halls"], options }).errors.halls, /from the list/);
    assert.equal(validate("hallBooking", { halls: [] }, { fields: ["halls"], options }).errors.halls, "Select at least one hall to continue.");
    // Without the Services page's halls nothing can be booked.
    assert.match(validate("hallBooking", { halls: ["OPT Board Room (A/C)"] }, { fields: ["halls"] }).errors.halls, /from the list/);
    const step = validate("hallBooking", { halls: ["OPT Board Room (A/C)"] }, { fields: ["halls"], options });
    assert.deepEqual(step, { ok: true, values: { halls: ["OPT Board Room (A/C)"] }, errors: {} });
  });

  it("rejects wrong types and over-long text", () => {
    const { errors } = validate("eventInterest", { name: ["x"], message: "x".repeat(501), attendees: "11", event: "Bad Slug!" });
    assert.match(errors.name, /not valid/);
    assert.match(errors.message, /500 characters/);
    assert.match(errors.attendees, /between 1 and 10/);
    assert.match(errors.event, /not valid/);
  });

  it("requires consent where the form asks for it", () => {
    assert.match(validate("contact", { agree: "true" }).errors.agree, /Privacy Policy/);
    assert.equal(validate("contact", { agree: true }).errors.agree, undefined);
  });

  it("formats stored values for emails and the admin", () => {
    assert.equal(displayValue("membership", "panel", "e"), "MSMEs");
    assert.equal(displayValue("hallBooking", "member", "yes"), "Yes");
    assert.equal(displayValue("hallBooking", "equipment", ["Wifi", "LED TV"]), "Wifi, LED TV");
    assert.equal(displayValue("hallBooking", "fax", ""), "");
  });
});
