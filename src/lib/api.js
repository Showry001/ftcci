// Talks to the FTCCI API (/api, served next to the site). Every form post carries an ALTCHA proof:
// the browser quietly solves a small puzzle the server can check, instead of showing a CAPTCHA.
import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/sha";

const OFFLINE = "We couldn't send your form. Please check your connection and try again, or email info@ftcci.in.";

export class FormError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.fields = fields;
  }
}

async function solve() {
  const res = await fetch("/api/altcha", { headers: { accept: "application/json" } });
  if (!res.ok) throw new FormError(OFFLINE);
  const challenge = await res.json();
  const solution = await solveChallenge({ challenge, deriveKey });
  if (!solution) throw new FormError(OFFLINE);
  return { payload: btoa(JSON.stringify({ challenge, solution })), expiresAt: (challenge.parameters.expiresAt ?? 0) * 1000 };
}

let ready = null;

/** Starts solving in the background (when a form opens) so sending feels instant. */
export function prepareProof() {
  if (ready) return;
  ready = solve();
  ready.catch(() => {
    ready = null;
  });
}

// Each proof works once, so a used or nearly expired one is never reused.
async function takeProof() {
  const pending = ready ?? solve();
  ready = null;
  let proof;
  try {
    proof = await pending;
  } catch {
    proof = await solve();
  }
  if (proof.expiresAt && proof.expiresAt - Date.now() < 60_000) proof = await solve();
  return proof.payload;
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new FormError(OFFLINE);
  }
  const json = await res.json().catch(() => null);
  if (res.ok && json) return json;
  throw new FormError(json?.message ?? OFFLINE, json?.fields ?? {});
}

/** @param {"hall-booking" | "membership" | "event-interest" | "contact"} form */
export async function sendForm(form, data, hp = "") {
  return post(`/api/forms/${form}`, { data, altcha: await takeProof(), hp });
}

/** @param {"home" | "footer"} source */
export async function joinNewsletter(source, data, hp = "") {
  return post("/api/newsletter", { data, source, altcha: await takeProof(), hp });
}

export const confirmNewsletter = (token) => post("/api/newsletter/confirm", { token });

/** The first field with a problem, in the order the form shows them. */
export const firstError = (errors, order) => order.find((name) => errors[name]);
