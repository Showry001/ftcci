// Downloads every image/icon used by the home page from Figma into /public/assets.
// Run once:  npm run assets
// The Figma MCP asset URLs are temporary (about 7 days). If they have expired,
// re-export the assets from Figma (or ask Claude to regenerate this manifest).
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(root, "scripts/figma-assets.json"), "utf8"));
const force = process.argv.includes("--force");

let ok = 0;
const failed = [];

for (const { path, url } of manifest.assets) {
  const dest = join(root, "public/assets", path);
  if (!force) {
    try {
      if ((await stat(dest)).size > 0) { ok++; continue; }
    } catch {}
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) throw new Error("empty file");
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    ok++;
    console.log(`✓ ${path} (${(buf.length / 1024).toFixed(1)} kB)`);
  } catch (err) {
    failed.push(path);
    console.error(`✗ ${path}: ${err.message}`);
  }
}

console.log(`\n${ok}/${manifest.assets.length} assets ready in public/assets`);
if (failed.length) {
  console.log("Some downloads failed. If the links expired, re-export these from Figma:");
  failed.forEach((f) => console.log("  - " + f));
  process.exitCode = 1;
}
console.log("\nReminder: the hero background is a video fill in Figma. Export it and save it as public/assets/hero/hero.mp4");
