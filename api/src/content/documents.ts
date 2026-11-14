// Content documents: one row per event, article, page block, … holding a working copy (`data`) and the
// copy the public site shows (`published_data`). Staff edit the working copy freely; publishing copies
// it across. Every publish, restore and (at most every few minutes) save is kept as a version.
import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "kysely";
import sanitizeHtml from "sanitize-html";
import { contentTypes } from "../../../shared/content.js";
import { mediaRefs, validateContent } from "../../../shared/validate-content.js";
import type { Config } from "../config.ts";
import type { Db, Document, DocumentStatus } from "../db/schema.ts";
import { mediaView, type MediaView } from "../media/store.ts";
import { record } from "../staff/audit.ts";
import { bumpContentVersion } from "./cache.ts";

type Data = Record<string, any>;
type ContentType = keyof typeof contentTypes;

export class ContentError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status = 400, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const isType = (t: string): t is ContentType => Object.hasOwn(contentTypes, t);
const isCollection = (t: ContentType) => Boolean((contentTypes[t] as { collection?: boolean }).collection);
const SAVE_VERSION_GAP_MS = 5 * 60_000;
const VERSIONS_KEPT = 60;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Compares two documents' content regardless of key order (Postgres stores JSON keys in its own order).
const canonical = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canonical).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Data)[k])}`).join(",")}}`
  : JSON.stringify(v ?? null);
export const sameContent = (a: unknown, b: unknown) => canonical(a) === canonical(b);

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item";

// Rich text keeps only basic formatting and safe links.
export const cleanRichText = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { href: attribs.href ?? "", ...(attribs.target === "_blank" ? { target: "_blank" } : {}), rel: "noopener noreferrer" },
      }),
    },
  }).trim();

function cleanRich(type: ContentType, values: Data) {
  for (const [name, spec] of Object.entries(contentTypes[type].fields) as [string, { kind: string }][]) {
    if (spec.kind === "richtext" && typeof values[name] === "string") values[name] = cleanRichText(values[name]) || null;
  }
  return values;
}

const formatIssueDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** Columns kept alongside the JSON for listing, sorting and search. */
function derived(type: ContentType, data: Data) {
  const titleField = (contentTypes[type] as { title?: string }).title;
  const raw = titleField ? data[titleField] : contentTypes[type].label;
  const title = type === "review" && raw ? `FTCCI Review, ${formatIssueDate(raw)}` : String(raw ?? "");
  return { title: title.slice(0, 200), sort_date: (data.date as string | undefined) ?? null };
}

/** Checks that every media reference exists and is the right kind, and when publishing, that videos are ready. */
async function checkMedia(db: Db, type: ContentType, values: Data, { publish = false } = {}) {
  const refs = mediaRefs(type, values);
  if (!refs.length) return;
  const rows = await db.selectFrom("media").select(["id", "kind", "status"]).where("id", "in", [...new Set(refs.map((r) => r.id))]).where("deleted_at", "is", null).execute();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const errors: Record<string, string> = {};
  for (const ref of refs) {
    const media = byId.get(ref.id);
    const allowed: string[] = ref.kind === "file" ? (ref.accept ?? ["pdf", "image"]) : [ref.kind];
    if (!media) errors[ref.path] = "This file is no longer in the media library. Choose another.";
    else if (!allowed.includes(media.kind)) errors[ref.path] = `Choose ${allowed.map((k) => (k === "pdf" ? "a PDF" : `an ${k}`)).join(" or ")} here.`;
    else if (publish && media.status === "processing") errors[ref.path] = "This video is still being compressed. Publish again in a few minutes.";
    else if (publish && media.status === "failed") errors[ref.path] = "This video couldn't be processed. Upload it again.";
  }
  if (Object.keys(errors).length) throw new ContentError("Some files need attention.", 400, errors);
}

async function linkMedia(db: Db, doc: { id: number; type: string; data: Data; published_data: Data | null }) {
  const type = doc.type as ContentType;
  const ids = new Set([...mediaRefs(type, doc.data), ...(doc.published_data ? mediaRefs(type, doc.published_data) : [])].map((r) => r.id));
  await db.deleteFrom("document_media").where("document_id", "=", doc.id).execute();
  if (ids.size) await db.insertInto("document_media").values([...ids].map((media_id) => ({ document_id: doc.id, media_id }))).execute();
}

