import { type Kysely, sql } from "kysely";

// Phase 2: form submissions, reference numbers, the email outbox, newsletter sign-ups and used
// ALTCHA challenges.
const up_ = [
  `create table reference_counters (
    prefix text not null,
    year integer not null,
    last_value integer not null,
    primary key (prefix, year)
  )`,
  `create table submissions (
    id integer generated always as identity primary key,
    type text not null check (type in ('hall_booking', 'membership', 'event_interest', 'contact')),
    reference text not null unique,
    status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
    name text not null,
    email text not null,
    phone text not null default '',
    organisation text not null default '',
    summary text not null default '',
    data jsonb not null,
    notes text not null default '' check (length(notes) <= 5000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create index submissions_list_idx on submissions (type, status, created_at desc)`,
  `create table newsletter_subscribers (
    id integer generated always as identity primary key,
    email text not null unique check (email = lower(email)),
    first_name text not null default '',
    last_name text not null default '',
    phone text not null default '',
    business text not null default '',
    source text not null check (source in ('home', 'footer')),
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
    token_hash text unique,
    token_expires_at timestamptz,
    consent_at timestamptz not null,
    confirmed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table email_outbox (
    id integer generated always as identity primary key,
    kind text not null,
    to_address text not null,
    subject text not null,
    html text not null,
    text_body text not null,
    reply_to text,
    submission_id integer references submissions (id) on delete cascade,
    subscriber_id integer references newsletter_subscribers (id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
    attempts integer not null default 0,
    next_attempt_at timestamptz not null default now(),
    locked_until timestamptz,
    last_error text,
    sent_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create index email_outbox_due_idx on email_outbox (next_attempt_at) where status in ('pending', 'sending')`,
  `create index email_outbox_recipient_idx on email_outbox (lower(to_address), created_at)`,
  `create index email_outbox_submission_idx on email_outbox (submission_id)`,
  `create table altcha_used (
    id text primary key,
    expires_at timestamptz not null
  )`,
];

export async function up(db: Kysely<any>): Promise<void> {
  for (const statement of up_) await sql.raw(statement).execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const table of ["altcha_used", "email_outbox", "newsletter_subscribers", "submissions", "reference_counters"]) {
    await sql.raw(`drop table if exists ${table}`).execute(db);
  }
}
