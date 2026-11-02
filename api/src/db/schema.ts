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

export type MediaKind = "image" | "pdf" | "video";
export interface MediaVariant {
  path: string;
  width: number;
  height: number;
  format: "webp" | "jpeg" | "mp4";
  bytes: number;
}

export interface MediaTable {
  id: Generated<number>;
  kind: MediaKind;
  status: ColumnType<"processing" | "ready" | "failed", "processing" | "ready" | "failed" | undefined, "processing" | "ready" | "failed">;
  original_name: string;
  mime: string;
  bytes: ColumnType<number, number, number>;
  sha256: string;
  path: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  variants: ColumnType<MediaVariant[], string | undefined, string>;
  poster_path: string | null;
  alt: ColumnType<string, string | undefined, string>;
  title: ColumnType<string, string | undefined, string>;
  error: string | null;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
  deleted_at: ColumnType<Date | null, never, Date | null>;
}

export type DocumentStatus = "draft" | "published" | "archived";
export interface DocumentsTable {
  id: Generated<number>;
  type: string;
  slug: string | null;
  status: ColumnType<DocumentStatus, DocumentStatus | undefined, DocumentStatus>;
  data: ColumnType<Record<string, any>, string, string>;
  published_data: ColumnType<Record<string, any> | null, string | null, string | null>;
  title: string;
  sort_date: ColumnType<string | null, string | null, string | null>;
  sort_order: ColumnType<number, number | undefined, number>;
  publish_at: Date | null;
  published_at: Date | null;
  has_changes: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
  deleted_at: ColumnType<Date | null, never, Date | null>;
}

export interface DocumentVersionsTable {
  id: Generated<number>;
  document_id: number;
  action: "save" | "publish" | "restore" | "import";
  data: ColumnType<Record<string, any>, string, never>;
  created_at: CreatedAt;
}

export interface DocumentMediaTable {
  document_id: number;
  media_id: number;
}

export interface JobsTable {
  id: Generated<number>;
  kind: string;
  payload: ColumnType<Record<string, any>, string, string>;
  status: ColumnType<"pending" | "running" | "done" | "failed", "pending" | undefined, "pending" | "running" | "done" | "failed">;
  attempts: ColumnType<number, never, number>;
  run_after: ColumnType<Date, Date | undefined, Date>;
  locked_until: ColumnType<Date | null, never, Date | null>;
  last_error: ColumnType<string | null, never, string | null>;
  created_at: CreatedAt;
  finished_at: ColumnType<Date | null, never, Date | null>;
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
  media: MediaTable;
  documents: DocumentsTable;
  document_versions: DocumentVersionsTable;
  document_media: DocumentMediaTable;
  jobs: JobsTable;
}

export type Db = Kysely<Database>;
export type Submission = Selectable<SubmissionsTable>;
export type OutboxRow = Selectable<EmailOutboxTable>;
export type Media = Selectable<MediaTable>;
export type Document = Selectable<DocumentsTable>;