async function addVersion(db: Db, documentId: number, action: "save" | "publish" | "restore" | "import", data: Data, { force = false } = {}) {
  if (action === "save" && !force) {
    const last = await db.selectFrom("document_versions").select("created_at").where("document_id", "=", documentId).orderBy("id", "desc").limit(1).executeTakeFirst();
    if (last && Date.now() - last.created_at.getTime() < SAVE_VERSION_GAP_MS) return;
  }
  await db.insertInto("document_versions").values({ document_id: documentId, action, data: JSON.stringify(data) }).execute();
  await sql`delete from document_versions where document_id = ${documentId} and id not in (
    select id from document_versions where document_id = ${documentId} order by id desc limit ${VERSIONS_KEPT})`.execute(db);
}

async function uniqueSlug(db: Db, type: string, wanted: string, exceptId?: number) {
  let slug = wanted;
  for (let n = 2; ; n++) {
    let q = db.selectFrom("documents").select("id").where("type", "=", type).where("slug", "=", slug).where("deleted_at", "is", null);
    if (exceptId) q = q.where("id", "<>", exceptId);
    if (!(await q.executeTakeFirst())) return slug;
    slug = `${wanted.slice(0, 76)}-${n}`;
  }
}

export async function getDocument(db: Db, id: number): Promise<Document> {
  const doc = await db.selectFrom("documents").selectAll().where("id", "=", id).where("deleted_at", "is", null).executeTakeFirst();
  if (!doc) throw new ContentError("We couldn't find that item.", 404);
  return doc;
}

/** The one document of a single type (Home page, About page, …), created empty on first use. */
export async function getSingle(db: Db, type: ContentType): Promise<Document> {
  const found = await db.selectFrom("documents").selectAll().where("type", "=", type).where("slug", "is", null).where("deleted_at", "is", null).executeTakeFirst();
  if (found) return found;
  return db.insertInto("documents").values({ type, slug: null, data: "{}", published_data: null, title: contentTypes[type].label, sort_date: null, publish_at: null, published_at: null }).returningAll().executeTakeFirstOrThrow();
}

function validated(type: ContentType, data: unknown, publish: boolean) {
  const { ok, values, errors } = validateContent(type, data, { publish });
  if (!ok) throw new ContentError(publish ? "Please complete the highlighted fields before publishing." : "Please correct the highlighted fields.", 400, errors);
  return cleanRich(type, values);
}

export async function createDocument(db: Db, type: ContentType, data: unknown, slug?: string): Promise<Document> {
  if (!isCollection(type)) throw new ContentError("Use the page editor for this content.");
  const values = validated(type, data, false);
  await checkMedia(db, type, values);
  const base = derived(type, values);
  if (slug !== undefined && !SLUG.test(slug)) throw new ContentError("The web address can use lowercase letters, numbers and hyphens.", 400, { slug: "Use lowercase letters, numbers and hyphens." });
  const doc = await db.transaction().execute(async (trx) => {
    const created = await trx
      .insertInto("documents")
      .values({ type, slug: await uniqueSlug(trx, type, slug ?? slugify(base.title || type)), data: JSON.stringify(values), published_data: null, ...base, publish_at: null, published_at: null, has_changes: true })
      .returningAll()
      .executeTakeFirstOrThrow();
    await addVersion(trx, created.id, "save", values);
    await linkMedia(trx, created);
    return created;
  });
  return doc;
}

