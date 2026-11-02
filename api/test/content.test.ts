import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { sql } from "kysely";
import { previewToken, publishDue } from "../src/content/documents.ts";
import { db, inDays, makeApp, resetDb, testImage, testPdf, upload } from "./helpers.ts";

type App = Awaited<ReturnType<typeof makeApp>>["app"];
const create = (app: App, type: string, data: object, slug?: string) => app.inject({ method: "POST", url: `/api/admin/content/${type}`, payload: { data, ...(slug ? { slug } : {}) } });
const save = (app: App, id: number, data: object, slug?: string) => app.inject({ method: "PUT", url: `/api/admin/content/doc/${id}`, payload: { data, ...(slug ? { slug } : {}) } });
const act = (app: App, id: number, action: string, payload: object = {}) => app.inject({ method: "POST", url: `/api/admin/content/doc/${id}/${action}`, payload });
const publicItem = (app: App, type: string, slug: string) => app.inject({ url: `/api/content/item/${type}/${slug}` });
const log = { warn: () => {} };

async function event(app: App, overrides: object = {}) {
  const image = (await upload(app, { name: "poster.jpg", data: await testImage() })).json();
  const data = { title: "Telangana Trade Expo", category: "Expo", date: inDays(30), startTime: "10:00", venue: "Federation House", image: image.id, ...overrides };
  return { image, doc: (await create(app, "event", data)).json(), data };
}

