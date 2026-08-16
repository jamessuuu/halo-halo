/**
 * Loads the committed JSONL fixture set (docs/batch2-linguistic-spec.md
 * Section 8.3) and regression-checks it against the live segmenter. This is
 * the "qa-engineer... owns the drift-check" handoff from the Linguistic
 * Spec, made executable: these files are qa-engineer's regression suite
 * for the segmenter, distinct from src/core/segmenter.test.ts (which is
 * the D1-gate fixture set sourced directly from Section 2.3's table).
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { graphemeLength } from "../src/core/graphemes";
import { segment } from "../src/core/segmenter";
import type { Confidence, Tag } from "../src/core/types";

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");

interface FixtureLeaf {
  text: string;
  tag: Tag;
  confidence?: Confidence;
}

interface Fixture {
  id: string;
  input: string;
  source: string;
  leaves: FixtureLeaf[];
  note?: string;
  graphemeLength?: number;
}

function loadFixtures(file: string): Fixture[] {
  const raw = readFileSync(path.join(fixturesDir, file), "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Fixture);
}

const files = readdirSync(fixturesDir).filter((f) => f.endsWith(".jsonl"));

describe.each(files)("eval/fixtures/%s", (file) => {
  const fixtures = loadFixtures(file);

  it("is non-empty", () => {
    expect(fixtures.length).toBeGreaterThan(0);
  });

  it.each(fixtures.map((f) => [f.id, f] as const))("%s", (_id, fixture) => {
    const result = segment(fixture.input);
    expect(result.leaves.map((l) => ({ text: l.text, tag: l.tag }))).toEqual(
      fixture.leaves.map((l) => ({ text: l.text, tag: l.tag }))
    );
    for (const [i, expected] of fixture.leaves.entries()) {
      if (expected.confidence !== undefined) {
        expect(result.leaves[i]?.confidence).toBe(expected.confidence);
      }
    }
    if (fixture.graphemeLength !== undefined) {
      expect(graphemeLength(fixture.input)).toBe(fixture.graphemeLength);
    }
  });
});

describe("OOV disclosure fixture (docs/batch2-linguistic-spec.md Section 6)", () => {
  it("a recognized affix wrapped around an unrecognized root discloses AMBIGUOUS, not silently ENG", () => {
    const [oov] = loadFixtures("core-affixation.jsonl").filter((f) => f.id === "oov-disclosure");
    expect(oov).toBeDefined();
    const result = segment(oov?.input ?? "");
    const disclosed = result.leaves.find((l) => l.ruleId === "ambiguous-oov-root");
    expect(disclosed).toBeDefined();
    expect(disclosed?.tag).toBe("AMBIGUOUS");
    expect(disclosed?.confidence).toBe("LOW");
    expect(disclosed?.note).toBeTruthy();
  });
});