export async function saveDocument(db: Db, id: number, data: unknown, slug?: string): Promise<Document> {
  const doc = await getDocument(db, id);
  const type = doc.type as ContentType;
  const values = validated(type, data, false);
  await checkMedia(db, type, values);
  if (slug !== undefined && (doc.slug === null || !SLUG.test(slug))) throw new ContentError("The web address can use lowercase letters, numbers and hyphens.", 400, { slug: "Use lowercase letters, numbers and hyphens." });
  return db.transaction().execute(async (trx) => {
    const updated = await trx
      .updateTable("documents")
      .set({
        data: JSON.stringify(values),
        ...derived(type, values),
        ...(slug !== undefined && slug !== doc.slug ? { slug: await uniqueSlug(trx, type, slug, id) } : {}),
        has_changes: doc.published_data === null || !sameContent(values, doc.published_data),
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
    await addVersion(trx, id, "save", values);
    await linkMedia(trx, updated);
    return updated;
  });
}

async function setPublished(db: Db, doc: Document, values: Data, status: DocumentStatus = "published") {
  const updated = await db
    .updateTable("documents")
    .set({ status, published_data: JSON.stringify(values), data: JSON.stringify(values), ...derived(doc.type as ContentType, values), published_at: new Date(), publish_at: null, has_changes: false, updated_at: new Date() })
    .where("id", "=", doc.id)
    .returningAll()
    .executeTakeFirstOrThrow();
  await addVersion(db, doc.id, "publish", values);
  await linkMedia(db, updated);
  bumpContentVersion();
  return updated;
}

/** Publishes the working copy now. Archived items stay archived (with the new content). */
export async function publishDocument(db: Db, id: number): Promise<Document> {
  const doc = await getDocument(db, id);
  const type = doc.type as ContentType;
  const values = validated(type, doc.data, true);
  await checkMedia(db, type, values, { publish: true });
  return db.transaction().execute((trx) => setPublished(trx, doc, values, doc.status === "archived" ? "archived" : "published"));
}

export async function scheduleDocument(db: Db, id: number, at: Date | null): Promise<Document> {
  const doc = await getDocument(db, id);
  if (at) {
    if (at.getTime() < Date.now() + 60_000) throw new ContentError("Choose a time at least a minute from now.", 400, { publishAt: "Choose a later time." });
    validated(doc.type as ContentType, doc.data, true);
  }
  return db.updateTable("documents").set({ publish_at: at, updated_at: new Date() }).where("id", "=", id).returningAll().executeTakeFirstOrThrow();
}

export async function setStatus(db: Db, id: number, action: "unpublish" | "archive" | "unarchive"): Promise<Document> {
  const doc = await getDocument(db, id);
  if (!isCollection(doc.type as ContentType) && action !== "unpublish") throw new ContentError("Pages can't be archived.");
  if (action !== "unpublish" && !doc.published_data) throw new ContentError("Publish this item before archiving it.");
  const status: DocumentStatus = action === "archive" ? "archived" : action === "unarchive" ? "published" : "draft";
  const updated = await db
    .updateTable("documents")
    .set({ status, ...(action === "unpublish" ? { published_data: null, has_changes: true } : {}), publish_at: null, updated_at: new Date() })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
  bumpContentVersion();
  return updated;
}

export async function restoreVersion(db: Db, id: number, versionId: number): Promise<Document> {
  const version = await db.selectFrom("document_versions").selectAll().where("id", "=", versionId).where("document_id", "=", id).executeTakeFirst();
  if (!version) throw new ContentError("We couldn't find that version.", 404);
  // Keep the draft being replaced, unless the latest version already holds it.
  const current = await getDocument(db, id);
  const latest = await db.selectFrom("document_versions").select("data").where("document_id", "=", id).orderBy("id", "desc").limit(1).executeTakeFirst();
  if (!latest || !sameContent(latest.data, current.data)) await addVersion(db, id, "save", current.data, { force: true });
  const doc = await saveDocument(db, id, version.data);
  await addVersion(db, id, "restore", doc.data);
  return doc;
}

/** Moves an item to the bin. A Super Admin can restore it. */
export async function deleteDocument(db: Db, id: number, by: number | null): Promise<Document> {
  const doc = await getDocument(db, id);
  if (!isCollection(doc.type as ContentType)) throw new ContentError("Pages can't be deleted.");
  await db.updateTable("documents").set({ deleted_at: new Date(), deleted_by: by, publish_at: null }).where("id", "=", id).execute();
  if (doc.published_data) bumpContentVersion();
  return doc;
}

/** Takes an item out of the bin, back in the state it was deleted in. A clashing web address gets a number. */
export async function restoreDocument(db: Db, id: number): Promise<Document> {
  const doc = await db.selectFrom("documents").selectAll().where("id", "=", id).where("deleted_at", "is not", null).executeTakeFirst();
  if (!doc) throw new ContentError("That item isn't in the bin.", 404);
  const restored = await db.transaction().execute(async (trx) =>
    trx
      .updateTable("documents")
      .set({ deleted_at: null, deleted_by: null, slug: doc.slug === null ? null : await uniqueSlug(trx, doc.type, doc.slug, id), updated_at: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(),
  );
  if (restored.published_data) bumpContentVersion();
  return restored;
}

/** "Event “Trade Expo”" or "About page", for messages and the activity log. */
export function describe(doc: { type: string; title: string }): string {
  const spec = contentTypes[doc.type as ContentType] as { collection?: boolean; singular?: string; label: string } | undefined;
  if (!spec) return doc.title;
  return spec.collection ? `${spec.singular} “${doc.title}”` : spec.label;
}

/** Publishes documents whose scheduled time has come. Returns how many were published. */
export async function publishDue(db: Db, log: { warn: (o: object, m: string) => void }): Promise<number> {
  const due = await db.selectFrom("documents").selectAll().where("publish_at", "<=", new Date()).where("deleted_at", "is", null).execute();
  let count = 0;
  for (const doc of due) {
    try {
      await publishDocument(db, doc.id);
      await record(db, { action: "content.published", target: { type: "document", id: doc.id }, actor: "Scheduled publishing", summary: `Published ${describe(doc)} at its scheduled time` });
      count++;
    } catch (err) {
      await db.updateTable("documents").set({ publish_at: null }).where("id", "=", doc.id).execute();
      const reason = err instanceof Error ? err.message : String(err);
      await record(db, { action: "content.schedule_failed", target: { type: "document", id: doc.id }, actor: "Scheduled publishing", summary: `Couldn't publish ${describe(doc)}: ${reason}` });
      log.warn({ documentId: doc.id, error: reason }, "Scheduled publish failed");
    }
  }
  return count;
}

/** Replaces media ids in documents with what the site needs (URL, sizes, alt text). */
export async function withMedia(db: Db, config: Config, docs: { type: string; data: Data }[]): Promise<Data[]> {
  const ids = new Set(docs.flatMap((d) => mediaRefs(d.type as ContentType, d.data).map((r) => r.id)));
  const rows = ids.size ? await db.selectFrom("media").selectAll().where("id", "in", [...ids]).where("deleted_at", "is", null).execute() : [];
  const views = new Map<number, MediaView>(rows.map((m) => [m.id, mediaView(m, config)]));
  const expand = (fields: Record<string, any>, source: Data): Data => {
    const out: Data = {};
    for (const [name, spec] of Object.entries(fields)) {
      const value = source?.[name];
      if (spec.kind === "group") out[name] = expand(spec.fields, value ?? {});
      else if (spec.kind === "list") out[name] = (value ?? []).map((item: Data) => expand(spec.fields, item));
      else if (["image", "file", "video"].includes(spec.kind)) out[name] = Number.isInteger(value) ? (views.get(value) ?? null) : null;
      else out[name] = value ?? null;
    }
    return out;
  };
  return docs.map((d) => expand(contentTypes[d.type as ContentType].fields, d.data));
}

// Preview links let staff see unpublished changes on the real site. One link can cover several documents
// (the page editor previews a page together with the hero, footer and other parts shown on it). They
// expire after an hour.
const PREVIEW_MS = 60 * 60_000;
export const PREVIEW_MAX_DOCUMENTS = 10;
const sign = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function previewToken(config: Config, documentIds: number | number[], now = Date.now()) {
  const ids = [documentIds].flat();
  const payload = `${ids.join("-")}.${now + PREVIEW_MS}`;
  return `${payload}.${sign(config.previewSecret, payload)}`;
}

/** The document ids a valid, unexpired preview link covers, or null. */
export function readPreviewToken(config: Config, token: string): number[] | null {
  const m = /^(\d+(?:-\d+){0,9})\.(\d+)\.([\w-]{43})$/.exec(token);
  if (!m || Number(m[2]) < Date.now()) return null;
  const expected = Buffer.from(sign(config.previewSecret, `${m[1]}.${m[2]}`));
  const given = Buffer.from(m[3]);
  return expected.length === given.length && timingSafeEqual(expected, given) ? m[1].split("-").map(Number) : null;
}
