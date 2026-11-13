// Staff accounts and the activity log. Super Admins only. Accounts are never deleted: disabling one ends
// its sessions and stops it signing in, and it can be enabled again.
import type { FastifyInstance } from "fastify";
import { sql } from "kysely";
import { isEmail } from "../../../shared/forms.js";
import type { Config } from "../config.ts";
import type { Db, StaffRole, StaffUser } from "../db/schema.ts";
import type { Mailer } from "../mail/outbox.ts";
import { staffInvite } from "../mail/templates.ts";
import { normalEmail } from "../staff/accounts.ts";
import { audit } from "../staff/audit.ts";
import { endSessions, requireStaff, superAdminOnly } from "../staff/sessions.ts";

const ROLES: StaffRole[] = ["super_admin", "admin"];
const roleLabel: Record<StaffRole, string> = { super_admin: "Super Admin", admin: "Admin" };
const idParam = { type: "object", required: ["id"], properties: { id: { type: "integer", minimum: 1 } } } as const;
const cleanName = (s: string) => s.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
const like = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

const view = (u: StaffUser) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  hasPassword: u.password_hash !== null,
  locked: Boolean(u.locked_until && u.locked_until > new Date()),
  disabled: u.disabled_at !== null,
  lastSignInAt: u.last_sign_in_at,
  createdAt: u.created_at,
});

export async function staffRoutes(app: FastifyInstance, { db, config, mailer }: { db: Db; config: Config; mailer: Mailer }) {
  app.addHook("onRequest", requireStaff(db, config));
  app.addHook("preHandler", superAdminOnly);

  app.get("/api/admin/staff", async () => {
    const rows = await db.selectFrom("staff_users").selectAll().orderBy(sql`disabled_at is not null`).orderBy("name").execute();
    return { items: rows.map(view) };
  });

  app.post<{ Body: { name: string; email: string; role: StaffRole } }>(
    "/api/admin/staff",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["name", "email", "role"],
          properties: { name: { type: "string", maxLength: 120 }, email: { type: "string", maxLength: 254 }, role: { type: "string", enum: ROLES } },
        },
      },
    },
    async (req, reply) => {
      const name = cleanName(req.body.name);
      const email = normalEmail(req.body.email);
      const fields: Record<string, string> = {};
      if (!name) fields.name = "Enter their name.";
      if (!isEmail(email)) fields.email = "Enter a valid email address.";
      if (Object.keys(fields).length) return reply.code(400).send({ error: "invalid", message: "Please correct the highlighted fields.", fields });
      const exists = await db.selectFrom("staff_users").select("id").where("email", "=", email).executeTakeFirst();
      if (exists) return reply.code(409).send({ error: "exists", message: "There is already an account for this email.", fields: { email: "There is already an account for this email." } });

      const user = await db.insertInto("staff_users").values({ name, email, role: req.body.role }).returningAll().executeTakeFirstOrThrow();
      await audit(db, req, { action: "staff.created", target: { type: "staff", id: user.id }, summary: `Added ${name} <${email}> as ${roleLabel[user.role]}` });
      void mailer.sendNow("staff_invite", email, staffInvite(name, req.staff!.name, roleLabel[user.role], `${config.staff.adminUrl}/sign-in`));
      reply.code(201);
      return view(user);
    },
  );

  app.patch<{ Params: { id: number }; Body: { name?: string; role?: StaffRole; disabled?: boolean } }>(
    "/api/admin/staff/:id",
    {
      schema: {
        params: idParam,
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: { name: { type: "string", maxLength: 120 }, role: { type: "string", enum: ROLES }, disabled: { type: "boolean" } },
        },
      },
    },
    async (req, reply) => {
      const user = await db.selectFrom("staff_users").selectAll().where("id", "=", req.params.id).executeTakeFirst();
      if (!user) return reply.code(404).send({ error: "not_found", message: "We couldn't find that account." });
      const { role, disabled } = req.body;
      const name = req.body.name === undefined ? undefined : cleanName(req.body.name);
      if (name === "") return reply.code(400).send({ error: "invalid", message: "Enter their name.", fields: { name: "Enter their name." } });
      const disabling = disabled === true && !user.disabled_at;
      // Nobody can demote or disable themselves, so the Super Admin making a change always remains: there
      // is always at least one active Super Admin.
      if (user.id === req.staff!.id && ((role !== undefined && role !== user.role) || disabling)) {
        return reply.code(400).send({ error: "self", message: "You can't change your own role or disable your own account. Ask another Super Admin." });
      }

      const updated = await db
        .updateTable("staff_users")
        .set({
          ...(name !== undefined ? { name } : {}),
          ...(role !== undefined ? { role } : {}),
          ...(disabled !== undefined ? { disabled_at: disabled ? (user.disabled_at ?? new Date()) : null } : {}),
          updated_at: new Date(),
        })
        .where("id", "=", user.id)
        .returningAll()
        .executeTakeFirstOrThrow();
      if (disabling) await endSessions(db, user.id);

      const changes = [
        name !== undefined && name !== user.name ? `name to ${name}` : "",
        role !== undefined && role !== user.role ? `role to ${roleLabel[role]}` : "",
      ].filter(Boolean);
      const target = { type: "staff", id: user.id };
      if (changes.length) await audit(db, req, { action: "staff.updated", target, summary: `Changed ${user.name}'s ${changes.join(" and ")}` });
      if (disabling) await audit(db, req, { action: "staff.disabled", target, summary: `Disabled ${user.name} <${user.email}> and ended their sessions` });
      if (disabled === false && user.disabled_at) await audit(db, req, { action: "staff.enabled", target, summary: `Enabled ${user.name} <${user.email}>` });
      return view(updated);
    },
  );

  app.post<{ Params: { id: number } }>("/api/admin/staff/:id/unlock", { schema: { params: idParam } }, async (req, reply) => {
    const user = await db.updateTable("staff_users").set({ locked_until: null, failed_passwords: 0, updated_at: new Date() }).where("id", "=", req.params.id).returningAll().executeTakeFirst();
    if (!user) return reply.code(404).send({ error: "not_found", message: "We couldn't find that account." });
    await audit(db, req, { action: "staff.unlocked", target: { type: "staff", id: user.id }, summary: `Allowed ${user.name} to sign in with a password again` });
    return view(user);
  });

  app.get<{ Querystring: { q?: string; user?: number; kind?: string; page?: number } }>(
    "/api/admin/activity",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            q: { type: "string", maxLength: 100 },
            user: { type: "integer", minimum: 1 },
            kind: { type: "string", enum: ["auth", "content", "media", "submission", "staff", "account"] },
            page: { type: "integer", minimum: 1, maximum: 10_000 },
          },
        },
      },
    },
    async (req) => {
      const { q, user, kind, page = 1 } = req.query;
      let query = db.selectFrom("audit_log");
      if (user) query = query.where("user_id", "=", user);
      if (kind) query = query.where("action", "like", `${kind}.%`);
      if (q?.trim()) query = query.where((eb) => eb.or([eb("actor", "ilike", like(q.trim())), eb("summary", "ilike", like(q.trim())), eb("ip", "ilike", like(q.trim()))]));
      const { total } = await query.select(sql<number>`count(*)`.as("total")).executeTakeFirstOrThrow();
      const items = await query.selectAll().orderBy("id", "desc").limit(50).offset((page - 1) * 50).execute();
      return { total: Number(total), page, pageSize: 50, items };
    },
  );
}
