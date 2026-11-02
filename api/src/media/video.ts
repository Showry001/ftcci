// Turns an uploaded video into web-ready hero video files, all H.264 MP4 with "fast start" (playback
// begins before the whole file arrives) and no audio track (the hero always plays muted):
//   - 1080p at CRF 21, with the bitrate capped below the source's so the result is never larger. If the
//     source is already H.264 at up to 1080p and re-encoding wouldn't shrink it, its video is kept as is.
//   - 720p at a lower bitrate for phones, so playback stays smooth on slower connections.
// Plus a poster image taken one second in.
import { spawn } from "node:child_process";
import { rename, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import type { Config } from "../config.ts";
import type { Db, MediaVariant } from "../db/schema.ts";

function run(ffmpeg: string, args: string[], signal?: AbortSignal, allowFailure = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, ["-hide_banner", "-nostdin", ...args], { stdio: ["ignore", "ignore", "pipe"], signal });
    let log = "";
    child.stderr.on("data", (chunk) => {
      log = (log + chunk).slice(-20_000);
    });
    child.on("error", (err) => reject(signal?.aborted ? err : new Error(`ffmpeg could not start (${err.message}). Set FFMPEG_PATH.`)));
    child.on("close", (code) => (code === 0 || allowFailure ? resolve(log) : reject(new Error(`ffmpeg failed: ${log.trim().split("\n").slice(-2).join(" ")}`))));
  });
}

/** Reads duration, size and codec from ffmpeg's description of the input (ffmpeg -i exits non-zero by design). */
async function probe(ffmpeg: string, path: string, signal?: AbortSignal) {
  const log = await run(ffmpeg, ["-i", path], signal, true);
  const duration = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(log);
  const video = /Stream #\d+:\d+[^:]*: Video: (\w+)[^\n]*?, (\d{2,5})x(\d{2,5})/.exec(log);
  if (!duration || !video) throw new Error("This file has no video track that can be read.");
  return {
    seconds: Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]),
    codec: video[1],
    width: Number(video[2]),
    height: Number(video[3]),
  };
}

const encode = (input: string, output: string, height: number, crf: number, maxKbps: number) => [
  "-y", "-i", input,
  "-map", "0:v:0", "-an", "-sn", "-dn", "-map_metadata", "-1",
  "-vf", `scale=-2:'min(${height},ih)',format=yuv420p`,
  "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-maxrate", `${maxKbps}k`, "-bufsize", `${maxKbps * 2}k`,
  "-profile:v", "high", "-movflags", "+faststart", output,
];

export async function processVideo(db: Db, config: Config, mediaId: number, signal?: AbortSignal): Promise<void> {
  const media = await db.selectFrom("media").selectAll().where("id", "=", mediaId).executeTakeFirstOrThrow();
  if (media.status === "ready") return;
  const ffmpeg = config.media.ffmpeg;
  const root = config.media.dir;
  const folder = dirname(media.path);
  const source = join(root, media.path);
  const at = (name: string) => join(root, folder, name);

  const info = await probe(ffmpeg, source, signal);
  const { size: sourceBytes } = await stat(source);
  const sourceKbps = Math.max(500, Math.round((sourceBytes * 8) / 1000 / Math.max(info.seconds, 1)));

  await run(ffmpeg, encode(source, at("video.mp4"), 1080, 21, Math.min(Math.round(sourceKbps * 0.9), 5000)), signal);
  const { size: encodedBytes } = await stat(at("video.mp4"));
  if (encodedBytes >= sourceBytes && info.codec === "h264" && info.height <= 1080) {
    await run(ffmpeg, ["-y", "-i", source, "-map", "0:v:0", "-an", "-sn", "-dn", "-map_metadata", "-1", "-c:v", "copy", "-movflags", "+faststart", at("video-copy.mp4")], signal);
    await rename(at("video-copy.mp4"), at("video.mp4"));
  }
  await run(ffmpeg, encode(source, at("video-720.mp4"), 720, 23, Math.min(1500, Math.round(sourceKbps * 0.7))), signal);

  await run(ffmpeg, ["-y", "-ss", String(Math.min(1, info.seconds / 2)), "-i", at("video.mp4"), "-frames:v", "1", "-q:v", "2", at("poster-frame.jpg")], signal);
  await sharp(at("poster-frame.jpg")).jpeg({ quality: 82, mozjpeg: true }).toFile(at("poster.jpg"));
  await rm(at("poster-frame.jpg"), { force: true });

  const main = await probe(ffmpeg, at("video.mp4"), signal);
  const small = await probe(ffmpeg, at("video-720.mp4"), signal);
  const variants: MediaVariant[] = [{ path: `${folder}/video-720.mp4`, width: small.width, height: small.height, format: "mp4", bytes: (await stat(at("video-720.mp4"))).size }];
  await db
    .updateTable("media")
    .set({
      status: "ready", path: `${folder}/video.mp4`, mime: "video/mp4", bytes: (await stat(at("video.mp4"))).size, width: main.width, height: main.height,
      duration: info.seconds, poster_path: `${folder}/poster.jpg`, variants: JSON.stringify(variants), error: null, updated_at: new Date(),
    })
    .where("id", "=", mediaId)
    .execute();
  await rm(source, { force: true });
}
