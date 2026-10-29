import { displayValue } from "../../../shared/forms.js";
import type { Config } from "../config.ts";
import type { Db, SubmissionType } from "../db/schema.ts";
import { enqueue, recentlyMailed } from "../mail/outbox.ts";
import { type FormName, staffNotification, visitorAcknowledgement } from "../mail/templates.ts";
import { nextReference } from "./references.ts";

type Values = Record<string, any>;
const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
interface Person {
  name: string;
  email: string;
  phone: string;
  organisation: string;
}

export interface FormEntry {
  form: FormName;
  type: SubmissionType;
  prefix: string;
  notify: (config: Config) => string;
  person: (v: Values) => Person;
  summary: (v: Values) => string;
}

// URL segment under /api/forms/ → how that form is stored and who hears about it.
export const formEntries: Record<string, FormEntry> = {
  "hall-booking": {
    form: "hallBooking",
    type: "hall_booking",
    prefix: "HB",
    notify: (c) => c.notify.hallBooking,
    person: (v) => ({ name: v.contact, email: v.email, phone: v.cell || v.phone || v.office || v.residence, organisation: v.company }),
    summary: (v) => `${v.halls.join(", ")} · ${shortDate(v.date)}, ${v.from}–${v.to}`,
  },
  membership: {
    form: "membership",
    type: "membership",
    prefix: "MA",
    notify: (c) => c.notify.membership,
    person: (v) => ({ name: v.repName, email: v.repEmail, phone: v.repMobile, organisation: v.organisation }),
    summary: (v) => `${displayValue("membership", "panel", v.panel)} · ${v.membershipType || "Annual"}`,
  },
  "event-interest": {
    form: "eventInterest",
    type: "event_interest",
    prefix: "EV",
    notify: (c) => c.notify.eventInterest,
    person: (v) => ({ name: v.name, email: v.email, phone: v.mobile, organisation: v.organisation }),
    summary: (v) => `${v.eventTitle} · ${v.attendees} attending`,
  },
  contact: {
    form: "contact",
    type: "contact",
    prefix: "CT",
    notify: (c) => c.notify.contact,
    person: (v) => ({ name: v.name, email: v.email, phone: v.phone, organisation: "" }),
    summary: (v) => v.subject,
  },
};

/** Emails sent to visitor addresses; together capped per address per hour. */
export const VISITOR_KINDS = ["hall_booking_ack", "membership_ack", "event_interest_ack", "contact_ack", "newsletter_confirm"];
export const VISITOR_EMAILS_PER_HOUR = 3;

/** Saves a validated submission and queues its emails in one transaction. Returns the reference. */
export async function createSubmission(db: Db, config: Config, entry: FormEntry, values: Values, now = new Date()): Promise<string> {
  const person = entry.person(values);
  return db.transaction().execute(async (trx) => {
    const reference = await nextReference(trx, entry.prefix, now);
    const { id } = await trx
      .insertInto("submissions")
      .values({
        type: entry.type,
        reference,
        name: person.name,
        email: person.email,
        phone: person.phone ?? "",
        organisation: person.organisation ?? "",
        summary: entry.summary(values),
        data: JSON.stringify(values),
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await enqueue(trx, {
      kind: `${entry.type}_notify`,
      to: entry.notify(config),
      email: staffNotification(entry.form, reference, values, person, now),
      replyTo: person.email,
      submissionId: id,
    });
    if ((await recentlyMailed(trx, person.email, VISITOR_KINDS)) < VISITOR_EMAILS_PER_HOUR) {
      await enqueue(trx, {
        kind: `${entry.type}_ack`,
        to: person.email,
        email: visitorAcknowledgement(entry.form, reference, values, person.name),
        replyTo: config.mailReplyTo,
        submissionId: id,
      });
    }
    return reference;
  });
}
