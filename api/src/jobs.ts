// Background work: compresses uploaded videos one at a time and publishes scheduled content. Jobs are
// claimed with a lock in the database, so a crashed run is picked up again after the lock expires.
import type { FastifyBaseLogger } from "fastify";
import { sql } from "kysely";
import type { Config } from "./config.ts";
import { publishDue } from "./content/documents.ts";
import type { Db } from "./db/schema.ts";
import { processVideo } from "./media/video.ts";

const POLL_MS = 20_000;
const MAX_ATTEMPTS = 3;
type Job = { id: number; kind: string; payload: { mediaId: number }; attempts: number };

export function createJobRunner(db: Db, config: Config, log: FastifyBaseLogger) {
  let timer: NodeJS.Timeout | undefined;
  let running: Promise<void> | null = null;
  // Shutting down cancels a running video job and hands it back, instead of waiting for ffmpeg.
  const stopping = new AbortController();

  async function claim(): Promise<Job | undefined> {
    const { rows } = await sql<Job>`
      update jobs set status = 'running', attempts = attempts + 1, locked_until = now() + interval '30 minutes'
      where id = (
        select id from jobs
        where (status = 'pending' and run_after <= now()) or (status = 'running' and locked_until < now())
        order by run_after limit 1 for update skip locked
      )
      returning id, kind, payload, attempts
    `.execute(db);
    return rows[0];
  }

  async function runJob(job: Job) {
    try {
      if (job.kind === "video") await processVideo(db, config, job.payload.mediaId, stopping.signal);
      await db.updateTable("jobs").set({ status: "done", finished_at: new Date(), locked_until: null }).where("id", "=", job.id).execute();
      log.info({ jobId: job.id, kind: job.kind }, "Job done");
    } catch (err) {
      if (stopping.signal.aborted) {
        await db.updateTable("jobs").set({ status: "pending", attempts: job.attempts - 1, locked_until: null }).where("id", "=", job.id).execute();
        return;
      }
      const message = (err instanceof Error ? err.message : String(err)).slice(0, 500);
      const final = job.attempts >= MAX_ATTEMPTS;
      await db
        .updateTable("jobs")
        .set({ status: final ? "failed" : "pending", last_error: message, locked_until: null, run_after: new Date(Date.now() + 60_000 * job.attempts) })
        .where("id", "=", job.id)
        .execute();
      if (final && job.kind === "video") {
        await db.updateTable("media").set({ status: "failed", error: "The video could not be processed. Try exporting it again as MP4.", updated_at: new Date() }).where("id", "=", job.payload.mediaId).execute();
      }
      log.warn({ jobId: job.id, kind: job.kind, attempts: job.attempts, final, error: message }, "Job failed");
    }
  }

  async function runOnce() {
    const published = await publishDue(db, log);
    if (published) log.info({ published }, "Scheduled content published");
    for (let job = !stopping.signal.aborted && (await claim()); job; job = !stopping.signal.aborted && (await claim())) await runJob(job);
  }

  function flush(): Promise<void> {
    running ??= runOnce()
      .catch((err) => log.error({ error: err instanceof Error ? err.message : String(err) }, "Job run failed"))
      .finally(() => {
        running = null;
      });
    return running;
  }

  return {
    flush,
    start() {
      timer = setInterval(() => void flush(), POLL_MS);
      void flush();
    },
    async stop() {
      clearInterval(timer);
      stopping.abort();
      await running;
    },
  };
}

export type JobRunner = ReturnType<typeof createJobRunner>;
