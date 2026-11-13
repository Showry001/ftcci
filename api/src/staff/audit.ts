// The activity log: who did what, to which item, from which address. Only Super Admins can read it.
// Entries keep a copy of the person's name and email, so they still read correctly after changes.
import type { FastifyRequest } from "fastify";
import type { Db } from "../db/schema.ts";

export interface AuditEntry {
  action: string;
  target?: { type: string; id: string | number };
  summary?: string;
}

export const actorOf = (s: { name: string; email: string }) => `${s.name} <${s.email}>`;

/** Records something a signed-in person did. */
export async function audit(db: Db, req: FastifyRequest, entry: AuditEntry) {
  await record(db, { ...entry, userId: req.staff?.id ?? null, actor: req.staff ? actorOf(req.staff) : "", ip: req.ip });
}

/** Records an event with no signed-in person: a sign-in attempt, the setup command, scheduled publishing. */
export async function record(db: Db, e: AuditEntry & { userId?: number | null; actor: string; ip?: string }) {
  await db
    .insertInto("audit_log")
    .values({
      user_id: e.userId ?? null,
      actor: e.actor.slice(0, 300),
      action: e.action,
      target_type: e.target?.type ?? "",
      target_id: e.target ? String(e.target.id) : "",
      summary: (e.summary ?? "").slice(0, 500),
      ip: e.ip ?? "",
    })
    .execute();
}
