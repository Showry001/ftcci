import { type Kysely, sql } from "kysely";

// Phase 4: staff accounts and sign-in (password or emailed code), sessions, password reset links, the
// activity log, and who moved an item to the bin.
const up_ = [
  `create table staff_users (
    id integer generated always as identity primary key,
    email text not null check (email = lower(email) and length(email) <= 254),
    name text not null check (length(name) between 1 and 120),
    role text not null check (role in ('super_admin', 'admin')),
    password_hash text,
    failed_passwords integer not null default 0,
    locked_until timestamptz,
    last_sign_in_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    disabled_at timestamptz
  )`,
  `create unique index staff_users_email_idx on staff_users (email)`,
  // The session id is a SHA-256 of the cookie value, so a database copy can't be used to sign in.
  `create table staff_sessions (
    id text primary key,
    user_id integer not null references staff_users (id) on delete cascade,
    csrf_token text not null,
    method text not null check (method in ('password', 'code')),
    ip text not null default '',
    user_agent text not null default '',
    created_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now()
  )`,
  `create index staff_sessions_user_idx on staff_sessions (user_id)`,
  `create index staff_sessions_seen_idx on staff_sessions (last_seen_at)`,
  `create table staff_codes (
    id integer generated always as identity primary key,
    user_id integer not null references staff_users (id) on delete cascade,
    code_hash text not null,
    attempts integer not null default 0,
    expires_at timestamptz not null,
    used_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create index staff_codes_user_idx on staff_codes (user_id, created_at desc)`,
  `create table staff_password_resets (
    id integer generated always as identity primary key,
    user_id integer not null references staff_users (id) on delete cascade,
    token_hash text not null unique,
    expires_at timestamptz not null,
    used_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create index staff_password_resets_user_idx on staff_password_resets (user_id, created_at desc)`,
  `create table audit_log (
    id bigint generated always as identity primary key,
    at timestamptz not null default now(),
    user_id integer references staff_users (id),
    actor text not null default '',
    action text not null,
    target_type text not null default '',
    target_id text not null default '',
    summary text not null default '',
    ip text not null default ''
  )`,
  `create index audit_log_at_idx on audit_log (at desc)`,
  `create index audit_log_user_idx on audit_log (user_id, at desc)`,
  `alter table documents add column deleted_by integer references staff_users (id)`,
  `alter table media add column deleted_by integer references staff_users (id)`,
];

export async function up(db: Kysely<any>): Promise<void> {
  for (const statement of up_) await sql.raw(statement).execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql.raw("alter table media drop column if exists deleted_by").execute(db);
  await sql.raw("alter table documents drop column if exists deleted_by").execute(db);
  for (const table of ["audit_log", "staff_password_resets", "staff_codes", "staff_sessions", "staff_users"]) {
    await sql.raw(`drop table if exists ${table}`).execute(db);
  }
}
