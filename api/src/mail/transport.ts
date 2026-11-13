import { createTransport } from "nodemailer";
import type { Config } from "../config.ts";
import type { Transport } from "./outbox.ts";

// Port 465 uses TLS from the start; port 587 must upgrade with STARTTLS (required, never optional).
// The local development catcher on port 1025 speaks plain SMTP.
export function smtpTransport({ smtp }: Config): Transport & { verify(): Promise<unknown> } {
  return createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port === 587,
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    tls: { minVersion: "TLSv1.2" },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });
}
