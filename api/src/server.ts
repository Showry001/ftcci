import { buildApp } from "./app.ts";
import { ConfigError, loadConfig } from "./config.ts";
import { createDb } from "./db/index.ts";
import { smtpTransport } from "./mail/transport.ts";

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
}

const db = createDb(config.databaseUrl);
const { app, mailer } = await buildApp({
  config,
  db,
  transport: smtpTransport(config),
  logger: { level: config.env === "production" ? "info" : "debug", redact: ["req.headers.cookie", "req.headers.authorization"] },
});

await app.listen({ host: config.host, port: config.port });
if (config.runWorker) mailer.start();
app.log.info(`Email goes out through ${config.smtp.host}:${config.smtp.port} as ${config.mailFrom.address}`);
app.log.info(config.adminLocalOnly ? "Admin API is on for this computer only (development)." : "Admin API is off until Phase 4 adds login.");

let closing = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    if (closing) return;
    closing = true;
    await app.close();
    await db.destroy();
    process.exit(0);
  });
}
