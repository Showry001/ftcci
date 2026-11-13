import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { nextReference } from "../src/lib/references.ts";
import { db, resetDb } from "./helpers.ts";

describe("reference numbers", () => {
  beforeEach(resetDb);

  it("count up per form and year in the FTCCI-XX-YYYY-NNNNNN format", async () => {
    const now = new Date("2026-06-01T06:00:00Z");
    assert.equal(await nextReference(db, "HB", now), "FTCCI-HB-2026-000001");
    assert.equal(await nextReference(db, "HB", now), "FTCCI-HB-2026-000002");
    assert.equal(await nextReference(db, "CT", now), "FTCCI-CT-2026-000001");
  });

  it("never repeat under concurrent submissions", async () => {
    const refs = await Promise.all(Array.from({ length: 40 }, () => nextReference(db, "HB")));
    assert.equal(new Set(refs).size, 40);
    const numbers = refs.map((r) => Number(r.slice(-6))).sort((a, b) => a - b);
    assert.deepEqual(numbers, Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it("use the year in India (IST), not UTC", async () => {
    // 31 Dec 2026, 20:00 UTC is already 1 Jan 2027 in India.
    assert.equal(await nextReference(db, "EV", new Date("2026-12-31T20:00:00Z")), "FTCCI-EV-2027-000001");
  });
});
