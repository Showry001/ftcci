import { mkdirSync } from "node:fs";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyServerOptions } from "fastify";
import type { Config } from "./config.ts";
import type { Db } from "./db/schema.ts";
import { createJobRunner } from "./jobs.ts";
import { createMailer, type Transport } from "./mail/outbox.ts";
import { adminContentRoutes } from "./routes/admin-content.ts";
import { adminRoutes } from "./routes/admin.ts";
import { contentRoutes } from "./routes/content.ts";
import { publicRoutes } from "./routes/public.ts";

const SERVER_ERROR = "Something went wrong on our side. Please try again in a few minutes, or email info@ftcci.in.";

export async function buildApp({ config, db, transport, logger = true }: { config: Config; db: Db; transport: Transport; logger?: FastifyServerOptions["logger"] }) {
  const app = Fastify({
    logger,
    trustProxy: config.trustProxy,
    bodyLimit: 64 * 1024,
    return503OnClosing: true,
  });
  // Form posts must be JSON; dropping the text/plain parser also stops plain cross-site form posts.
  app.removeContentTypeParser("text/plain");

  const mailer = createMailer(db, transport, config, app.log);
  const jobs = createJobRunner(db, config, app.log);

  app.addHook("onSend", async (_req, reply) => {
    if (!reply.hasHeader("cache-control")) reply.header("cache-control", "no-store");
    reply.header("x-content-type-options", "nosniff");
    reply.header("x-frame-options", "DENY");
    reply.header("referrer-policy", "no-referrer");
    reply.header("content-security-policy", "default-src 'none'; frame-ancestors 'none'");
  });

  // Clients only ever see a short, plain message; details stay in the server log.
  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, req, reply) => {
    const status = error.statusCode ?? 500;
    if (status === 429) {
      return reply.code(429).send({ error: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." });
    }
    if (status >= 500) {
      req.log.error({ err: error }, "Request failed");
      return reply.code(500).send({ error: "server_error", message: SERVER_ERROR });
    }
    const message = error.validation ? "Some of the details sent were not in the expected format." : error.message;
    return reply.code(status).send({ error: "bad_request", message });
  });
  app.setNotFoundHandler((_req, reply) => reply.code(404).send({ error: "not_found", message: "Not found." }));

  await app.register(rateLimit, { global: false });
  await app.register(publicRoutes, { db, config, mailer });
  await app.register(contentRoutes, { db, config });
  if (config.adminLocalOnly) {
    await app.register(adminRoutes, { db, mailer });
    await app.register(adminContentRoutes, { db, config, jobs });
  }

  // Uploaded files. In production Nginx serves MEDIA_DIR directly; this covers development.
  mkdirSync(config.media.dir, { recursive: true });
  await app.register(fastifyStatic, {
    root: config.media.dir,
    prefix: "/media/",
    decorateReply: false,
    index: false,
    dotfiles: "deny",
    allowedPath: (path) => !path.startsWith("/tmp/"),
    // Every upload gets a new folder, so its files never change and can be cached for a year.
    setHeaders: (reply) => {
      reply.header("cache-control", "public, max-age=31536000, immutable");
    },
  });

  app.addHook("onClose", async () => {
    await mailer.stop();
    await jobs.stop();
  });
  return { app, mailer, jobs };
}
