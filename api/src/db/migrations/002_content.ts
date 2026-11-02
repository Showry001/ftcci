import { type Kysely, sql } from "kysely";

// Phase 3: the media library, content documents with draft/published copies and version history,
// which documents use which media, and background jobs (video processing, scheduled publishing).
const up_ = [
  `create table media (
    id integer generated always as identity primary key,
    kind text not null check (kind in ('image', 'pdf', 'video')),
    status text not null default 'ready' check (status in ('processing', 'ready', 'failed')),
    original_name text not null,
    mime text not null,
    bytes bigint not null,
    sha256 text not null,
    path text not null,
    width integer,
    height integer,
    duration real,
    variants jsonb not null default '[]',
    poster_path text,
    alt text not null default '' check (length(alt) <= 300),
    title text not null default '' check (length(title) <= 200),
    error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
  )`,
  `create index media_list_idx on media (kind, created_at desc) where deleted_at is null`,
  `create unique index media_sha_idx on media (sha256) where deleted_at is null`,
  `create table documents (
    id integer generated always as identity primary key,
    type text not null,
    slug text,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    data jsonb not null default '{}',
    published_data jsonb,
    title text not null default '',
    sort_date date,
    sort_order integer not null default 0,
    publish_at timestamptz,
    published_at timestamptz,
    has_changes boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    check (status <> 'published' or published_data is not null)
  )`,
  `create unique index documents_slug_idx on documents (type, slug) where slug is not null and deleted_at is null`,
  `create unique index documents_single_idx on documents (type) where slug is null and deleted_at is null`,
  `create index documents_list_idx on documents (type, status, sort_date desc) where deleted_at is null`,
  `create index documents_due_idx on documents (publish_at) where publish_at is not null and deleted_at is null`,
  `create table document_versions (
    id integer generated always as identity primary key,
    document_id integer not null references documents (id) on delete cascade,
    action text not null check (action in ('save', 'publish', 'restore', 'import')),
    data jsonb not null,
    created_at timestamptz not null default now()
  )`,
  `create index document_versions_doc_idx on document_versions (document_id, id desc)`,
  `create table document_media (
    document_id integer not null references documents (id) on delete cascade,
    media_id integer not null references media (id),
    primary key (document_id, media_id)
  )`,
  `create index document_media_media_idx on document_media (media_id)`,
  `create table jobs (
    id integer generated always as identity primary key,
    kind text not null,
    payload jsonb not null,
    status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
    attempts integer not null default 0,
    run_after timestamptz not null default now(),
    locked_until timestamptz,
    last_error text,
    created_at timestamptz not null default now(),
    finished_at timestamptz
  )`,
  `create index jobs_due_idx on jobs (run_after) where status in ('pending', 'running')`,
];

export async function up(db: Kysely<any>): Promise<void> {
  for (const statement of up_) await sql.raw(statement).execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const table of ["jobs", "document_media", "document_versions", "documents", "media"]) {
    await sql.raw(`drop table if exists ${table}`).execute(db);
  }
}
