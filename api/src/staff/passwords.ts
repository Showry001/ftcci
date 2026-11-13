// Staff passwords are stored as Argon2id hashes (Node's built-in implementation) in the usual
// "$argon2id$v=19$m=…,t=…,p=…$salt$hash" form, with OWASP's recommended minimum settings.
import { argon2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(argon2);
const SETTINGS = { memory: 19_456, passes: 2, parallelism: 1 };
const TAG_LENGTH = 32;
export const MIN_PASSWORD = 12;
const MAX_PASSWORD = 200;

const b64 = (b: Buffer) => b.toString("base64").replace(/=+$/, "");

export async function hashPassword(password: string): Promise<string> {
  const nonce = randomBytes(16);
  const hash = await derive("argon2id", { message: password, nonce, tagLength: TAG_LENGTH, ...SETTINGS });
  return `$argon2id$v=19$m=${SETTINGS.memory},t=${SETTINGS.passes},p=${SETTINGS.parallelism}$${b64(nonce)}$${b64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const m = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/.exec(stored);
  if (!m) return false;
  const expected = Buffer.from(m[5], "base64");
  const hash = await derive("argon2id", {
    message: password,
    nonce: Buffer.from(m[4], "base64"),
    tagLength: expected.length,
    memory: Number(m[1]),
    passes: Number(m[2]),
    parallelism: Number(m[3]),
  });
  return timingSafeEqual(hash, expected);
}

// Checked against when an email has no account, so a wrong email takes as long as a wrong password.
let decoy: Promise<string> | undefined;
export const decoyHash = () => (decoy ??= hashPassword(randomBytes(16).toString("hex")));

/** A plain-language problem with a new password, or null when it's acceptable. */
export function passwordProblem(password: unknown, email: string): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (password.length > MAX_PASSWORD) return `Use at most ${MAX_PASSWORD} characters.`;
  if (/^(.)\1+$/.test(password)) return "Don't use one character repeated.";
  const lower = password.toLowerCase();
  const name = email.split("@")[0].toLowerCase();
  if (lower.includes(email.toLowerCase()) || (name.length >= 4 && lower.includes(name))) return "Don't use your email address in your password.";
  return null;
}
