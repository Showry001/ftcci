// The media library: accepts an uploaded file, works out what it really is from its content (never
// the file name or the browser's claim), and stores it under MEDIA_DIR.
// Images are re-encoded into WebP sizes plus a JPEG (which also drops hidden metadata), PDFs are kept
// as they are, and videos are queued for ffmpeg (see video.ts).
import { createHash, randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, open, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileTypeFromFile } from "file-type";
import sharp from "sharp";
import type { Config } from "../config.ts";
import type { Db, Media, MediaKind, MediaVariant } from "../db/schema.ts";

export const LIMITS: Record<MediaKind, number> = { image: 20 * 1024 ** 2, pdf: 100 * 1024 ** 2, video: 200 * 1024 ** 2 };
export const MAX_UPLOAD = Math.max(...Object.values(LIMITS));
const TYPES: Record<string, { kind: MediaKind; ext: string }> = {
  "image/jpeg": { kind: "image", ext: "jpg" },
  "image/png": { kind: "image", ext: "png" },
  "image/webp": { kind: "image", ext: "webp" },
  "image/gif": { kind: "image", ext: "gif" },
  "image/avif": { kind: "image", ext: "avif" },
  "application/pdf": { kind: "pdf", ext: "pdf" },
  "video/mp4": { kind: "video", ext: "mp4" },
  "video/quicktime": { kind: "video", ext: "mov" },
  "video/webm": { kind: "video", ext: "webm" },
};
const WIDTHS = [480, 960, 1600, 2400];
const MAX_PIXELS = 60_000_000;

export class MediaError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const mb = (bytes: number) => `${Math.round(bytes / 1024 ** 2)} MB`;
export const slugName = (name: string) =>
  name.replace(/\.[^.]*$/, "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";

async function sha256(path: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function startsWith(path: string, magic: string) {
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(magic.length);
    await handle.read(buffer, 0, magic.length, 0);
    return buffer.toString("latin1") === magic;
  } finally {
    await handle.close();
  }
}

/** Folder for a new upload, e.g. 2026/10/9f2c…; unguessable and never reused. */
function newFolder(now = new Date()) {
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(8).toString("hex")}`;
}

async function imageVariants(source: string, folder: string, root: string) {
  const input = () => sharp(source, { limitInputPixels: MAX_PIXELS, failOn: "error", animated: false }).rotate();
  const meta = await input().metadata();
  if (!meta.width || !meta.height) throw new MediaError("This image could not be read.");
  const [width, height] = meta.orientation && meta.orientation >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  const variants: MediaVariant[] = [];
  for (const w of new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 2400)])) {
    const out = `${folder}/w${w}.webp`;
    const info = await input().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(root, out));
    variants.push({ path: out, width: info.width, height: info.height, format: "webp", bytes: info.size });
  }
  const main = `${folder}/image.jpg`;
  const info = await input()
    .resize({ width: 2400, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(join(root, main));
  return { main, width: info.width, height: info.height, bytes: info.size, variants };
}

export interface Stored {
  media: Media;
  duplicate: boolean;
}

/**
 * Stores a file that has been written to `tempPath`. `expect` limits what the caller accepts.
 * Identical files (same SHA-256) are stored once and the existing item is returned.
 */
export async function storeFile(
  db: Db,
  config: Config,
  { tempPath, originalName, expect, alt = "", title = "" }: { tempPath: string; originalName: string; expect?: MediaKind[]; alt?: string; title?: string },
): Promise<Stored> {
  const { size } = await stat(tempPath);
  const detected = await fileTypeFromFile(tempPath);
  const type = detected && TYPES[detected.mime];
  if (!type) throw new MediaError("This file type isn't accepted. Upload a JPG, PNG, WebP, GIF or AVIF image, a PDF, or an MP4, MOV or WebM video.");
  if (expect && !expect.includes(type.kind)) throw new MediaError(`Please upload ${expect.map((k) => (k === "pdf" ? "a PDF" : `an ${k}`)).join(" or ")} here.`);
  if (size > LIMITS[type.kind]) throw new MediaError(`This ${type.kind === "pdf" ? "PDF" : type.kind} is ${mb(size)}; the limit is ${mb(LIMITS[type.kind])}.`, 413);
  if (type.kind === "pdf" && !(await startsWith(tempPath, "%PDF-"))) throw new MediaError("This PDF is damaged or not a real PDF.");

  const hash = await sha256(tempPath);
  const existing = await db.selectFrom("media").selectAll().where("sha256", "=", hash).where("deleted_at", "is", null).executeTakeFirst();
  if (existing) return { media: existing, duplicate: true };

  const root = config.media.dir;
  const folder = newFolder();
  await mkdir(join(root, folder), { recursive: true });
  const name = originalName.slice(0, 200) || `upload.${type.ext}`;
  try {
    if (type.kind === "image") {
      const img = await imageVariants(tempPath, folder, root);
      const media = await db
        .insertInto("media")
        .values({
          kind: "image", original_name: name, mime: "image/jpeg", bytes: img.bytes, sha256: hash, path: img.main,
          width: img.width, height: img.height, duration: null, poster_path: null, error: null,
          variants: JSON.stringify(img.variants), alt: alt.slice(0, 300), title: title.slice(0, 200),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return { media, duplicate: false };
    }
    const target = `${folder}/${type.kind === "pdf" ? slugName(name) : "source"}.${type.ext}`;
    await copyFile(tempPath, join(root, target));
    const media = await db
      .insertInto("media")
      .values({
        kind: type.kind, status: type.kind === "video" ? "processing" : "ready", original_name: name, mime: detected.mime,
        bytes: size, sha256: hash, path: target, width: null, height: null, duration: null, poster_path: null, error: null,
        alt: alt.slice(0, 300), title: title.slice(0, 200) || (type.kind === "pdf" ? name.replace(/\.pdf$/i, "") : ""),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    if (type.kind === "video") await db.insertInto("jobs").values({ kind: "video", payload: JSON.stringify({ mediaId: media.id }) }).execute();
    return { media, duplicate: false };
  } catch (err) {
    await rm(join(root, folder), { recursive: true, force: true });
    if (err instanceof MediaError) throw err;
    throw new MediaError(type.kind === "image" ? "This image could not be processed. Try saving it again as JPG or PNG." : "This file could not be stored.");
  }
}

/** What the public site and the admin get for a media item. */
export function mediaView(m: Media, config: Config) {
  const at = (path: string) => `${config.media.url}/${path}`;
  const base = { id: m.id, kind: m.kind, status: m.status, alt: m.alt, title: m.title, name: m.original_name, bytes: m.bytes };
  if (m.kind === "image") {
    return {
      ...base,
      url: at(m.path),
      width: m.width,
      height: m.height,
      srcset: m.variants.map((v) => `${at(v.path)} ${v.width}w`).join(", "),
    };
  }
  if (m.kind === "video") {
    return {
      ...base,
      url: m.status === "ready" ? at(m.path) : null,
      mobileUrl: m.status === "ready" && m.variants[0] ? at(m.variants[0].path) : null,
      poster: m.poster_path ? at(m.poster_path) : null,
      width: m.width,
      height: m.height,
      duration: m.duration,
    };
  }
  return { ...base, url: at(m.path) };
}
export type MediaView = ReturnType<typeof mediaView>;
