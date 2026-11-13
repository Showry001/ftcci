// Newsletter sign-ups use double opt-in: an address is only added once its owner clicks the link in
// the confirmation email. Responses never reveal whether an address is already on the list.
import { createHash, randomBytes } from "node:crypto";
import type { Config } from "../config.ts";
import type { Db } from "../db/schema.ts";
import { enqueue, recentlyMailed } from "../mail/outbox.ts";
import { newsletterConfirmation, newsletterNotification } from "../mail/templates.ts";
import { VISITOR_EMAILS_PER_HOUR, VISITOR_KINDS } from "./submissions.ts";

const TOKEN_DAYS = 7;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export interface SignUp {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  business?: string;
}

export async function subscribe(db: Db, config: Config, input: SignUp, source: "home" | "footer"): Promise<void> {
  const email = input.email.toLowerCase();
  await db.transaction().execute(async (trx) => {
    const existing = await trx.selectFrom("newsletter_subscribers").selectAll().where("email", "=", email).forUpdate().executeTakeFirst();
    if (existing?.status === "confirmed") return;

    const token = randomBytes(32).toString("base64url");
    const fields = {
      first_name: input.firstName || existing?.first_name || "",
      last_name: input.lastName || existing?.last_name || "",
      phone: input.phone || existing?.phone || "",
      business: input.business || existing?.business || "",
      source,
      status: "pending" as const,
      token_hash: hashToken(token),
      token_expires_at: new Date(Date.now() + TOKEN_DAYS * 86_400_000),
      consent_at: new Date(),
    };
    const { id } = existing
      ? await trx.updateTable("newsletter_subscribers").set({ ...fields, updated_at: new Date() }).where("id", "=", existing.id).returning("id").executeTakeFirstOrThrow()
      : await trx.insertInto("newsletter_subscribers").values({ email, ...fields }).returning("id").executeTakeFirstOrThrow();

    if ((await recentlyMailed(trx, email, VISITOR_KINDS)) >= VISITOR_EMAILS_PER_HOUR) return;
    const link = `${config.publicSiteUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`;
    await enqueue(trx, { kind: "newsletter_confirm", to: email, email: newsletterConfirmation(link), replyTo: config.mailReplyTo, subscriberId: id });
  });
}

/** Confirms a sign-up from its emailed token. False when the link is unknown, used or expired. */
export async function confirm(db: Db, config: Config, token: string): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const row = await trx
      .updateTable("newsletter_subscribers")
      .set({ status: "confirmed", confirmed_at: new Date(), token_hash: null, token_expires_at: null, updated_at: new Date() })
      .where("token_hash", "=", hashToken(token))
      .where("status", "=", "pending")
      .where("token_expires_at", ">", new Date())
      .returningAll()
      .executeTakeFirst();
    if (!row) return false;
    await enqueue(trx, { kind: "newsletter_notify", to: config.notify.newsletter, email: newsletterNotification(row), replyTo: row.email, subscriberId: row.id });
    return true;
  });
}