describe("content", () => {
  beforeEach(resetDb);

  it("keeps new items as drafts until they are published", async () => {
    const { app } = await makeApp();
    const { doc, image } = await event(app);
    assert.equal(doc.status, "draft");
    assert.equal(doc.slug, "telangana-trade-expo");
    assert.equal(doc.title, "Telangana Trade Expo");
    assert.equal(doc.media[image.id].alt, "");
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 404);
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 0);

    const published = (await act(app, doc.id, "publish")).json();
    assert.equal(published.status, "published");
    assert.equal(published.hasChanges, false);
    const item = (await publicItem(app, "event", doc.slug)).json();
    assert.equal(item.title, "Telangana Trade Expo");
    assert.equal(item.image.url, image.url);
    assert.match(item.image.srcset, /480w/);
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 1);
  });

  it("asks for required fields only when publishing", async () => {
    const { app } = await makeApp();
    const draft = await create(app, "event", { title: "Ideas so far" });
    assert.equal(draft.statusCode, 201);
    const res = await act(app, draft.json().id, "publish");
    assert.equal(res.statusCode, 400);
    assert.deepEqual(Object.keys(res.json().fields).sort(), ["date", "image"]);
  });

  it("refuses unsafe links and cleans rich text", async () => {
    const { app } = await makeApp();
    const bad = await create(app, "event", { title: "X", registrationUrl: "javascript:alert(1)" });
    assert.equal(bad.statusCode, 400);
    assert.ok(bad.json().fields.registrationUrl);

    const body = '<p onclick="steal()">Budget <strong>news</strong><script>alert(1)</script></p><a href="javascript:alert(1)">x</a><a href="https://ftcci.in" target="_blank">site</a><img src=x onerror=alert(1)>';
    const doc = (await create(app, "article", { title: "Budget news", body })).json();
    assert.equal(doc.data.body, '<p>Budget <strong>news</strong></p><a rel="noopener noreferrer">x</a><a href="https://ftcci.in" target="_blank" rel="noopener noreferrer">site</a>');
  });

  it("keeps the live version while staff edit, and restores earlier versions", async () => {
    const { app } = await makeApp();
    const { doc, data } = await event(app);
    await act(app, doc.id, "publish");

    const edited = (await save(app, doc.id, { ...data, title: "Telangana Trade Expo 2027" })).json();
    assert.equal(edited.hasChanges, true);
    assert.equal(edited.title, "Telangana Trade Expo 2027");
    assert.equal((await publicItem(app, "event", doc.slug)).json().title, "Telangana Trade Expo", "the website still shows the published text");

    // Saving the published content again is not a change, whatever order the fields come in.
    const reordered = Object.fromEntries(Object.entries(data).reverse());
    assert.equal((await save(app, doc.id, reordered)).json().hasChanges, false);

    await save(app, doc.id, { ...data, title: "Draft title" });
    const { versions } = (await app.inject({ url: `/api/admin/content/doc/${doc.id}` })).json();
    const published = versions.find((v: any) => v.action === "publish");
    const restored = (await act(app, doc.id, "restore", { versionId: published.id })).json();
    assert.equal(restored.data.title, "Telangana Trade Expo");
    assert.equal(restored.hasChanges, false);
    const history = (await app.inject({ url: `/api/admin/content/doc/${doc.id}` })).json().versions;
    assert.equal(history[0].action, "restore");
    const kept = await Promise.all(history.map(async (v: any) => (await app.inject({ url: `/api/admin/content/doc/${doc.id}/versions/${v.id}` })).json().data.title));
    assert.ok(kept.includes("Draft title"), "the replaced draft stays in the history");
  });

  it("archives, unpublishes and deletes", async () => {
    const { app } = await makeApp();
    const { doc } = await event(app);
    assert.equal((await act(app, doc.id, "archive")).statusCode, 400, "only published items can be archived");
    await act(app, doc.id, "publish");

    await act(app, doc.id, "archive");
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 0);
    const past = (await app.inject({ url: "/api/content/list/event?when=past" })).json();
    assert.deepEqual(past.items.map((i: any) => [i.slug, i.archived]), [[doc.slug, true]]);
    assert.equal((await publicItem(app, "event", doc.slug)).json().archived, true, "old links keep working");

    await act(app, doc.id, "unarchive");
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 1);

    const draft = (await act(app, doc.id, "unpublish")).json();
    assert.equal(draft.status, "draft");
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 404);

    assert.equal((await app.inject({ method: "DELETE", url: `/api/admin/content/doc/${doc.id}` })).statusCode, 204);
    assert.equal((await app.inject({ url: `/api/admin/content/doc/${doc.id}` })).statusCode, 404);
  });

  it("gives each item its own web address", async () => {
    const { app } = await makeApp();
    const a = (await create(app, "article", { title: "Budget news" })).json();
    const b = (await create(app, "article", { title: "Budget news" })).json();
    assert.deepEqual([a.slug, b.slug], ["budget-news", "budget-news-2"]);
    const renamed = await save(app, b.id, { title: "Budget news" }, "budget-reaction");
    assert.equal(renamed.json().slug, "budget-reaction");
    const invalid = await save(app, b.id, { title: "Budget news" }, "Budget Reaction!");
    assert.equal(invalid.statusCode, 400);
    assert.ok(invalid.json().fields.slug);
  });

  it("opens drafts through signed preview links that expire", async () => {
    const { app, config } = await makeApp();
    const { doc, data } = await event(app);
    await act(app, doc.id, "publish");
    await save(app, doc.id, { ...data, title: "Unpublished title" });

    const { token } = (await act(app, doc.id, "preview")).json();
    const preview = (await app.inject({ url: `/api/content/preview/${token}` })).json();
    assert.equal(preview.title, "Unpublished title");
    assert.equal(preview.preview, true);
    assert.equal(preview.image.url.startsWith("/media/"), true);

    const forged = token.replace(/^\d+/, String(doc.id + 1));
    assert.equal((await app.inject({ url: `/api/content/preview/${forged}` })).statusCode, 404);
    const expired = previewToken(config, doc.id, Date.now() - 2 * 3600_000);
    assert.equal((await app.inject({ url: `/api/content/preview/${expired}` })).json().error, "expired");
  });

  it("publishes scheduled items when their time comes", async () => {
    const { app } = await makeApp();
    const { doc } = await event(app);
    const soon = await act(app, doc.id, "schedule", { at: new Date(Date.now() + 10_000).toISOString() });
    assert.equal(soon.statusCode, 400);
    assert.ok(soon.json().fields.publishAt);

    const incomplete = (await create(app, "event", { title: "Not ready" })).json();
    assert.equal((await act(app, incomplete.id, "schedule", { at: new Date(Date.now() + 3600_000).toISOString() })).statusCode, 400, "only complete items can be scheduled");

    const scheduled = (await act(app, doc.id, "schedule", { at: new Date(Date.now() + 3600_000).toISOString() })).json();
    assert.ok(scheduled.publishAt);
    assert.equal(scheduled.status, "draft");
    const list = (await app.inject({ url: "/api/admin/content/event?status=scheduled" })).json();
    assert.deepEqual(list.items.map((i: any) => i.id), [doc.id]);

    assert.equal(await publishDue(db, log), 0, "nothing is due yet");
    await sql`update documents set publish_at = now() - interval '1 second' where id = ${doc.id}`.execute(db);
    assert.equal(await publishDue(db, log), 1);
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 200);
    assert.equal((await app.inject({ url: `/api/admin/content/doc/${doc.id}` })).json().publishAt, null);
  });

  it("edits pages, which can't be archived or deleted", async () => {
    const { app } = await makeApp();
    const page = (await app.inject({ url: "/api/admin/content/careers" })).json();
    assert.equal(page.status, "draft");
    assert.equal((await app.inject({ url: "/api/content/single/careers" })).statusCode, 404);

    assert.equal((await act(app, page.id, "publish")).statusCode, 400, "the careers email is required");
    await save(app, page.id, { email: "careers@ftcci.in" });
    await act(app, page.id, "publish");
    assert.equal((await app.inject({ url: "/api/content/single/careers" })).json().data.email, "careers@ftcci.in");
    assert.equal((await app.inject({ url: "/api/admin/content/careers" })).json().id, page.id, "one document per page");

    assert.equal((await act(app, page.id, "archive")).statusCode, 400);
    assert.equal((await app.inject({ method: "DELETE", url: `/api/admin/content/doc/${page.id}` })).statusCode, 400);
    assert.equal((await app.inject({ method: "POST", url: "/api/admin/content/careers", payload: { data: {} } })).statusCode, 400);
    const pages = (await app.inject({ url: "/api/admin/pages" })).json().items;
    assert.deepEqual(pages.map((p: any) => [p.type, p.published, p.hasChanges]), [["careers", true, false]]);
  });

  it("publishes a hero video only once it has been compressed", async () => {
    const { app } = await makeApp();
    const video = await db
      .insertInto("media")
      .values({ kind: "video", status: "processing", original_name: "hero.mp4", mime: "video/mp4", bytes: 1000, sha256: "a".repeat(64), path: "2026/10/abc/source.mp4", width: null, height: null, duration: null, poster_path: null, error: null, alt: "", title: "" })
      .returningAll()
      .executeTakeFirstOrThrow();
    const hero = (await app.inject({ url: "/api/admin/content/hero" })).json();
    await save(app, hero.id, { mode: "video", video: video.id, title: "Empowering Industries." });
    const waiting = await act(app, hero.id, "publish");
    assert.equal(waiting.statusCode, 400);
    assert.match(waiting.json().fields.video, /still being compressed/);

    await db.updateTable("media").set({ status: "ready" }).where("id", "=", video.id).execute();
    assert.equal((await act(app, hero.id, "publish")).statusCode, 200);
  });

  it("orders publications by hand", async () => {
    const { app } = await makeApp();
    const ids: number[] = [];
    for (const title of ["First", "Second", "Third"]) {
      const cover = (await upload(app, { name: `${title}.jpg`, data: await testImage() })).json();
      const file = (await upload(app, { name: `${title}.pdf`, data: testPdf() })).json();
      const doc = (await create(app, "publication", { title, section: "annual", meta: "2025–26", cover: cover.id, file: file.id })).json();
      await act(app, doc.id, "publish");
      ids.push(doc.id);
    }
    const order = await app.inject({ method: "POST", url: "/api/admin/content/publication/order", payload: { ids: [ids[2], ids[0], ids[1]] } });
    assert.equal(order.statusCode, 200);
    const titles = (await app.inject({ url: "/api/content/list/publication" })).json().items.map((i: any) => i.title);
    assert.deepEqual(titles, ["Third", "First", "Second"]);
    assert.equal((await app.inject({ method: "POST", url: "/api/admin/content/event/order", payload: { ids } })).statusCode, 404);
  });

  it("only answers admin requests from this computer", async () => {
    const { app } = await makeApp();
    const res = await app.inject({ url: "/api/admin/content/event", remoteAddress: "203.0.113.20" });
    assert.equal(res.statusCode, 404);
    assert.equal((await app.inject({ url: "/api/admin/pages", remoteAddress: "203.0.113.20" })).statusCode, 404);
  });
});
