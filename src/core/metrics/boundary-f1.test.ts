import { describe, expect, it } from "vitest";

import type { Tag } from "../types";
import { computeBoundaryF1, switchIndices } from "./boundary-f1";

describe("switchIndices", () => {
  it("finds a TAG/ENG boundary and skips a boundary touching OTHER/NE/AMBIGUOUS/MIXED", () => {
    const tags: Tag[] = ["TAG", "ENG", "OTHER", "NE", "AMBIGUOUS", "MIXED", "TAG"];
    // boundaries: 0-1 TAG/ENG (switch), 1-2 ENG/OTHER (no), 2-3 OTHER/NE (no),
    // 3-4 NE/AMBIGUOUS (no), 4-5 AMBIGUOUS/MIXED (no), 5-6 MIXED/TAG (no)
    expect(switchIndices(tags)).toEqual(new Set([0]));
  });

  it("same tag adjacency is never a switch", () => {
    expect(switchIndices(["TAG", "TAG", "TAG"])).toEqual(new Set());
  });

  it("a real TAG/ENG boundary inside a longer run is still found", () => {
    // TAG,TAG | ENG,ENG — the only boundary between differing tags is at index 1
    expect(switchIndices(["TAG", "TAG", "ENG", "ENG"])).toEqual(new Set([1]));
  });
});

describe("computeBoundaryF1 — synthetic matrices with known answers", () => {
  it("perfect agreement: precision=recall=f1=1", () => {
    const gold: Tag[] = ["TAG", "ENG", "TAG", "ENG"];
    const predicted: Tag[] = ["TAG", "ENG", "TAG", "ENG"];
    const r = computeBoundaryF1(predicted, gold);
    expect(r).toMatchObject({ precision: 1, recall: 1, f1: 1, n: 3, truePositive: 3, falsePositive: 0, falseNegative: 0 });
  });

  it("both empty (no switches anywhere): defined as perfect agreement, not NaN", () => {
    const gold: Tag[] = ["TAG", "TAG", "TAG"];
    const predicted: Tag[] = ["TAG", "TAG", "TAG"];
    const r = computeBoundaryF1(predicted, gold);
    expect(r).toMatchObject({ precision: 1, recall: 1, f1: 1, n: 0 });
  });

  it("predicts a switch where there is none: precision 0, recall undefined-safe (n=0)", () => {
    const gold: Tag[] = ["TAG", "TAG"]; // no switch
    const predicted: Tag[] = ["TAG", "ENG"]; // one predicted switch
    const r = computeBoundaryF1(predicted, gold);
    expect(r).toMatchObject({ precision: 0, recall: 1, f1: 0, n: 0, truePositive: 0, falsePositive: 1, falseNegative: 0 });
  });

  it("misses the only gold switch: recall 0", () => {
    const gold: Tag[] = ["TAG", "ENG"]; // one gold switch
    const predicted: Tag[] = ["TAG", "TAG"]; // predicts none
    const r = computeBoundaryF1(predicted, gold);
    expect(r).toMatchObject({ precision: 1, recall: 0, f1: 0, n: 1, truePositive: 0, falsePositive: 0, falseNegative: 1 });
  });

  it("hand-computed partial-overlap case: two false positives, zero misses", () => {
    // A 5-leaf sequence. Gold switches sit at boundary indices {0, 2} (n=2).
    // Predicted switches at every boundary {0, 1, 2, 3} (two extra false
    // positives at 1 and 3, both gold switches still found).
    const gold: Tag[] = ["TAG", "ENG", "ENG", "TAG", "TAG"]; // 0-1 switch(0), 1-2 none, 2-3 switch(2), 3-4 none
    const predicted: Tag[] = ["TAG", "ENG", "TAG", "ENG", "TAG"]; // switches at 0,1,2,3
    const r = computeBoundaryF1(predicted, gold);
    expect(r.n).toBe(2);
    expect(r.truePositive).toBe(2);
    expect(r.falsePositive).toBe(2);
    expect(r.falseNegative).toBe(0);
    expect(r.precision).toBeCloseTo(2 / 4, 10);
    expect(r.recall).toBeCloseTo(2 / 2, 10);
    expect(r.f1).toBeCloseTo((2 * (0.5 * 1)) / (0.5 + 1), 10);
  });

  it("throws on mismatched lengths (different tokenization is never compared)", () => {
    expect(() => computeBoundaryF1(["TAG"], ["TAG", "ENG"])).toThrow();
  });
});
