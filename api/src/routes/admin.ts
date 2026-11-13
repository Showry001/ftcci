// Admin API for form submissions and newsletter sign-ups. Every request needs a signed-in staff account
// (see ../staff/sessions.ts).
import type { FastifyInstance } from "fastify";
import { sql } from "kysely";
import type { Config } from "../config.ts";
import type { Db, SubmissionStatus, SubmissionType } from "../db/schema.ts";
import { MAX_ATTEMPTS, type Mailer } from "../mail/outbox.ts";
import { audit } from "../staff/audit.ts";
import { requireStaff } from "../staff/sessions.ts";

const PAGE_SIZE = 25;
const TYPES: SubmissionType[] = ["hall_booking", "membership", "event_interest", "contact"];
const STATUSES: SubmissionStatus[] = ["new", "contacted", "closed"];

// Escapes LIKE wildcards so a search for "50%" matches literally.
const like = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export async function adminRoutes(app: FastifyInstance, { db, config, mailer }: { db: Db; config: Config; mailer: Mailer }) {
  app.addHook("onRequest", requireStaff(db, config));

  app.get<{ Querystring: { type: SubmissionType; status?: SubmissionStatus; q?: string; page?: number } }>(
    "/api/admin/submissions",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["type"],
          additionalProperties: false,
          properties: {
            type: { type: "string", enum: TYPES },
            status: { type: "string", enum: STATUSES },
            q: { type: "string", maxLength: 100 },
            page: { type: "integer", minimum: 1, maximum: 10_000 },
          },
        },
      },
    },
    async (req) => {
      const { type, status, q, page = 1 } = req.query;
      let query = db.selectFrom("submissions").where("type", "=", type);
      const term = q?.trim();
      if (term) {
        const pattern = like(term);
        query = query.where((eb) =>
          eb.or(["reference", "name", "email", "organisation", "summary"].map((col) => eb(sql.ref(col), "ilike", pattern))),
        );
      }
      const counts = await query.select(["status", (eb) => eb.fn.countAll<string>().as("n")]).groupBy("status").execute();
      const filtered = status ? query.where("status", "=", status) : query;
      const items = await filtered
        .select(["reference", "status", "name", "email", "phone", "organisation", "summary", "created_at"])
        .orderBy("created_at", "desc")
        .orderBy("id", "desc")
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE)
        .execute();
      const byStatus = Object.fromEntries(STATUSES.map((s) => [s, Number(counts.find((c) => c.status === s)?.n ?? 0)]));
      const total = status ? byStatus[status] : Object.values(byStatus).reduce((a, b) => a + b, 0);
      return { items, total, page, pageSize: PAGE_SIZE, counts: byStatus };
    },
  );

  // Unread ("New") counts for the sidebar.
  app.get("/api/admin/summary", async () => {
    const rows = await db
      .selectFrom("submissions")
      .select(["type", (eb) => eb.fn.countAll<string>().as("n")])
      .where("status", "=", "new")
      .groupBy("type")
      .execute();
    const subscribers = await db
      .selectFrom("newsletter_subscribers")
      .select((eb) => eb.fn.countAll<string>().as("n"))
      .where("status", "=", "confirmed")
      .executeTakeFirstOrThrow();
    const failed = await db
      .selectFrom("email_outbox")
      .select((eb) => eb.fn.countAll<string>().as("n"))
      .where("status", "=", "failed")
      .executeTakeFirstOrThrow();
    return {
      new: Object.fromEntries(TYPES.map((t) => [t, Number(rows.find((r) => r.type === t)?.n ?? 0)])),
      subscribers: Number(subscribers.n),
      failedEmails: Number(failed.n),
    };
  });

  // Figures and recent changes for the dashboard.
  app.get("/api/admin/dashboard", async () => {
    const rows = await db
      .selectFrom("documents")
      .select(["type", "status", sql<number>`count(*)`.as("n"), sql<number>`count(*) filter (where has_changes and status <> 'draft')`.as("changed")])
      .where("deleted_at", "is", null)
      .groupBy(["type", "status"])
      .execute();
    const count = (type: string, status: string) => Number(rows.find((r) => r.type === type && r.status === status)?.n ?? 0);
    const recent = await db
      .selectFrom("documents")
      .select(["id", "type", "slug", "title", "status", "has_changes", "publish_at", "updated_at"])
      .where("deleted_at", "is", null)
      .orderBy("updated_at", "desc")
      .limit(6)
      .execute();
    return {
      published: { event: count("event", "published"), article: count("article", "published"), publication: count("publication", "published"), review: count("review", "published") },
      waiting: rows.reduce((n, r) => n + (r.status === "draft" && r.n ? Number(r.n) : 0) + Number(r.changed), 0),
      recent: recent.map((d) => ({ id: d.id, type: d.type, single: d.slug === null, title: d.title, status: d.status, hasChanges: d.has_changes, publishAt: d.publish_at, updatedAt: d.updated_at })),
    };
  });

  const refParam = {
    type: "object",
    required: ["reference"],
    properties: { reference: { type: "string", pattern: "^FTCCI-[A-Z]{2}-[0-9]{4}-[0-9]{6,}$" } },
  } as const;

  async function detail(reference: string) {
    const submission = await db
      .selectFrom("submissions")
      .select(["id", "type", "reference", "status", "name", "email", "phone", "organisation", "summary", "data", "notes", "created_at", "updated_at"])
      .where("reference", "=", reference)
      .executeTakeFirst();
    if (!submission) return null;
    const emails = await db
      .selectFrom("email_outbox")
      .select(["id", "kind", "to_address", "subject", "status", "attempts", "last_error", "next_attempt_at", "sent_at", "created_at"])
      .where("submission_id", "=", submission.id)
      .orderBy("id")
      .execute();
    const { id: _id, ...rest } = submission;
    return { submission: rest, emails };
  }

  app.get<{ Params: { reference: string } }>("/api/admin/submissions/:reference", { schema: { params: refParam } }, async (req, reply) => {
    const found = await detail(req.params.reference);
    return found ?? reply.code(404).send({ error: "not_found", message: "We couldn't find that submission." });
  });

  app.patch<{ Params: { reference: string }; Body: { status?: SubmissionStatus; notes?: string } }>(
    "/api/admin/submissions/:reference",
    {
      schema: {
        params: refParam,
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: { status: { type: "string", enum: STATUSES }, notes: { type: "string", maxLength: 5000 } },
        },
      },
    },
    async (req, reply) => {
      const { status, notes } = req.body;
      const before = await db.selectFrom("submissions").select(["status", "notes"]).where("reference", "=", req.params.reference).executeTakeFirst();
      const updated = await db
        .updateTable("submissions")
        .set({ ...(status ? { status } : {}), ...(notes !== undefined ? { notes: notes.replace(/\r\n?/g, "\n") } : {}), updated_at: new Date() })
        .where("reference", "=", req.params.reference)
        .returning("reference")
        .executeTakeFirst();
      if (!updated || !before) return reply.code(404).send({ error: "not_found", message: "We couldn't find that submission." });
      const target = { type: "submission", id: req.params.reference };
      if (status && status !== before.status) await audit(db, req, { action: "submission.status", target, summary: `Marked ${req.params.reference} as ${status[0].toUpperCase()}${status.slice(1)}` });
      if (notes !== undefined && notes.replace(/\r\n?/g, "\n") !== before.notes) await audit(db, req, { action: "submission.notes", target, summary: `Updated the notes on ${req.params.reference}` });
      return detail(req.params.reference);
    },
  );

  // Gives a failed email one more try straight away.
  app.post<{ Params: { id: number } }>(
    "/api/admin/emails/:id/retry",
    { schema: { params: { type: "object", required: ["id"], properties: { id: { type: "integer", minimum: 1 } } } } },
    async (req, reply) => {
      const row = await db
        .updateTable("email_outbox")
        .set({ status: "pending", attempts: MAX_ATTEMPTS - 1, next_attempt_at: new Date(), last_error: null })
        .where("id", "=", req.params.id)
        .where("status", "=", "failed")
        .returning("id")
        .executeTakeFirst();
      if (!row) return reply.code(409).send({ error: "not_failed", message: "Only failed emails can be retried." });
      await audit(db, req, { action: "submission.email_retried", target: { type: "email", id: row.id }, summary: "Retried a failed email" });
      await mailer.flush();
      const email = await db
        .selectFrom("email_outbox")
        .select(["id", "kind", "to_address", "subject", "status", "attempts", "last_error", "next_attempt_at", "sent_at", "created_at"])
        .where("id", "=", row.id)
        .executeTakeFirstOrThrow();
      return { email };
    },
  );

  app.get<{ Querystring: { status?: "pending" | "confirmed" | "unsubscribed"; q?: string; page?: number } }>(
    "/api/admin/newsletter",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            status: { type: "string", enum: ["pending", "confirmed", "unsubscribed"] },
            q: { type: "string", maxLength: 100 },
            page: { type: "integer", minimum: 1, maximum: 10_000 },
          },
        },
      },
    },
    async (req) => {
      const { status, q, page = 1 } = req.query;
      let query = db.selectFrom("newsletter_subscribers");
      const term = q?.trim();
      if (term) {
        const pattern = like(term);
        query = query.where((eb) => eb.or(["email", "first_name", "last_name", "business"].map((col) => eb(sql.ref(col), "ilike", pattern))));
      }
      const counts = await query.select(["status", (eb) => eb.fn.countAll<string>().as("n")]).groupBy("status").execute();
      const filtered = status ? query.where("status", "=", status) : query;
      const items = await filtered
        .select(["id", "email", "first_name", "last_name", "phone", "business", "source", "status", "confirmed_at", "created_at"])
        .orderBy("created_at", "desc")
        .orderBy("id", "desc")
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE)
        .execute();
      const byStatus = Object.fromEntries(["pending", "confirmed", "unsubscribed"].map((s) => [s, Number(counts.find((c) => c.status === s)?.n ?? 0)]));
      const total = status ? byStatus[status] : Object.values(byStatus).reduce((a, b) => a + b, 0);
      return { items, total, page, pageSize: PAGE_SIZE, counts: byStatus };
    },
  );
}
