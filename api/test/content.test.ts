import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { sql } from "kysely";
import { previewToken, publishDue } from "../src/content/documents.ts";
import { type Client, db, inDays, makeApp, resetDb, signedIn, testImage, testPdf, upload } from "./helpers.ts";

type App = Awaited<ReturnType<typeof makeApp>>["app"];
const create = (app: Client, type: string, data: object, slug?: string) => app.inject({ method: "POST", url: `/api/admin/content/${type}`, payload: { data, ...(slug ? { slug } : {}) } });
const save = (app: Client, id: number, data: object, slug?: string) => app.inject({ method: "PUT", url: `/api/admin/content/doc/${id}`, payload: { data, ...(slug ? { slug } : {}) } });
const act = (app: Client, id: number, action: string, payload: object = {}) => app.inject({ method: "POST", url: `/api/admin/content/doc/${id}/${action}`, payload });
const publicItem = (app: App, type: string, slug: string) => app.inject({ url: `/api/content/item/${type}/${slug}` });
const log = { warn: () => {} };

async function event(admin: Client, overrides: object = {}) {
  const image = (await upload(admin, { name: "poster.jpg", data: await testImage() })).json();
  const data = { title: "Telangana Trade Expo", category: "Expo", date: inDays(30), startTime: "10:00", venue: "Federation House", image: image.id, ...overrides };
  return { image, doc: (await create(admin, "event", data)).json(), data };
}

