import type { FastifyInstance, FastifyReply } from "fastify";
import { validate } from "../../../shared/forms.js";
import type { Config } from "../config.ts";
import type { Db } from "../db/schema.ts";
import { checkProof, newChallenge } from "../lib/altcha.ts";
import { confirm, subscribe } from "../lib/newsletter.ts";
import { createSubmission, formEntries } from "../lib/submissions.ts";
import type { Mailer } from "../mail/outbox.ts";

interface Envelope {
  data: Record<string, unknown>;
  altcha?: string;
  hp?: string;
}

const envelope = {
  type: "object",
  required: ["data"],
  additionalProperties: false,
  properties: {
    data: { type: "object" },
    altcha: { type: "string", maxLength: 4000 },
    // Honeypot: a field people never see. Anything typed into it means a bot filled the form.
    hp: { type: "string", maxLength: 200 },
  },
} as const;

const limit = (max: number, minutes: number) => ({ rateLimit: { max, timeWindow: minutes * 60_000 } });

const reject = (reply: FastifyReply, code: number, error: string, message: string, fields?: Record<string, string>) =>
  reply.code(code).send({ error, message, ...(fields ? { fields } : {}) });

const BOT = "We couldn't accept this form. Please try again, or email info@ftcci.in.";
const CHECK = "We couldn't confirm this request came from a person. Please try sending it again.";
const FIX = "Please correct the highlighted details and try again.";

export async function publicRoutes(app: FastifyInstance, { db, config, mailer }: { db: Db; config: Config; mailer: Mailer }) {
  app.get("/api/health", async () => {
    await db.selectNoFrom((eb) => eb.val(1).as("ok")).execute();
    return { ok: true };
  });

  app.get("/api/altcha", { config: limit(60, 10) }, async () => newChallenge(config.altcha));

  app.post<{ Params: { form: string }; Body: Envelope }>(
    "/api/forms/:form",
    {
      config: limit(5, 10),
      schema: {
        params: { type: "object", properties: { form: { type: "string", enum: Object.keys(formEntries) } }, required: ["form"] },
        body: envelope,
      },
    },
    async (req, reply) => {
      const entry = formEntries[req.params.form];
      if (req.body.hp) return reject(reply, 400, "rejected", BOT);
      const { ok, values, errors } = validate(entry.form, req.body.data);
      if (!ok) return reject(reply, 400, "invalid", FIX, errors);
      if (!(await checkProof(db, config.altcha, req.body.altcha))) return reject(reply, 403, "verification", CHECK);

      const reference = await createSubmission(db, config, entry, values);
      req.log.info({ reference, form: entry.form }, "Form submitted");
      void mailer.flush();
      return reply.code(201).send({ reference });
    },
  );

  app.post<{ Body: Envelope & { source: "home" | "footer" } }>(
    "/api/newsletter",
    {
      config: limit(5, 10),
      schema: {
        body: {
          ...envelope,
          required: ["data", "source"],
          properties: { ...envelope.properties, source: { type: "string", enum: ["home", "footer"] } },
        },
      },
    },
    async (req, reply) => {
      if (req.body.hp) return reject(reply, 400, "rejected", BOT);
      const { ok, values, errors } = validate(req.body.source === "home" ? "newsletter" : "newsletterQuick", req.body.data);
      if (!ok) return reject(reply, 400, "invalid", FIX, errors);
      if (!(await checkProof(db, config.altcha, req.body.altcha))) return reject(reply, 403, "verification", CHECK);

      await subscribe(db, config, values as { email: string }, req.body.source);
      void mailer.flush();
      return reply.code(202).send({ status: "check-email" });
    },
  );

  app.post<{ Body: { token: string } }>(
    "/api/newsletter/confirm",
    {
      config: limit(20, 10),
      schema: {
        body: {
          type: "object",
          required: ["token"],
          additionalProperties: false,
          properties: { token: { type: "string", minLength: 20, maxLength: 100, pattern: "^[A-Za-z0-9_-]+$" } },
        },
      },
    },
    async (req, reply) => {
      if (!(await confirm(db, config, req.body.token))) {
        return reject(reply, 400, "expired", "This confirmation link has expired or has already been used. Please sign up again.");
      }
      void mailer.flush();
      return { status: "confirmed" };
    },
  );
}
