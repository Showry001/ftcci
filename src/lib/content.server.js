// Reads published content from the FTCCI API for route loaders (server only; never sent to browsers).
// A `?preview=<token>` link from the admin shows that item's unpublished changes instead.
const API = (process.env.API_URL ?? "http://127.0.0.1:8787").replace(/\/+$/, "");
const UNAVAILABLE = "This page is temporarily unavailable. Please try again in a few minutes.";

async function get(path) {
  let res;
  try {
    res = await fetch(`${API}${path}`, { headers: { accept: "application/json" } });
  } catch {
    throw new Response(UNAVAILABLE, { status: 503 });
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Response(UNAVAILABLE, { status: 503 });
  return res.json();
}

// Several loaders run for one page; the preview is fetched once per request.
const previews = new WeakMap();
function preview(request) {
  const token = new URL(request.url).searchParams.get("preview");
  if (!token) return Promise.resolve(null);
  if (!previews.has(request)) previews.set(request, get(`/api/content/preview/${encodeURIComponent(token)}`));
  return previews.get(request);
}

export const isPreview = (request) => new URL(request.url).searchParams.has("preview");

/** The published content of a page or block (Home page, About page, footer, …). */
export async function single(type, request) {
  const draft = await preview(request);
  if (draft?.type === type) return draft;
  const doc = await get(`/api/content/single/${type}`);
  if (!doc) throw new Response(UNAVAILABLE, { status: 503 });
  return doc.data;
}

/** Published items of a collection, newest first unless the API orders them otherwise. */
export async function list(type, params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  return get(`/api/content/list/${type}${query.size ? `?${query}` : ""}`);
}

/** One published (or archived) item, or a 404 page. */
export async function item(type, slug, request) {
  const draft = await preview(request);
  if (draft?.type === type && draft.slug === slug) return draft;
  const doc = await get(`/api/content/item/${type}/${encodeURIComponent(slug)}`);
  if (!doc) throw new Response("Not found", { status: 404 });
  return doc;
}
