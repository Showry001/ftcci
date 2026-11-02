// Admin API for content and the media library. Like the submissions admin, it is only registered
// outside production and only answers requests from this computer until Phase 4 adds sign-in.
import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import multipart from "@fastify/multipart";
import type { FastifyInstance, FastifyReply } from "fastify";
import { sql } from "kysely";
import { contentTypes } from "../../../shared/content.js";
import { mediaRefs } from "../../../shared/validate-content.js";
import type { Config } from "../config.ts";
import { bumpContentVersion } from "../content/cache.ts";
import {
  ContentError, createDocument, deleteDocument, getDocument, getSingle, isType, previewToken, publishDocument,
  restoreVersion, saveDocument, scheduleDocument, setStatus,
} from "../content/documents.ts";
import type { Db, Document, MediaKind } from "../db/schema.ts";
import type { JobRunner } from "../jobs.ts";
import { MAX_UPLOAD, MediaError, mediaView, storeFile } from "../media/store.ts";
import { isLocalRequest } from "./admin.ts";

const PAGE_SIZE = 25;
// Publications and vacancies are ordered by hand, so they are listed on one page.
const ORDERED = new Set(["publication", "vacancy"]);
const ORDERED_PAGE_SIZE = 200;
const idParam = { type: "object", required: ["id"], properties: { id: { type: "integer", minimum: 1 } } } as const;

