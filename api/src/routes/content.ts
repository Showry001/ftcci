// Public content API, read by the website's server renderer. Only published (and, for collections,
// archived) content is returned, with media ids turned into URLs. Responses are cached until the next
// publish.
import type { FastifyInstance } from "fastify";
import { sql } from "kysely";
import { collections, contentTypes, singles } from "../../../shared/content.js";
import { todayInIndia } from "../../../shared/forms.js";
import type { Config } from "../config.ts";
import { cached } from "../content/cache.ts";
import { getDocument, readPreviewToken, withMedia } from "../content/documents.ts";
import type { Db } from "../db/schema.ts";

const notFound = { error: "not_found", message: "Not found." };

export async function contentRoutes(app: FastifyInstance, { db, config }: { db: Db; config: Config }) {
  app.get<{ Params: { type: string } }>(
    "/api/content/single/:type",
    { schema: { params: { type: "object", properties: { type: { type: "string", enum: singles } }, required: ["type"] } } },
    async (req, reply) => {
      const result = await cached(`single:${req.params.type}`, async () => {
        const doc = await db.selectFrom("documents").select(["type", "published_data", "published_at"]).where("type", "=", req.params.type).where("slug", "is", null).where("deleted_at", "is", null).where("status", "=", "published").executeTakeFirst();
        if (!doc?.published_data) return null;
        const [data] = await withMedia(db, config, [{ type: doc.type, data: doc.published_data }]);
        return { type: doc.type, publishedAt: doc.published_at, data };
      });
      return result ?? reply.code(404).send(notFound);
    },
  );

  app.get<{ Params: { type: string }; Querystring: { when?: "upcoming" | "past"; section?: string; year?: number; from?: string; to?: string; featured?: boolean; q?: string; page?: number; limit?: number } }>(
    "/api/content/list/:type",
    {
      schema: {
        params: { type: "object", properties: { type: { type: "string", enum: collections } }, required: ["type"] },
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            when: { type: "string", enum: ["upcoming", "past"] },
            section: { type: "string", maxLength: 40 },
            year: { type: "integer", minimum: 1900, maximum: 2200 },
            from: { type: "string", format: "date" },
            to: { type: "string", format: "date" },
            featured: { type: "boolean" },
            q: { type: "string", maxLength: 100 },
            page: { type: "integer", minimum: 1, maximum: 10_000 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
          },
        },
      },
    },
    async (req) => {
      const { type } = req.params;
      return cached(`list:${type}:${JSON.stringify(req.query)}`, async () => {
        const { when, section, year, from, to, featured, q: search, page = 1, limit = 24 } = req.query;
        const today = todayInIndia();
        let q = db.selectFrom("documents").where("type", "=", type).where("deleted_at", "is", null).where("published_data", "is not", null);
        if (type === "event" && when === "upcoming") q = q.where("status", "=", "published").where("sort_date", ">=", today);
        else if (type === "event" && when === "past") q = q.where((eb) => eb.or([eb("status", "=", "archived"), eb("sort_date", "<", today)]));
        else q = q.where("status", "=", "published");
        if (section) q = q.where(sql<boolean>`published_data->>'section' = ${section}`);
        if (featured) q = q.where(sql<boolean>`(published_data->>'featured')::boolean is true`);
        if (year) q = q.where("sort_date", ">=", `${year}-01-01`).where("sort_date", "<=", `${year}-12-31`);
        if (from) q = q.where("sort_date", ">=", from);
        if (to) q = q.where("sort_date", "<=", to);
        // Searches titles, and issue dates as written ("October 28, 2026") for the FTCCI Review.
        const term = search?.trim();
        if (term) {
          const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
          q = q.where((eb) => eb.or([eb("title", "ilike", like), eb(sql`to_char(sort_date, 'FMMonth FMDD, YYYY')`, "ilike", like)]));
        }
        const { total } = await q.select((eb) => eb.fn.countAll<number>().as("total")).executeTakeFirstOrThrow();
        const ascending = type === "event" && when === "upcoming";
        const ordered =
          type === "publication" || type === "vacancy"
            ? q.orderBy("sort_order").orderBy("id")
            : q.orderBy("sort_date", ascending ? "asc" : "desc").orderBy("id", ascending ? "asc" : "desc");
        const rows = await ordered.select(["type", "slug", "status", "published_data"]).limit(limit).offset((page - 1) * limit).execute();
        const items = await withMedia(db, config, rows.map((r) => ({ type: r.type, data: r.published_data! })));
        return { total: Number(total), page, limit, items: items.map((data, i) => ({ slug: rows[i].slug, archived: rows[i].status === "archived", ...data })) };
      });
    },
  );

  app.get<{ Params: { type: string; slug: string } }>(
    "/api/content/item/:type/:slug",
    {
      schema: {
        params: { type: "object", properties: { type: { type: "string", enum: collections }, slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", maxLength: 100 } }, required: ["type", "slug"] },
      },
    },
    async (req, reply) => {
      const { type, slug } = req.params;
      const result = await cached(`item:${type}:${slug}`, async () => {
        const doc = await db.selectFrom("documents").select(["type", "slug", "status", "published_data", "published_at"]).where("type", "=", type).where("slug", "=", slug).where("deleted_at", "is", null).where("status", "in", ["published", "archived"]).executeTakeFirst();
        if (!doc?.published_data) return null;
        const [data] = await withMedia(db, config, [{ type: doc.type, data: doc.published_data }]);
        return { slug: doc.slug, archived: doc.status === "archived", publishedAt: doc.published_at, ...data };
      });
      return result ?? reply.code(404).send(notFound);
    },
  );

  // Draft content for staff previews. The token comes from the admin and expires after an hour.
  app.get<{ Params: { token: string } }>(
    "/api/content/preview/:token",
    { schema: { params: { type: "object", properties: { token: { type: "string", maxLength: 120 } }, required: ["token"] } } },
    async (req, reply) => {
      const id = readPreviewToken(config, req.params.token);
      if (!id) return reply.code(404).send({ error: "expired", message: "This preview link has expired. Open a new preview from the admin." });
      const doc = await getDocument(db, id).catch(() => null);
      if (!doc || !Object.hasOwn(contentTypes, doc.type)) return reply.code(404).send(notFound);
      const [data] = await withMedia(db, config, [{ type: doc.type, data: doc.data }]);
      return { type: doc.type, slug: doc.slug, preview: true, ...data };
    },
  );
}
