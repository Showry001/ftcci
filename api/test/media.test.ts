import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import sharp from "sharp";
import { db, makeApp, resetDb, signedIn, testImage, testPdf, upload } from "./helpers.ts";

describe("media library", () => {
  beforeEach(resetDb);

  it("stores an image as web sizes without its metadata and serves it with a long cache", async () => {
    const { app, admin } = await makeApp();
    const data = await testImage({ width: 3000, height: 2000, exif: { IFD0: { Copyright: "Private camera owner", Artist: "Someone" } } });
    assert.ok((await sharp(data).metadata()).exif, "the test photo starts with metadata");
    const res = await upload(admin, { name: "AGM Hall.JPG", data, type: "image/jpeg" }, { alt: "Members at the AGM" });
    assert.equal(res.statusCode, 201);
    const m = res.json();
    assert.equal(m.kind, "image");
    assert.equal(m.alt, "Members at the AGM");
    assert.equal(m.width, 2400, "large images are scaled down to 2400 px");
    assert.deepEqual(m.srcset.split(", ").map((s: string) => s.split(" ")[1]), ["480w", "960w", "1600w", "2400w"]);
    assert.match(m.url, /^\/media\/\d{4}\/\d{2}\/[0-9a-f]{16}\/image\.jpg$/);

    const file = await app.inject({ url: m.url });
    assert.equal(file.statusCode, 200);
    assert.match(String(file.headers["cache-control"]), /max-age=31536000, immutable/);
    const meta = await sharp(file.rawPayload).metadata();
    assert.equal(meta.exif, undefined, "camera and personal metadata are removed");
    const webp = await app.inject({ url: m.srcset.split(" ")[0] });
    assert.equal(webp.headers["content-type"], "image/webp");
  });

  it("checks what a file really is, not its name", async () => {
    const { app, admin } = await makeApp();
    const html = await upload(admin, { name: "photo.jpg", data: Buffer.from("<html><script>alert(1)</script></html>"), type: "image/jpeg" });
    assert.equal(html.statusCode, 400);
    assert.match(html.json().message, /file type isn't accepted/);

    const fakePdf = await upload(admin, { name: "report.pdf", data: Buffer.from("MZ\x90\x00 not a pdf"), type: "application/pdf" });
    assert.equal(fakePdf.statusCode, 400);

    const wrongKind = await upload(admin, { name: "cover.jpg", data: await testImage() }, { expect: "pdf" });
    assert.equal(wrongKind.statusCode, 400);
    assert.equal(wrongKind.json().message, "Please upload a PDF here.");
    assert.equal((await db.selectFrom("media").selectAll().execute()).length, 0);
  });

  it("keeps one copy of identical files", async () => {
    const { app, admin } = await makeApp();
    const data = testPdf();
    const first = await upload(admin, { name: "Annual Report.pdf", data });
    const again = await upload(admin, { name: "copy.pdf", data });
    assert.equal(first.statusCode, 201);
    assert.equal(first.json().title, "Annual Report");
    assert.equal(again.statusCode, 200);
    assert.equal(again.json().duplicate, true);
    assert.equal(again.json().id, first.json().id);
  });

  it("edits titles and alt text, and lists by type, use and search", async () => {
    const { app, admin } = await makeApp();
    const image = (await upload(admin, { name: "a.jpg", data: await testImage() })).json();
    const pdf = (await upload(admin, { name: "b.pdf", data: testPdf() })).json();
    const patched = await admin.inject({ method: "PATCH", url: `/api/admin/media/${image.id}`, payload: { alt: "  Expo\u0000 stalls ", title: "Expo 2026" } });
    assert.equal(patched.statusCode, 200);
    assert.equal(patched.json().alt, "Expo  stalls", "control characters are removed and the ends trimmed");
    assert.equal(patched.json().title, "Expo 2026");

    const list = async (q: string) => (await admin.inject({ url: `/api/admin/media${q}` })).json();
    assert.deepEqual((await list("?kind=pdf")).items.map((m: any) => m.id), [pdf.id]);
    assert.equal((await list("?kind=image,pdf")).total, 2);
    assert.deepEqual((await list("?q=expo")).items.map((m: any) => m.id), [image.id]);
    assert.equal((await list("?used=none")).total, 2);
    assert.equal((await list("?used=event")).total, 0);
    assert.equal((await admin.inject({ url: "/api/admin/media?used=nothing" })).statusCode, 400);
  });

  it("won't delete a file that is in use", async () => {
    const { app, admin } = await makeApp();
    const image = (await upload(admin, { name: "poster.jpg", data: await testImage() })).json();
    const doc = (await admin.inject({ method: "POST", url: "/api/admin/content/event", payload: { data: { title: "Trade Expo", image: image.id } } })).json();

    const used = await admin.inject({ method: "DELETE", url: `/api/admin/media/${image.id}` });
    assert.equal(used.statusCode, 409);
    assert.match(used.json().message, /Trade Expo/);
    assert.deepEqual((await admin.inject({ url: `/api/admin/media/${image.id}` })).json().usedBy.map((d: any) => d.title), ["Trade Expo"]);
    assert.equal((await admin.inject({ url: "/api/admin/media?used=event" })).json().total, 1);

    await admin.inject({ method: "PUT", url: `/api/admin/content/doc/${doc.id}`, payload: { data: { title: "Trade Expo" } } });
    assert.equal((await admin.inject({ method: "DELETE", url: `/api/admin/media/${image.id}` })).statusCode, 204);

    const missing = await admin.inject({ method: "PUT", url: `/api/admin/content/doc/${doc.id}`, payload: { data: { title: "Trade Expo", image: image.id } } });
    assert.equal(missing.statusCode, 400);
    assert.match(missing.json().fields.image, /no longer in the media library/);
  });

  it("only accepts uploads from signed-in staff", async () => {
    const { app } = await makeApp();
    const res = await upload(app, { name: "a.jpg", data: await testImage() });
    assert.equal(res.statusCode, 401);
    assert.equal((await db.selectFrom("media").selectAll().execute()).length, 0);
  });

  it("moves deleted files to the bin, where a Super Admin can restore them", async () => {
    const { app, admin } = await makeApp();
    const image = (await upload(admin, { name: "stage.jpg", data: await testImage() })).json();
    const staff = await signedIn(app, "admin");
    assert.equal((await staff.inject({ method: "DELETE", url: `/api/admin/media/${image.id}` })).statusCode, 204);
    assert.equal((await admin.inject({ url: "/api/admin/media" })).json().total, 0);

    const bin = (await admin.inject({ url: "/api/admin/bin" })).json();
    assert.deepEqual(bin.media.map((m: any) => [m.id, m.deletedBy]), [[image.id, staff.user.name]]);
    assert.equal((await staff.inject({ method: "POST", url: `/api/admin/bin/media/${image.id}/restore` })).statusCode, 403);
    assert.equal((await admin.inject({ method: "POST", url: `/api/admin/bin/media/${image.id}/restore` })).statusCode, 200);
    assert.equal((await admin.inject({ url: "/api/admin/media" })).json().total, 1);
  });
});