describe("content", () => {
  beforeEach(resetDb);

  it("keeps new items as drafts until they are published", async () => {
    const { app, admin } = await makeApp();
    const { doc, image } = await event(admin);
    assert.equal(doc.status, "draft");
    assert.equal(doc.slug, "telangana-trade-expo");
    assert.equal(doc.title, "Telangana Trade Expo");
    assert.equal(doc.media[image.id].alt, "");
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 404);
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 0);

    const published = (await act(admin, doc.id, "publish")).json();
    assert.equal(published.status, "published");
    assert.equal(published.hasChanges, false);
    const item = (await publicItem(app, "event", doc.slug)).json();
    assert.equal(item.title, "Telangana Trade Expo");
    assert.equal(item.image.url, image.url);
    assert.match(item.image.srcset, /480w/);
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 1);
  });

  it("asks for required fields only when publishing", async () => {
    const { app, admin } = await makeApp();
    const draft = await create(admin, "event", { title: "Ideas so far" });
    assert.equal(draft.statusCode, 201);
    const res = await act(admin, draft.json().id, "publish");
    assert.equal(res.statusCode, 400);
    assert.deepEqual(Object.keys(res.json().fields).sort(), ["date", "image"]);
  });

  it("refuses unsafe links and cleans rich text", async () => {
    const { app, admin } = await makeApp();
    const bad = await create(admin, "event", { title: "X", registrationUrl: "javascript:alert(1)" });
    assert.equal(bad.statusCode, 400);
    assert.ok(bad.json().fields.registrationUrl);

    const body = '<p onclick="steal()">Budget <strong>news</strong><script>alert(1)</script></p><a href="javascript:alert(1)">x</a><a href="https://ftcci.in" target="_blank">site</a><img src=x onerror=alert(1)>';
    const doc = (await create(admin, "article", { title: "Budget news", body })).json();
    assert.equal(doc.data.body, '<p>Budget <strong>news</strong></p><a rel="noopener noreferrer">x</a><a href="https://ftcci.in" target="_blank" rel="noopener noreferrer">site</a>');
  });

  it("keeps the live version while staff edit, and restores earlier versions", async () => {
    const { app, admin } = await makeApp();
    const { doc, data } = await event(admin);
    await act(admin, doc.id, "publish");

    const edited = (await save(admin, doc.id, { ...data, title: "Telangana Trade Expo 2027" })).json();
    assert.equal(edited.hasChanges, true);
    assert.equal(edited.title, "Telangana Trade Expo 2027");
    assert.equal((await publicItem(app, "event", doc.slug)).json().title, "Telangana Trade Expo", "the website still shows the published text");

    // Saving the published content again is not a change, whatever order the fields come in.
    const reordered = Object.fromEntries(Object.entries(data).reverse());
    assert.equal((await save(admin, doc.id, reordered)).json().hasChanges, false);

    await save(admin, doc.id, { ...data, title: "Draft title" });
    const { versions } = (await admin.inject({ url: `/api/admin/content/doc/${doc.id}` })).json();
    const published = versions.find((v: any) => v.action === "publish");
    const restored = (await act(admin, doc.id, "restore", { versionId: published.id })).json();
    assert.equal(restored.data.title, "Telangana Trade Expo");
    assert.equal(restored.hasChanges, false);
    const history = (await admin.inject({ url: `/api/admin/content/doc/${doc.id}` })).json().versions;
    assert.equal(history[0].action, "restore");
    const kept = await Promise.all(history.map(async (v: any) => (await admin.inject({ url: `/api/admin/content/doc/${doc.id}/versions/${v.id}` })).json().data.title));
    assert.ok(kept.includes("Draft title"), "the replaced draft stays in the history");
  });

  it("archives, unpublishes and deletes", async () => {
    const { app, admin } = await makeApp();
    const { doc } = await event(admin);
    assert.equal((await act(admin, doc.id, "archive")).statusCode, 400, "only published items can be archived");
    await act(admin, doc.id, "publish");

    await act(admin, doc.id, "archive");
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 0);
    const past = (await app.inject({ url: "/api/content/list/event?when=past" })).json();
    assert.deepEqual(past.items.map((i: any) => [i.slug, i.archived]), [[doc.slug, true]]);
    assert.equal((await publicItem(app, "event", doc.slug)).json().archived, true, "old links keep working");

    await act(admin, doc.id, "unarchive");
    assert.equal((await app.inject({ url: "/api/content/list/event?when=upcoming" })).json().total, 1);

    const draft = (await act(admin, doc.id, "unpublish")).json();
    assert.equal(draft.status, "draft");
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 404);

    assert.equal((await admin.inject({ method: "DELETE", url: `/api/admin/content/doc/${doc.id}` })).statusCode, 204);
    assert.equal((await admin.inject({ url: `/api/admin/content/doc/${doc.id}` })).statusCode, 404);
  });

  it("gives each item its own web address", async () => {
    const { app, admin } = await makeApp();
    const a = (await create(admin, "article", { title: "Budget news" })).json();
    const b = (await create(admin, "article", { title: "Budget news" })).json();
    assert.deepEqual([a.slug, b.slug], ["budget-news", "budget-news-2"]);
    const renamed = await save(admin, b.id, { title: "Budget news" }, "budget-reaction");
    assert.equal(renamed.json().slug, "budget-reaction");
    const invalid = await save(admin, b.id, { title: "Budget news" }, "Budget Reaction!");
    assert.equal(invalid.statusCode, 400);
    assert.ok(invalid.json().fields.slug);
  });

  it("opens drafts through signed preview links that expire", async () => {
    const { app, admin, config } = await makeApp();
    const { doc, data } = await event(admin);
    await act(admin, doc.id, "publish");
    await save(admin, doc.id, { ...data, title: "Unpublished title" });

    const { token } = (await act(admin, doc.id, "preview")).json();
    const [preview] = (await app.inject({ url: `/api/content/preview/${token}` })).json().documents;
    assert.equal(preview.title, "Unpublished title");
    assert.equal(preview.preview, true);
    assert.equal(preview.image.url.startsWith("/media/"), true);

    const forged = token.replace(/^\d+/, String(doc.id + 1));
    assert.equal((await app.inject({ url: `/api/content/preview/${forged}` })).statusCode, 404);
    const expired = previewToken(config, doc.id, Date.now() - 2 * 3600_000);
    assert.equal((await app.inject({ url: `/api/content/preview/${expired}` })).json().error, "expired");
  });

  it("previews a page together with the other drafts shown on it", async () => {
    const { app, admin } = await makeApp();
    const page = (await admin.inject({ url: "/api/admin/content/careers" })).json();
    const footer = (await admin.inject({ url: "/api/admin/content/site" })).json();
    await save(admin, page.id, { email: "jobs@ftcci.in" });
    await save(admin, footer.id, { tagline: "Draft footer line" });

    const { token } = (await admin.inject({ method: "POST", url: "/api/admin/content/preview", payload: { ids: [page.id, footer.id] } })).json();
    const { documents } = (await app.inject({ url: `/api/content/preview/${token}` })).json();
    assert.deepEqual(documents.map((d: any) => [d.type, d.email ?? d.tagline]).sort(), [["careers", "jobs@ftcci.in"], ["site", "Draft footer line"]]);

    const tampered = token.replace(`${page.id}-${footer.id}`, `${page.id}-${footer.id + 1}`);
    assert.equal((await app.inject({ url: `/api/content/preview/${tampered}` })).statusCode, 404, "changing the documents breaks the signature");
    assert.equal((await admin.inject({ method: "POST", url: "/api/admin/content/preview", payload: { ids: [page.id, 99999] } })).statusCode, 404);
    assert.equal((await app.inject({ method: "POST", url: "/api/admin/content/preview", payload: { ids: [page.id] } })).statusCode, 401, "only signed-in staff can make preview links");
  });

  it("publishes scheduled items when their time comes", async () => {
    const { app, admin } = await makeApp();
    const { doc } = await event(admin);
    const soon = await act(admin, doc.id, "schedule", { at: new Date(Date.now() + 10_000).toISOString() });
    assert.equal(soon.statusCode, 400);
    assert.ok(soon.json().fields.publishAt);

    const incomplete = (await create(admin, "event", { title: "Not ready" })).json();
    assert.equal((await act(admin, incomplete.id, "schedule", { at: new Date(Date.now() + 3600_000).toISOString() })).statusCode, 400, "only complete items can be scheduled");

    const scheduled = (await act(admin, doc.id, "schedule", { at: new Date(Date.now() + 3600_000).toISOString() })).json();
    assert.ok(scheduled.publishAt);
    assert.equal(scheduled.status, "draft");
    const list = (await admin.inject({ url: "/api/admin/content/event?status=scheduled" })).json();
    assert.deepEqual(list.items.map((i: any) => i.id), [doc.id]);

    assert.equal(await publishDue(db, log), 0, "nothing is due yet");
    await sql`update documents set publish_at = now() - interval '1 second' where id = ${doc.id}`.execute(db);
    assert.equal(await publishDue(db, log), 1);
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 200);
    assert.equal((await admin.inject({ url: `/api/admin/content/doc/${doc.id}` })).json().publishAt, null);
  });

  it("edits pages, which can't be archived or deleted", async () => {
    const { app, admin } = await makeApp();
    const page = (await admin.inject({ url: "/api/admin/content/careers" })).json();
    assert.equal(page.status, "draft");
    assert.equal((await app.inject({ url: "/api/content/single/careers" })).statusCode, 404);

    assert.equal((await act(admin, page.id, "publish")).statusCode, 400, "the careers email is required");
    await save(admin, page.id, { email: "careers@ftcci.in" });
    await act(admin, page.id, "publish");
    assert.equal((await app.inject({ url: "/api/content/single/careers" })).json().data.email, "careers@ftcci.in");
    assert.equal((await admin.inject({ url: "/api/admin/content/careers" })).json().id, page.id, "one document per page");

    assert.equal((await act(admin, page.id, "archive")).statusCode, 400);
    assert.equal((await admin.inject({ method: "DELETE", url: `/api/admin/content/doc/${page.id}` })).statusCode, 400);
    assert.equal((await admin.inject({ method: "POST", url: "/api/admin/content/careers", payload: { data: {} } })).statusCode, 400);
    const pages = (await admin.inject({ url: "/api/admin/pages" })).json().items;
    assert.deepEqual(pages.map((p: any) => [p.type, p.published, p.hasChanges]), [["careers", true, false]]);
  });

  it("publishes a hero video only once it has been compressed", async () => {
    const { app, admin } = await makeApp();
    const video = await db
      .insertInto("media")
      .values({ kind: "video", status: "processing", original_name: "hero.mp4", mime: "video/mp4", bytes: 1000, sha256: "a".repeat(64), path: "2026/10/abc/source.mp4", width: null, height: null, duration: null, poster_path: null, error: null, alt: "", title: "" })
      .returningAll()
      .executeTakeFirstOrThrow();
    const hero = (await admin.inject({ url: "/api/admin/content/hero" })).json();
    await save(admin, hero.id, { mode: "video", video: video.id, title: "Empowering Industries." });
    const waiting = await act(admin, hero.id, "publish");
    assert.equal(waiting.statusCode, 400);
    assert.match(waiting.json().fields.video, /still being compressed/);

    await db.updateTable("media").set({ status: "ready" }).where("id", "=", video.id).execute();
    assert.equal((await act(admin, hero.id, "publish")).statusCode, 200);
  });

  it("orders publications by hand", async () => {
    const { app, admin } = await makeApp();
    const ids: number[] = [];
    for (const title of ["First", "Second", "Third"]) {
      const cover = (await upload(admin, { name: `${title}.jpg`, data: await testImage() })).json();
      const file = (await upload(admin, { name: `${title}.pdf`, data: testPdf() })).json();
      const doc = (await create(admin, "publication", { title, section: "annual", meta: "2025–26", cover: cover.id, file: file.id })).json();
      await act(admin, doc.id, "publish");
      ids.push(doc.id);
    }
    const order = await admin.inject({ method: "POST", url: "/api/admin/content/publication/order", payload: { ids: [ids[2], ids[0], ids[1]] } });
    assert.equal(order.statusCode, 200);
    const titles = (await app.inject({ url: "/api/content/list/publication" })).json().items.map((i: any) => i.title);
    assert.deepEqual(titles, ["Third", "First", "Second"]);
    assert.equal((await admin.inject({ method: "POST", url: "/api/admin/content/event/order", payload: { ids } })).statusCode, 404);
  });

  it("only answers signed-in staff", async () => {
    const { app } = await makeApp();
    assert.equal((await app.inject({ url: "/api/admin/content/event" })).statusCode, 401);
    assert.equal((await app.inject({ url: "/api/admin/pages" })).statusCode, 401);
    assert.equal((await app.inject({ method: "POST", url: "/api/admin/content/event", payload: { data: { title: "x" } } })).statusCode, 401);
  });

  it("restores deleted items from the bin, and logs who did what", async () => {
    const { app, admin } = await makeApp();
    const staff = await signedIn(app, "admin");
    const { doc } = await event(staff);
    await act(staff, doc.id, "publish");
    assert.equal((await staff.inject({ method: "DELETE", url: `/api/admin/content/doc/${doc.id}` })).statusCode, 204);
    assert.equal((await publicItem(app, "event", doc.slug)).statusCode, 404);

    // Another item takes the address while the first is in the bin.
    const { doc: other } = await event(admin);
    assert.equal(other.slug, doc.slug);
    const bin = (await admin.inject({ url: "/api/admin/bin" })).json();
    assert.deepEqual(bin.documents.map((d: any) => [d.id, d.label, d.deleted_by]), [[doc.id, "Event “Telangana Trade Expo”", staff.user.name]]);
    assert.equal((await staff.inject({ method: "POST", url: `/api/admin/bin/documents/${doc.id}/restore` })).statusCode, 403);
    const restored = (await admin.inject({ method: "POST", url: `/api/admin/bin/documents/${doc.id}/restore` })).json();
    assert.equal(restored.status, "published");
    assert.equal(restored.slug, `${doc.slug}-2`);
    assert.equal((await publicItem(app, "event", restored.slug)).statusCode, 200);

    const log = (await admin.inject({ url: "/api/admin/activity?kind=content" })).json().items.map((e: any) => [e.action, e.actor.split(" <")[0]]);
    assert.deepEqual(log.slice(0, 5), [
      ["content.restored", admin.user.name],
      ["content.created", admin.user.name],
      ["content.deleted", staff.user.name],
      ["content.published", staff.user.name],
      ["content.created", staff.user.name],
    ]);
  });
});
