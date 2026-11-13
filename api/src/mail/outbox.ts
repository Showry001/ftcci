// Every email is saved to the email_outbox table in the same transaction as the form it belongs to,
// then sent by a background loop. If SMTP is down the submission is still saved; the email is retried
// with growing gaps and, after the last attempt, marked "failed" so staff can see and retry it.
import { fileURLToPath } from "node:url";
import type { FastifyBaseLogger } from "fastify";
import { sql } from "kysely";
import type { Address, Config } from "../config.ts";
import type { Db, OutboxRow } from "../db/schema.ts";
import { forgetExpiredProofs } from "../lib/altcha.ts";
import type { Email } from "./templates.ts";

export interface MailMessage {
  from: Address;
  to: Address;
  replyTo?: Address;
  subject: string;
  html: string;
  text: string;
  attachments: { filename: string; path: string; cid: string }[];
}
/** The part of a Nodemailer transport the outbox uses (tests pass a fake). */
export interface Transport {
  sendMail(message: MailMessage): Promise<unknown>;
}

export const MAX_ATTEMPTS = 8;
// Wait after attempt 1, 2, … before trying again: 1 min, 5 min, 15 min, 1 h, 3 h, 6 h, 12 h (about a day in all).
const RETRY_DELAYS_S = [60, 300, 900, 3600, 10_800, 21_600, 43_200];
const POLL_MS = 15_000;
const LOCK = "2 minutes";
const LOGO = fileURLToPath(new URL("./logo.png", import.meta.url));

export const retryDelaySeconds = (attempts: number) => RETRY_DELAYS_S[Math.min(attempts, RETRY_DELAYS_S.length) - 1];

export interface Enqueue {
  kind: string;
  to: string;
  email: Email;
  replyTo?: string | null;
  submissionId?: number;
  subscriberId?: number;
}

export async function enqueue(db: Db, item: Enqueue): Promise<void> {
  await db
    .insertInto("email_outbox")
    .values({
      kind: item.kind,
      to_address: item.to,
      subject: item.email.subject,
      html: item.email.html,
      text_body: item.email.text,
      reply_to: item.replyTo ?? null,
      submission_id: item.submissionId ?? null,
      subscriber_id: item.subscriberId ?? null,
    })
    .execute();
}

// Caps how many emails one visitor address can be sent in an hour, so a form can't be used to flood
// someone else's inbox.
export async function recentlyMailed(db: Db, address: string, kinds: string[]): Promise<number> {
  const row = await db
    .selectFrom("email_outbox")
    .select((eb) => eb.fn.countAll<string>().as("n"))
    .where(sql<boolean>`lower(to_address) = ${address.toLowerCase()}`)
    .where("kind", "in", kinds)
    .where("created_at", ">", sql<Date>`now() - interval '1 hour'`)
    .executeTakeFirstOrThrow();
  return Number(row.n);
}

const shortError = (err: unknown) => (err instanceof Error ? err.message : String(err)).replace(/\s+/g, " ").slice(0, 500);

export function createMailer(db: Db, transport: Transport, config: Config, log: FastifyBaseLogger) {
  let timer: NodeJS.Timeout | undefined;
  let running: Promise<void> | null = null;
  let again = false;
  let lastCleanup = 0;

  async function claim(): Promise<OutboxRow[]> {
    const { rows } = await sql<OutboxRow>`
      update email_outbox
      set status = 'sending', attempts = attempts + 1, locked_until = now() + ${sql.raw(`interval '${LOCK}'`)}
      where id in (
        select id from email_outbox
        where (status = 'pending' and next_attempt_at <= now()) or (status = 'sending' and locked_until < now())
        order by next_attempt_at
        limit 10
        for update skip locked
      )
      returning *
    `.execute(db);
    return rows;
  }

  async function deliver(row: OutboxRow): Promise<void> {
    try {
      await transport.sendMail({
        from: config.mailFrom,
        to: { name: "", address: row.to_address },
        replyTo: row.reply_to ? { name: "", address: row.reply_to } : undefined,
        subject: row.subject,
        html: row.html,
        text: row.text_body,
        attachments: [{ filename: "ftcci-logo.png", path: LOGO, cid: "ftcci-logo" }],
      });
      await db
        .updateTable("email_outbox")
        .set({ status: "sent", sent_at: new Date(), locked_until: null, last_error: null })
        .where("id", "=", row.id)
        .execute();
      log.info({ outboxId: row.id, kind: row.kind }, "Email sent");
    } catch (err) {
      const final = row.attempts >= MAX_ATTEMPTS;
      await db
        .updateTable("email_outbox")
        .set({
          status: final ? "failed" : "pending",
          locked_until: null,
          last_error: shortError(err),
          next_attempt_at: final ? new Date() : new Date(Date.now() + retryDelaySeconds(row.attempts) * 1000),
        })
        .where("id", "=", row.id)
        .execute();
      log.warn({ outboxId: row.id, kind: row.kind, attempts: row.attempts, final, error: shortError(err) }, "Email send failed");
    }
  }

  async function runOnce(): Promise<void> {
    for (let batch = await claim(); batch.length; batch = await claim()) {
      for (const row of batch) await deliver(row);
    }
    if (Date.now() - lastCleanup > 3_600_000) {
      lastCleanup = Date.now();
      await forgetExpiredProofs(db);
    }
  }

  /** Sends whatever is due now. Calls that arrive mid-run queue one more pass. */
  function flush(): Promise<void> {
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      do {
        again = false;
        try {
          await runOnce();
        } catch (err) {
          log.error({ error: shortError(err) }, "Email outbox run failed");
        }
      } while (again);
      running = null;
    })();
    return running;
  }

  /**
   * Sends an email at once without storing it: sign-in codes and reset links must not sit in the
   * database. Tries twice; a failure is logged (without the email's content) and not retried later.
   */
  async function sendNow(kind: string, to: string, email: Email): Promise<boolean> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await transport.sendMail({
          from: config.mailFrom,
          to: { name: "", address: to },
          subject: email.subject,
          html: email.html,
          text: email.text,
          attachments: [{ filename: "ftcci-logo.png", path: LOGO, cid: "ftcci-logo" }],
        });
        log.info({ kind }, "Email sent");
        return true;
      } catch (err) {
        log.warn({ kind, attempt, error: shortError(err) }, "Email send failed");
      }
    }
    return false;
  }

  return {
    flush,
    sendNow,
    start() {
      timer = setInterval(() => void flush(), POLL_MS);
      void flush();
    },
    async stop() {
      clearInterval(timer);
      await running;
    },
  };
}

export type Mailer = ReturnType<typeof createMailer>;
