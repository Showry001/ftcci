import { after } from "node:test";
import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/sha";
import { sql } from "kysely";
import sharp from "sharp";
import { buildApp } from "../src/app.ts";
import { loadConfig, type Config } from "../src/config.ts";
import { bumpContentVersion } from "../src/content/cache.ts";
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
    MEDIA_DIR: process.env.TEST_MEDIA_DIR,
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
  await sql`truncate email_outbox, submissions, newsletter_subscribers, reference_counters, altcha_used,
    documents, document_versions, document_media, media, jobs restart identity cascade`.execute(db);
  bumpContentVersion();
}

export const HALLS = ["K.L.N. Prasad Auditorium (A/C)", "FTCCI Surana Auditorium (A/C)", "OPT Board Room (A/C)"];

/** Publishes a Services page with halls; the booking form only accepts halls listed there. */
export async function publishHalls(names = HALLS) {
  const data = JSON.stringify({ halls: names.map((name) => ({ name })) });
  await db
    .insertInto("documents")
    .values({ type: "services", slug: null, status: "published", data, published_data: data, title: "Services page", sort_date: null, publish_at: null, published_at: new Date(), has_changes: false })
    .execute();
  bumpContentVersion();
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

/** A JPEG of one random colour, so every call is a different file. */
export function testImage({ width = 1600, height = 900, exif }: { width?: number; height?: number; exif?: Record<string, Record<string, string>> } = {}) {
  const background = { r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) };
  const image = sharp({ create: { width, height, channels: 3, background } }).jpeg();
  return (exif ? image.withExif(exif) : image).toBuffer();
}

export const testPdf = () => Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n% ${Math.random()}\ntrailer<</Root 1 0 R>>\n%%EOF\n`);

/** Uploads a file to the media library the way the admin does (multipart, fields before the file). */
export async function upload(app: Awaited<ReturnType<typeof makeApp>>["app"], file: { name: string; data: Buffer; type?: string }, fields: Record<string, string> = {}, remoteAddress = "127.0.0.1") {
  const boundary = `----ftcci${Math.random().toString(16).slice(2)}`;
  const parts: Buffer[] = Object.entries(fields).map(([k, v]) => Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
  parts.push(
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type ?? "application/octet-stream"}\r\n\r\n`),
    file.data,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  );
  return app.inject({ method: "POST", url: "/api/admin/media", payload: Buffer.concat(parts), headers: { "content-type": `multipart/form-data; boundary=${boundary}` }, remoteAddress });
}
