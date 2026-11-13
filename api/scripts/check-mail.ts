// `npm run mail:check`: signs in to the mail server in api/.env and reports the result. Sends nothing.
import { ConfigError, loadConfig } from "../src/config.ts";
import { smtpTransport } from "../src/mail/transport.ts";

try {
  const config = loadConfig();
  const { host, port, user } = config.smtp;
  await smtpTransport(config).verify();
  console.log(`OK: connected to ${host}:${port}${user ? ` and signed in as ${user}` : ""}. Emails will be sent from ${config.mailFrom.address}.`);
} catch (err) {
  console.error(err instanceof ConfigError ? err.message : `Could not use the mail server: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
