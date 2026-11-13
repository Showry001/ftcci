// `npm run seed`: loads the site's starting content (api/seed/content.json) into the database and the
// media library, and publishes it. Safe to run again: existing pages are refreshed, existing collection
// items are kept, and identical files are stored once.
//   --skip-reviews   leave out the FTCCI Review archive (about 2 GB from ftcci.in)
//   --only=review    load just one content type
// Images come from api/seed/assets (or the site's public/assets); documents are downloaded from ftcci.in
// once and cached in api/.data/import-cache.
import { createHash, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";
import { type Config, ConfigError, loadConfig } from "../src/config.ts";
import { createDocument, getSingle, publishDocument, saveDocument } from "../src/content/documents.ts";
import { createDb } from "../src/db/index.ts";
import { storeFile } from "../src/media/store.ts";

type Ref = { $asset?: string; $ftcci?: string; alt?: string; crop?: { x: number; y: number; w: number; h: number } };
type Seed = { singles: Record<string, Record<string, unknown>>; collections: Record<string, { slug?: string; data: Record<string, unknown> }[]> };

let config: Config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
}
const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7);
const skipReviews = args.includes("--skip-reviews");

const db = createDb(config.databaseUrl);
const here = (p: string) => new URL(p, import.meta.url).pathname;
const seed: Seed = JSON.parse(await readFile(here("../seed/content.json"), "utf8"));
const cacheDir = here("../.data/import-cache");
const tmpDir = join(config.media.dir, "tmp");
await mkdir(cacheDir, { recursive: true });
await mkdir(tmpDir, { recursive: true });

const missing: string[] = [];
const done = new Map<string, number | null>();

async function download(path: string): Promise<string | null> {
  const cached = join(cacheDir, createHash("sha1").update(path).digest("hex") + (path.match(/\.\w+$/)?.[0] ?? ""));
  if (existsSync(cached)) return cached;
  const url = `https://www.ftcci.in/source/${path.split("/").map(encodeURIComponent).join("/")}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await writeFile(cached, Buffer.from(await res.arrayBuffer()));
      return cached;
    } catch (err) {
      if (attempt === 3) throw new Error(`Could not download ${path}: ${err instanceof Error ? err.message : err}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
}

async function toMedia(ref: Ref, alt: string): Promise<number | null> {
  const key = JSON.stringify(ref);
  if (done.has(key)) return done.get(key)!;
  let source: string | null;
  let name: string;
  if (ref.$asset) {
    source = [here(`../seed/assets/${ref.$asset}`), here(`../../public/assets/${ref.$asset}`)].find((p) => existsSync(p)) ?? null;
    name = basename(ref.$asset);
  } else {
    source = await download(ref.$ftcci!);
    name = basename(ref.$ftcci!);
  }
  if (!source) {
    missing.push(ref.$asset ?? ref.$ftcci!);
    done.set(key, null);
    return null;
  }
  let input = source;
  if (ref.crop) {
    // Apply the crop the old design used, so the stored photo is exactly what was shown.
    const image = sharp(source);
    const { width = 0, height = 0 } = await image.metadata();
    const left = Math.round(ref.crop.x * width);
    const top = Math.round(ref.crop.y * height);
    input = join(tmpDir, randomBytes(8).toString("hex") + ".png");
    await image
      .extract({ left, top, width: Math.min(width - left, Math.round(ref.crop.w * width)), height: Math.min(height - top, Math.round(ref.crop.h * height)) })
      .png()
      .toFile(input);
  }
  try {
    const { media } = await storeFile(db, config, { tempPath: input, originalName: name, alt: ref.alt ?? alt });
    done.set(key, media.id);
    return media.id;
  } finally {
    if (input !== source) await rm(input, { force: true });
  }
}

const isRef = (v: unknown): v is Ref => Boolean(v && typeof v === "object" && ("$asset" in v || "$ftcci" in v));

/** Replaces { $asset } / { $ftcci } with media ids, using the nearest title or name as alt text. */
async function resolve(value: unknown, alt = ""): Promise<unknown> {
  if (isRef(value)) return toMedia(value, alt);
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await resolve(item, alt));
    return out;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const label = String(obj.title ?? obj.name ?? obj.label ?? alt);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = await resolve(v, k === "logo" ? `${label} logo` : k === "cover" ? `Cover of ${label}` : label);
    return out;
  }
  return value;
}

try {
  for (const [type, raw] of Object.entries(seed.singles)) {
    if (only && only !== type) continue;
    const doc = await getSingle(db, type as never);
    await saveDocument(db, doc.id, await resolve(raw, type === "home" ? "FTCCI" : ""));
    await publishDocument(db, doc.id);
    console.log(`page   ${type}`);
  }

  for (const [type, items] of Object.entries(seed.collections)) {
    if ((only && only !== type) || (type === "review" && skipReviews && only !== "review")) continue;
    let added = 0;
    for (const [order, item] of items.entries()) {
      const slug = item.slug ?? (type === "review" ? `ftcci-review-${item.data.date}` : undefined);
      const title = String(item.data.title ?? slug ?? "");
      const exists = await db
        .selectFrom("documents")
        .select("id")
        .where("type", "=", type)
        .where("deleted_at", "is", null)
        .where((eb) => (slug ? eb("slug", "=", slug) : eb("title", "=", title)))
        .executeTakeFirst();
      if (exists) continue;
      const data = (await resolve(item.data, type === "review" ? `FTCCI Review ${item.data.date}` : title)) as Record<string, unknown>;
      if (type === "review" && !data.file) continue;
      const doc = await createDocument(db, type as never, data, slug);
      await db.updateTable("documents").set({ sort_order: order }).where("id", "=", doc.id).execute();
      await publishDocument(db, doc.id);
      added++;
      if (type === "review" && added % 10 === 0) console.log(`review ${added} of ${items.length}…`);
    }
    console.log(`${type.padEnd(6)} ${added} added (${items.length} in the seed)`);
  }
  if (missing.length) console.warn(`Not found, left empty (${missing.length}):\n  ${missing.join("\n  ")}`);
} finally {
  await db.destroy();
}
