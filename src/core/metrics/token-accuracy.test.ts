import { describe, expect, it } from "vitest";

import type { Tag } from "../types";
import { buildConfusionMatrix, perLabelAccuracy } from "./token-accuracy";

describe("buildConfusionMatrix — synthetic matrix with a known answer", () => {
  it("counts gold x predicted pairs correctly", () => {
    const gold: Tag[] = ["TAG", "TAG", "ENG", "AMBIGUOUS"];
    const predicted: Tag[] = ["TAG", "ENG", "ENG", "TAG"]; // one TAG->TAG, one TAG->ENG, one ENG->ENG, one AMBIGUOUS->TAG
    const m = buildConfusionMatrix(predicted, gold);
    expect(m.TAG.TAG).toBe(1);
    expect(m.TAG.ENG).toBe(1);
    expect(m.ENG.ENG).toBe(1);
    expect(m.AMBIGUOUS.TAG).toBe(1);
    expect(m.NE.NE).toBe(0);
  });
});

describe("perLabelAccuracy — the doctrine-5 class-imbalance case", () => {
  it("majority-label baseline scores high pooled but is exposed per-label", () => {
    // 8 TAG, 1 MIXED, 1 AMBIGUOUS. A trivial always-predict-TAG baseline:
    // pooled accuracy would be 8/10 = 0.8 ("high"), but per-label it must
    // show MIXED and AMBIGUOUS at 0 — exactly the failure this metric
    // exists to make visible instead of hiding.
    const gold: Tag[] = ["TAG", "TAG", "TAG", "TAG", "TAG", "TAG", "TAG", "TAG", "MIXED", "AMBIGUOUS"];
    const predicted: Tag[] = gold.map(() => "TAG");
    const results = perLabelAccuracy(predicted, gold);
    const byTag = Object.fromEntries(results.map((r) => [r.tag, r]));
    expect(byTag.TAG).toMatchObject({ support: 8, accuracy: 1 });
    expect(byTag.MIXED).toMatchObject({ support: 1, accuracy: 0 });
    expect(byTag.AMBIGUOUS).toMatchObject({ support: 1, accuracy: 0 });
    expect(byTag.NE).toMatchObject({ support: 0, accuracy: null }); // zero support -> null, never a fabricated 0 or 1
  });

  it("perfect agreement: every present label scores 1", () => {
    const gold: Tag[] = ["TAG", "ENG", "NE", "OTHER"];
    const results = perLabelAccuracy(gold, gold);
    for (const r of results) {
      if (r.support > 0) expect(r.accuracy).toBe(1);
    }
  });
});
