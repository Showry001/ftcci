// Settings come from environment variables only (api/.env in development; see api/.env.example).
// Startup fails with a clear message when something is missing; secret values are never logged.
import { createHmac } from "node:crypto";
import { isEmail } from "../../shared/forms.js";

export type Address = { name: string; address: string };

export interface Config {
  env: "development" | "test" | "production";
  host: string;
  port: number;
  databaseUrl: string;
  publicSiteUrl: string;
  trustProxy: false | string[];
  smtp: { host: string; port: number; user: string; pass: string };
  mailFrom: Address;
  mailReplyTo: string | null;
  notify: { hallBooking: string; membership: string; eventInterest: string; contact: string; newsletter: string };
  altcha: { secret: string; keySecret: string; counterMin: number; counterMax: number };
  runWorker: boolean;
  /** The admin API exists only on a developer machine until Phase 4 adds login. */
  adminLocalOnly: boolean;
}

class ConfigError extends Error {}
const fail = (message: string): never => {
  throw new ConfigError(`Configuration error: ${message} See api/.env.example.`);
};

function read(env: NodeJS.ProcessEnv, name: string, fallback?: string): string {
  const value = env[name]?.trim();
  if (value) return value;
  if (fallback !== undefined) return fallback;
  return fail(`${name} is not set.`);
}

function email(env: NodeJS.ProcessEnv, name: string): string {
  const value = read(env, name);
  if (!isEmail(value)) fail(`${name} must be one email address.`);
  return value;
}

function port(env: NodeJS.ProcessEnv, name: string, fallback: string): number {
  const value = Number(read(env, name, fallback));
  if (!Number.isInteger(value) || value < 1 || value > 65535) fail(`${name} must be a port number.`);
  return value;
}

// "FTCCI <noreply@ftcci.in>" or a bare address.
function mailFrom(env: NodeJS.ProcessEnv): Address {
  const raw = read(env, "MAIL_FROM");
  const match = /^([A-Za-z0-9 .&()'-]{1,80}?)\s*<([^<>]+)>$/.exec(raw);
  const address = match ? match[2] : raw;
  if (!isEmail(address)) fail("MAIL_FROM must be an address, optionally with a name: FTCCI <noreply@ftcci.in>.");
  return { name: match ? match[1].trim() : "FTCCI", address };
}

// Behind Nginx, TRUST_PROXY names the proxy's address (127.0.0.1 when Nginx runs on the same server) so
// rate limits see the visitor's IP. Only these addresses may set X-Forwarded-For.
function trustProxy(env: NodeJS.ProcessEnv): false | string[] {
  const raw = env.TRUST_PROXY?.trim();
  if (!raw || raw === "false") return false;
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.some((s) => !/^(loopback|[0-9a-fA-F:.]+(\/\d{1,3})?)$/.test(s))) fail("TRUST_PROXY must be IP addresses or subnets, comma-separated (e.g. 127.0.0.1).");
  return list;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const mode = env.NODE_ENV === "production" ? "production" : env.NODE_ENV === "test" ? "test" : "development";
  const secret = read(env, "ALTCHA_HMAC_SECRET");
  if (secret.length < 32) fail("ALTCHA_HMAC_SECRET must be at least 32 characters.");
  const site = read(env, "PUBLIC_SITE_URL").replace(/\/+$/, "");
  if (!/^https?:\/\/[^\s/]+/.test(site)) fail("PUBLIC_SITE_URL must start with http:// or https://.");
  if (mode === "production" && !site.startsWith("https://")) fail("PUBLIC_SITE_URL must use https:// in production.");
  const replyTo = env.MAIL_REPLY_TO?.trim() || null;
  if (replyTo && !isEmail(replyTo)) fail("MAIL_REPLY_TO must be one email address.");

  return {
    env: mode,
    host: read(env, "HOST", "127.0.0.1"),
    port: port(env, "PORT", "8787"),
    databaseUrl: read(env, "DATABASE_URL"),
    publicSiteUrl: site,
    trustProxy: trustProxy(env),
    smtp: {
      host: read(env, "SMTP_HOST"),
      port: port(env, "SMTP_PORT", "587"),
      user: env.SMTP_USER?.trim() ?? "",
      pass: env.SMTP_PASS ?? "",
    },
    mailFrom: mailFrom(env),
    mailReplyTo: replyTo,
    notify: {
      hallBooking: email(env, "BOOKING_NOTIFY_EMAIL"),
      membership: email(env, "MEMBERSHIP_NOTIFY_EMAIL"),
      eventInterest: email(env, "EVENTS_NOTIFY_EMAIL"),
      contact: email(env, "CONTACT_NOTIFY_EMAIL"),
      newsletter: email(env, "NEWSLETTER_NOTIFY_EMAIL"),
    },
    altcha: {
      secret,
      keySecret: createHmac("sha256", secret).update("altcha-key-signature").digest("hex"),
      // The browser tries this many hashes on average (well under a second on a phone).
      counterMin: 10_000,
      counterMax: 40_000,
    },
    runWorker: env.RUN_WORKER !== "false",
    adminLocalOnly: mode !== "production",
  };
}

export { ConfigError };
