// ALTCHA: a self-hosted proof-of-work check that replaces a CAPTCHA. The browser spends a fraction of
// a second finding a number the server can verify instantly; no third party is involved and visitors
// see nothing. Each solved challenge works once.
import { createChallenge, randomInt, verifySolution, type Challenge, type Solution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/sha";
import type { Config } from "../config.ts";
import type { Db } from "../db/schema.ts";

const LIFETIME_MS = 30 * 60 * 1000;

export function newChallenge(config: Config["altcha"]): Promise<Challenge> {
  return createChallenge({
    algorithm: "SHA-256",
    cost: 1,
    counter: randomInt(config.counterMax, config.counterMin),
    deriveKey,
    hmacSignatureSecret: config.secret,
    hmacKeySignatureSecret: config.keySecret,
    expiresAt: new Date(Date.now() + LIFETIME_MS),
  });
}

function parse(payload: string): { challenge: Challenge; solution: Solution } | null {
  try {
    const value = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    const ok =
      value && typeof value === "object" &&
      value.challenge && typeof value.challenge === "object" &&
      value.challenge.parameters && typeof value.challenge.parameters === "object" &&
      typeof value.challenge.parameters.nonce === "string" &&
      value.solution && typeof value.solution === "object" &&
      Number.isInteger(value.solution.counter) && typeof value.solution.derivedKey === "string";
    return ok ? { challenge: value.challenge, solution: value.solution } : null;
  } catch {
    return null;
  }
}

/** True when the payload solves a challenge we issued, has not expired and was not used before. */
export async function checkProof(db: Db, config: Config["altcha"], payload: unknown): Promise<boolean> {
  if (typeof payload !== "string" || !payload || payload.length > 4000) return false;
  const parsed = parse(payload);
  if (!parsed) return false;
  let verified = false;
  try {
    const result = await verifySolution({
      challenge: parsed.challenge,
      solution: parsed.solution,
      deriveKey,
      hmacSignatureSecret: config.secret,
      hmacKeySignatureSecret: config.keySecret,
    });
    verified = result.verified;
  } catch {
    verified = false;
  }
  if (!verified) return false;

  // Record the challenge so the same solution can't be replayed.
  const expires = parsed.challenge.parameters.expiresAt;
  const inserted = await db
    .insertInto("altcha_used")
    .values({ id: parsed.challenge.parameters.nonce, expires_at: new Date((expires ?? 0) * 1000 || Date.now() + LIFETIME_MS) })
    .onConflict((oc) => oc.column("id").doNothing())
    .returning("id")
    .executeTakeFirst();
  return Boolean(inserted);
}

export async function forgetExpiredProofs(db: Db): Promise<void> {
  await db.deleteFrom("altcha_used").where("expires_at", "<", new Date()).execute();
}