export async function adminContentRoutes(app: FastifyInstance, { db, config, jobs }: { db: Db; config: Config; jobs: JobRunner }) {
  app.addHook("onRequest", async (req, reply) => {
    if (!isLocalRequest(req)) return reply.code(404).send({ error: "not_found", message: "Not found." });
  });
  await app.register(multipart, { limits: { fileSize: MAX_UPLOAD, files: 1, fields: 4, fieldSize: 1000, parts: 5 } });

  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown; code?: string }, req, reply) => {
    if (error instanceof ContentError) return reply.code(error.status).send({ error: "content", message: error.message, fields: error.fields });
    if (error instanceof MediaError) return reply.code(error.status).send({ error: "media", message: error.message });
    if (error.code === "FST_REQ_FILE_TOO_LARGE") return reply.code(413).send({ error: "media", message: "This file is larger than 200 MB." });
    if (error.validation) return reply.code(400).send({ error: "bad_request", message: "Some of the details sent were not in the expected format." });
    if ((error.statusCode ?? 500) < 500) return reply.code(error.statusCode!).send({ error: "bad_request", message: error.message });
    req.log.error({ err: error }, "Admin content request failed");
    return reply.code(500).send({ error: "server_error", message: "Something went wrong on our side. Please try again." });
  });

  // ---- Documents ----

  async function editorView(doc: Document) {
    const refs = [...mediaRefs(doc.type as never, doc.data), ...(doc.published_data ? mediaRefs(doc.type as never, doc.published_data) : [])];
    const ids = [...new Set(refs.map((r) => r.id))];
    const rows = ids.length ? await db.selectFrom("media").selectAll().where("id", "in", ids).execute() : [];
    const versions = await db.selectFrom("document_versions").select(["id", "action", "created_at"]).where("document_id", "=", doc.id).orderBy("id", "desc").limit(30).execute();
    return {
      id: doc.id, type: doc.type, slug: doc.slug, title: doc.title, status: doc.status, data: doc.data, published: doc.published_data !== null,
      hasChanges: doc.has_changes, publishAt: doc.publish_at, publishedAt: doc.published_at, updatedAt: doc.updated_at,
      media: Object.fromEntries(rows.map((m) => [m.id, mediaView(m, config)])),
      versions,
    };
  }
  const send = async (reply: FastifyReply, doc: Document) => reply.send(await editorView(doc));

  app.get<{ Params: { type: string }; Querystring: { status?: string; q?: string; page?: number } }>(
    "/api/admin/content/:type",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: { status: { type: "string", enum: ["draft", "published", "archived", "scheduled"] }, q: { type: "string", maxLength: 100 }, page: { type: "integer", minimum: 1 } },
        },
      },
    },
    async (req, reply) => {
      const { type } = req.params;
      if (!isType(type)) return reply.code(404).send({ error: "not_found", message: "Unknown content type." });
      if (!(contentTypes[type] as { collection?: boolean }).collection) return send(reply, await getSingle(db, type));
      const { status, q, page = 1 } = req.query;
      const pageSize = ORDERED.has(type) ? ORDERED_PAGE_SIZE : PAGE_SIZE;
      let query = db.selectFrom("documents").where("type", "=", type).where("deleted_at", "is", null);
      if (q?.trim()) query = query.where("title", "ilike", `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
      const counts = await query.select(["status", (eb) => eb.fn.countAll<number>().as("n")]).groupBy("status").execute();
      const scheduled = await query.select((eb) => eb.fn.countAll<number>().as("n")).where("publish_at", "is not", null).executeTakeFirstOrThrow();
      if (status === "scheduled") query = query.where("publish_at", "is not", null);
      else if (status) query = query.where("status", "=", status as Document["status"]);
      const rows = await query
        .select(["id", "slug", "status", "title", "sort_date", "publish_at", "published_at", "has_changes", "updated_at", "data"])
        .orderBy(ORDERED.has(type) ? sql`sort_order` : sql`sort_date desc nulls last`)
        .orderBy("id", "desc")
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .execute();
      // A thumbnail per row: the first image in the item.
      const thumbIds = rows.map((r) => mediaRefs(type, r.data).find((ref) => ref.kind === "image")?.id).filter((id): id is number => Boolean(id));
      const thumbs = thumbIds.length ? await db.selectFrom("media").selectAll().where("id", "in", thumbIds).execute() : [];
      const byId = new Map(thumbs.map((m) => [m.id, mediaView(m, config)]));
      const byStatus = Object.fromEntries(["draft", "published", "archived"].map((s) => [s, Number(counts.find((c) => c.status === s)?.n ?? 0)]));
      const total = status === "scheduled" ? Number(scheduled.n) : status ? byStatus[status] : Object.values(byStatus).reduce((a, b) => a + b, 0);
      return {
        total, page, pageSize, counts: { ...byStatus, scheduled: Number(scheduled.n) },
        items: rows.map(({ data, ...r }) => {
          const thumb = mediaRefs(type, data).find((ref) => ref.kind === "image");
          return { ...r, hasChanges: r.has_changes, thumb: thumb ? (byId.get(thumb.id) ?? null) : null, summary: data };
        }),
      };
    },
  );

  // The state of every page block, for the Pages screen.
  app.get("/api/admin/pages", async () => {
    const singles = Object.keys(contentTypes).filter((t) => !(contentTypes[t as keyof typeof contentTypes] as { collection?: boolean }).collection);
    const rows = await db
      .selectFrom("documents")
      .select(["type", "status", "has_changes", "publish_at", "published_at", "updated_at", sql<boolean>`published_data is not null`.as("published")])
      .where("slug", "is", null)
      .where("deleted_at", "is", null)
      .where("type", "in", singles)
      .execute();
    return { items: rows.map((r) => ({ type: r.type, status: r.status, published: r.published, hasChanges: r.has_changes, publishAt: r.publish_at, publishedAt: r.published_at, updatedAt: r.updated_at })) };
  });

  app.post<{ Params: { type: string }; Body: { data: unknown; slug?: string } }>(
    "/api/admin/content/:type",
    { schema: { body: { type: "object", required: ["data"], additionalProperties: false, properties: { data: { type: "object" }, slug: { type: "string", maxLength: 100 } } } } },
    async (req, reply) => {
      if (!isType(req.params.type)) return reply.code(404).send({ error: "not_found", message: "Unknown content type." });
      reply.code(201);
      return send(reply, await createDocument(db, req.params.type, req.body.data, req.body.slug));
    },
  );

  app.get<{ Params: { id: number } }>("/api/admin/content/doc/:id", { schema: { params: idParam } }, async (req, reply) => send(reply, await getDocument(db, req.params.id)));

  app.put<{ Params: { id: number }; Body: { data: unknown; slug?: string } }>(
    "/api/admin/content/doc/:id",
    { schema: { params: idParam, body: { type: "object", required: ["data"], additionalProperties: false, properties: { data: { type: "object" }, slug: { type: "string", maxLength: 100 } } } } },
    async (req, reply) => send(reply, await saveDocument(db, req.params.id, req.body.data, req.body.slug)),
  );

  app.post<{ Params: { id: number; action: string }; Body: { at?: string | null; versionId?: number } }>(
    "/api/admin/content/doc/:id/:action",
    {
      schema: {
        params: { type: "object", required: ["id", "action"], properties: { id: { type: "integer", minimum: 1 }, action: { type: "string", enum: ["publish", "unpublish", "archive", "unarchive", "schedule", "restore"] } } },
        body: { type: ["object", "null"], additionalProperties: false, properties: { at: { type: ["string", "null"], format: "date-time" }, versionId: { type: "integer", minimum: 1 } } },
      },
    },
    async (req, reply) => {
      const { id, action } = req.params;
      const body = req.body ?? {};
      const doc =
        action === "publish" ? await publishDocument(db, id)
        : action === "schedule" ? await scheduleDocument(db, id, body.at ? new Date(body.at) : null)
        : action === "restore" ? await restoreVersion(db, id, body.versionId ?? 0)
        : await setStatus(db, id, action as "unpublish" | "archive" | "unarchive");
      return send(reply, doc);
    },
  );

  app.get<{ Params: { id: number; versionId: number } }>(
    "/api/admin/content/doc/:id/versions/:versionId",
    { schema: { params: { type: "object", required: ["id", "versionId"], properties: { id: { type: "integer", minimum: 1 }, versionId: { type: "integer", minimum: 1 } } } } },
    async (req, reply) => {
      const version = await db.selectFrom("document_versions").selectAll().where("id", "=", req.params.versionId).where("document_id", "=", req.params.id).executeTakeFirst();
      return version ?? reply.code(404).send({ error: "not_found", message: "We couldn't find that version." });
    },
  );

  app.post<{ Params: { id: number } }>("/api/admin/content/doc/:id/preview", { schema: { params: idParam } }, async (req) => {
    const doc = await getDocument(db, req.params.id);
    return { token: previewToken(config, doc.id), type: doc.type, slug: doc.slug };
  });

  app.delete<{ Params: { id: number } }>("/api/admin/content/doc/:id", { schema: { params: idParam } }, async (req, reply) => {
    await deleteDocument(db, req.params.id);
    return reply.code(204).send();
  });

  // Sets the order of publications or vacancies: ids in the order they should appear.
  app.post<{ Params: { type: string }; Body: { ids: number[] } }>(
    "/api/admin/content/:type/order",
    { schema: { body: { type: "object", required: ["ids"], additionalProperties: false, properties: { ids: { type: "array", maxItems: 500, items: { type: "integer", minimum: 1 } } } } } },
    async (req, reply) => {
      if (!ORDERED.has(req.params.type)) return reply.code(404).send({ error: "not_found", message: "This content isn't ordered by hand." });
      await db.transaction().execute(async (trx) => {
        for (const [i, id] of req.body.ids.entries()) await trx.updateTable("documents").set({ sort_order: i }).where("id", "=", id).where("type", "=", req.params.type).execute();
      });
      bumpContentVersion();
      return { ok: true };
    },
  );

  // ---- Media library ----

  // `kind` takes one or more kinds ("pdf,image"). `used` narrows the list to files used by these content
  // types ("event,article"), or "none" for unused files.
  app.get<{ Querystring: { kind?: string; q?: string; used?: string; page?: number } }>(
    "/api/admin/media",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            kind: { type: "string", maxLength: 20, pattern: "^(image|pdf|video)(,(image|pdf|video))*$" },
            q: { type: "string", maxLength: 100 },
            used: { type: "string", maxLength: 200, pattern: "^[a-z]+(,[a-z]+)*$" },
            page: { type: "integer", minimum: 1 },
          },
        },
      },
    },
    async (req, reply) => {
      const { kind, q, used: usedFilter, page = 1 } = req.query;
      let query = db.selectFrom("media").where("deleted_at", "is", null);
      if (kind) query = query.where("kind", "in", kind.split(",") as MediaKind[]);
      if (usedFilter === "none") {
        query = query.where(({ not, exists, selectFrom }) => not(exists(selectFrom("document_media").select("media_id").whereRef("document_media.media_id", "=", "media.id"))));
      } else if (usedFilter) {
        const types = usedFilter.split(",");
        if (!types.every(isType)) return reply.code(400).send({ error: "bad_request", message: "Unknown content type." });
        query = query.where("id", "in", (eb) =>
          eb.selectFrom("document_media").innerJoin("documents", "documents.id", "document_media.document_id").select("document_media.media_id").where("documents.type", "in", types).where("documents.deleted_at", "is", null),
        );
      }
      if (q?.trim()) {
        const like = `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        query = query.where((eb) => eb.or([eb("original_name", "ilike", like), eb("title", "ilike", like), eb("alt", "ilike", like)]));
      }
      const { total } = await query.select((eb) => eb.fn.countAll<number>().as("total")).executeTakeFirstOrThrow();
      const rows = await query.selectAll().orderBy("created_at", "desc").orderBy("id", "desc").limit(30).offset((page - 1) * 30).execute();
      const usage = rows.length
        ? await db.selectFrom("document_media").select(["media_id", (eb) => eb.fn.countAll<number>().as("n")]).where("media_id", "in", rows.map((r) => r.id)).groupBy("media_id").execute()
        : [];
      const used = new Map(usage.map((u) => [u.media_id, Number(u.n)]));
      return { total: Number(total), page, pageSize: 30, items: rows.map((m) => ({ ...mediaView(m, config), usedIn: used.get(m.id) ?? 0, createdAt: m.created_at, error: m.error })) };
    },
  );

  app.post("/api/admin/media", async (req, reply) => {
    const part = await req.file();
    if (!part) return reply.code(400).send({ error: "media", message: "Choose a file to upload." });
    const tmpDir = join(config.media.dir, "tmp");
    await mkdir(tmpDir, { recursive: true });
    const tempPath = join(tmpDir, randomBytes(12).toString("hex"));
    try {
      await pipeline(part.file, createWriteStream(tempPath));
      if (part.file.truncated) return reply.code(413).send({ error: "media", message: "This file is larger than 200 MB." });
      const field = (name: string) => {
        const f = part.fields[name] as { value?: unknown } | undefined;
        return typeof f?.value === "string" ? f.value : "";
      };
      const expect = field("expect").split(",").filter((k): k is MediaKind => ["image", "pdf", "video"].includes(k));
      const { media, duplicate } = await storeFile(db, config, { tempPath, originalName: part.filename, expect: expect.length ? expect : undefined, alt: field("alt") });
      if (media.kind === "video" && media.status === "processing") void jobs.flush();
      reply.code(duplicate ? 200 : 201);
      return { ...mediaView(media, config), duplicate };
    } finally {
      await rm(tempPath, { force: true });
    }
  });

  app.get<{ Params: { id: number } }>("/api/admin/media/:id", { schema: { params: idParam } }, async (req, reply) => {
    const m = await db.selectFrom("media").selectAll().where("id", "=", req.params.id).where("deleted_at", "is", null).executeTakeFirst();
    if (!m) return reply.code(404).send({ error: "not_found", message: "We couldn't find that file." });
    const usedBy = await db
      .selectFrom("document_media")
      .innerJoin("documents", "documents.id", "document_media.document_id")
      .select(["documents.id", "documents.type", "documents.title"])
      .where("document_media.media_id", "=", m.id)
      .where("documents.deleted_at", "is", null)
      .execute();
    return { ...mediaView(m, config), error: m.error, createdAt: m.created_at, usedBy };
  });

  app.patch<{ Params: { id: number }; Body: { alt?: string; title?: string } }>(
    "/api/admin/media/:id",
    { schema: { params: idParam, body: { type: "object", additionalProperties: false, minProperties: 1, properties: { alt: { type: "string", maxLength: 300 }, title: { type: "string", maxLength: 200 } } } } },
    async (req, reply) => {
      const clean = (s?: string) => (s === undefined ? undefined : s.replace(/[\u0000-\u001F\u007F]+/g, " ").trim());
      const m = await db
        .updateTable("media")
        .set({ ...(req.body.alt !== undefined ? { alt: clean(req.body.alt) } : {}), ...(req.body.title !== undefined ? { title: clean(req.body.title) } : {}), updated_at: new Date() })
        .where("id", "=", req.params.id)
        .where("deleted_at", "is", null)
        .returningAll()
        .executeTakeFirst();
      if (!m) return reply.code(404).send({ error: "not_found", message: "We couldn't find that file." });
      bumpContentVersion();
      return mediaView(m, config);
    },
  );

  app.delete<{ Params: { id: number } }>("/api/admin/media/:id", { schema: { params: idParam } }, async (req, reply) => {
    const used = await db
      .selectFrom("document_media")
      .innerJoin("documents", "documents.id", "document_media.document_id")
      .select(["documents.title"])
      .where("document_media.media_id", "=", req.params.id)
      .where("documents.deleted_at", "is", null)
      .execute();
    if (used.length) {
      return reply.code(409).send({ error: "in_use", message: `This file is used in ${used.length} place${used.length > 1 ? "s" : ""}: ${used.slice(0, 5).map((u) => u.title).join(", ")}. Replace it there first.` });
    }
    await db.updateTable("media").set({ deleted_at: new Date() }).where("id", "=", req.params.id).execute();
    return reply.code(204).send();
  });
}
