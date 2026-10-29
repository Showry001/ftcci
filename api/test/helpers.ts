import { after } from "node:test";
import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/sha";
import { sql } from "kysely";
import { buildApp } from "../src/app.ts";
import { loadConfig, type Config } from "../src/config.ts";
import { createDb } from "../src/db/index.ts";
import type { MailMessage, Transport } from "../src/mail/outbox.ts";

export const db = createDb(process.env.TEST_DATABASE_URL!);
after(() => db.destroy());

export function testConfig(overrides: Record<string, string> = {}): Config {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    PUBLIC_SITE_URL: "http://localhost:5173/ftcci",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: "1025",
    MAIL_FROM: "FTCCI <noreply@ftcci.in>",
    BOOKING_NOTIFY_EMAIL: "bookings@ftcci.test",
    MEMBERSHIP_NOTIFY_EMAIL: "membership@ftcci.test",
    EVENTS_NOTIFY_EMAIL: "events@ftcci.test",
    CONTACT_NOTIFY_EMAIL: "info@ftcci.test",
    NEWSLETTER_NOTIFY_EMAIL: "news@ftcci.test",
    ALTCHA_HMAC_SECRET: "test-secret-test-secret-test-secret-0123",
    ...overrides,
  });
  // Keep the proof-of-work tiny so tests stay fast.
  config.altcha.counterMin = 1;
  config.altcha.counterMax = 50;
  return config;
}

export function fakeTransport() {
  const sent: MailMessage[] = [];
  let failure: Error | null = null;
  const transport: Transport & { sent: MailMessage[]; fail(e: Error | null): void } = {
    sent,
    fail(e) {
      failure = e;
    },
    async sendMail(message) {
      if (failure) throw failure;
      sent.push(message);
      return {};
    },
  };
  return transport;
}

export async function makeApp(overrides: Record<string, string> = {}) {
  const config = testConfig(overrides);
  const transport = fakeTransport();
  const { app, mailer } = await buildApp({ config, db, transport, logger: false });
  after(() => app.close());
  return { app, mailer, transport, config };
}

export async function resetDb() {
  await sql`truncate email_outbox, submissions, newsletter_subscribers, reference_counters, altcha_used restart identity cascade`.execute(db);
}

/** Fetches and solves a challenge the way the browser does. */
export async function proof(app: Awaited<ReturnType<typeof makeApp>>["app"]): Promise<string> {
  const challenge = (await app.inject({ method: "GET", url: "/api/altcha" })).json();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString("base64");
}

export const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const hallBooking = () => ({
  halls: ["FTCCI Surana Auditorium (A/C)"],
  date: inDays(14),
  from: "10:00",
  to: "13:00",
  purpose: "Members' meet",
  company: "Deccan Traders",
  email: "priya@deccan.example",
  contact: "Priya Rao",
  cell: "+91 99887 76655",
});
