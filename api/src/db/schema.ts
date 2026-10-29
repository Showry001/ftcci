import type { ColumnType, Generated, Kysely, Selectable } from "kysely";

export type SubmissionType = "hall_booking" | "membership" | "event_interest" | "contact";
export type SubmissionStatus = "new" | "contacted" | "closed";
export type OutboxStatus = "pending" | "sending" | "sent" | "failed";
export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

type CreatedAt = ColumnType<Date, never, never>;
type UpdatedAt = ColumnType<Date, never, Date>;

export interface ReferenceCountersTable {
  prefix: string;
  year: number;
  last_value: number;
}

export interface SubmissionsTable {
  id: Generated<number>;
  type: SubmissionType;
  reference: string;
  status: ColumnType<SubmissionStatus, SubmissionStatus | undefined, SubmissionStatus>;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  summary: string;
  // Written as a JSON string; read back as the parsed object.
  data: ColumnType<Record<string, unknown>, string, string>;
  notes: ColumnType<string, string | undefined, string>;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
}

export interface NewsletterSubscribersTable {
  id: Generated<number>;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  business: string;
  source: "home" | "footer";
  status: ColumnType<SubscriberStatus, SubscriberStatus | undefined, SubscriberStatus>;
  token_hash: string | null;
  token_expires_at: Date | null;
  consent_at: Date;
  confirmed_at: Date | null;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
}

export interface EmailOutboxTable {
  id: Generated<number>;
  kind: string;
  to_address: string;
  subject: string;
  html: string;
  text_body: string;
  reply_to: string | null;
  submission_id: number | null;
  subscriber_id: number | null;
  status: ColumnType<OutboxStatus, OutboxStatus | undefined, OutboxStatus>;
  attempts: ColumnType<number, never, number>;
  next_attempt_at: ColumnType<Date, never, Date>;
  locked_until: ColumnType<Date | null, never, Date | null>;
  last_error: ColumnType<string | null, never, string | null>;
  sent_at: ColumnType<Date | null, never, Date | null>;
  created_at: CreatedAt;
}

export interface AltchaUsedTable {
  id: string;
  expires_at: Date;
}

export interface Database {
  reference_counters: ReferenceCountersTable;
  submissions: SubmissionsTable;
  newsletter_subscribers: NewsletterSubscribersTable;
  email_outbox: EmailOutboxTable;
  altcha_used: AltchaUsedTable;
}

export type Db = Kysely<Database>;
export type Submission = Selectable<SubmissionsTable>;
export type OutboxRow = Selectable<EmailOutboxTable>;
