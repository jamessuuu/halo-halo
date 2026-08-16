/**
 * The eval harness (docs/halo-halo-SPEC.md M4: "eval harness computing
 * per-label metrics with flags"). Deterministic by construction (no
 * Date.now(), no Math.random(), no network) so `pnpm ci:eval-check` can
 * diff the committed output and fail on drift, same pattern as
 * scripts/brand.mjs.
 *
 * HONESTY NOTE, printed into the report itself, not just here: "predicted"
 * is the LIVE src/core/segmenter.ts output; "reviewed" (this report's
 * reference/gold for these numbers) is the machine-drafted v0-set label,
 * confirmed-or-corrected ONCE by the builder during eval/v0-set/
 * construction (eval/v0-set/reviewed-overrides.json holds only the
 * divergent items — everywhere no override exists, reviewed === the rule
 * engine's own output, i.e. review confirmed it). This is NOT the
 * single-annotator human self-test-retest protocol
 * docs/batch2-linguistic-spec.md Section 4 defines — that pass has not
 * run (docs/DEVIATIONS.md). These numbers therefore measure whether the
 * CURRENT code still reproduces its own reviewed v0-set labels (a
 * regression/consistency check across code changes), not accuracy against
 * independently-verified gold and not inter-annotator agreement. Kappa is
 * not computed here at all — it requires two independent annotation
 * passes over blind-shuffled items, which is exactly what the annotation
 * workbench (/annotate) exists to produce, and has not happened yet.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { computeBoundaryF1 } from "../src/core/metrics/boundary-f1";
import { buildConfusionMatrix, perLabelAccuracy } from "../src/core/metrics/token-accuracy";
import { segment } from "../src/core/segmenter";
import type { Confidence, Tag } from "../src/core/types";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

interface SourceText {
  id: string;
  register: string;
  text: string;
}

interface Override {
  textId: string;
  leafText: string;
  reviewedTag: Tag;
  reviewedConfidence: Confidence;
  reviewNote: string;
}

const texts = JSON.parse(readFileSync(path.join(repoRoot, "eval/v0-set/texts.json"), "utf8")) as SourceText[];
const overrides = JSON.parse(readFileSync(path.join(repoRoot, "eval/v0-set/reviewed-overrides.json"), "utf8")) as Override[];

let overridesApplied = 0;
const allPredicted: Tag[] = [];
const allReviewed: Tag[] = [];
let sumTruePositive = 0;
let sumFalsePositive = 0;
let sumFalseNegative = 0;
let sumGoldSwitches = 0;

const perText: {
  id: string;
  register: string;
  leafCount: number;
  boundaryF1: ReturnType<typeof computeBoundaryF1>;
}[] = [];

for (const t of texts) {
  const result = segment(t.text);
  const predictedTags: Tag[] = result.leaves.map((l) => l.tag);
  const reviewedTags: Tag[] = result.leaves.map((leaf) => {
    const override = overrides.find((o) => o.textId === t.id && o.leafText === leaf.text);
    if (override) {
      overridesApplied++;
      return override.reviewedTag;
    }
    return leaf.tag;
  });

  allPredicted.push(...predictedTags);
  allReviewed.push(...reviewedTags);

  const f1 = computeBoundaryF1(predictedTags, reviewedTags);
  sumTruePositive += f1.truePositive;
  sumFalsePositive += f1.falsePositive;
  sumFalseNegative += f1.falseNegative;
  sumGoldSwitches += f1.n;

  perText.push({ id: t.id, register: t.register, leafCount: result.leaves.length, boundaryF1: f1 });
}

if (overridesApplied !== overrides.length) {
  console.error(
    `gen-eval-report: ${String(overrides.length - overridesApplied)} override(s) in eval/v0-set/reviewed-overrides.json did not match any leaf — a text was edited without updating its override. Aborting rather than silently dropping a reviewed correction.`
  );
  process.exit(1);
}

// Sum counts across texts, THEN derive precision/recall/f1 — never average
// per-text ratios directly (that would distort small-n texts unevenly).
const aggPrecision = sumTruePositive + sumFalsePositive === 0 ? 1 : sumTruePositive / (sumTruePositive + sumFalsePositive);
const aggRecall = sumGoldSwitches === 0 ? 1 : sumTruePositive / sumGoldSwitches;
const aggF1 = aggPrecision + aggRecall === 0 ? 0 : (2 * aggPrecision * aggRecall) / (aggPrecision + aggRecall);

const report = {
  provenance: {
    annotator: "draft-automated",
    honestyNote:
      "\"predicted\" = live src/core/segmenter.ts output at report-generation time. \"reviewed\" (this report's reference for these numbers) = the machine-drafted v0-set label, confirmed-or-corrected once by the builder during eval/v0-set/ construction (eval/v0-set/reviewed-overrides.json holds only the divergent items). This is NOT the single-annotator human self-test-retest protocol docs/batch2-linguistic-spec.md Section 4 defines, and no such pass has run yet (docs/DEVIATIONS.md). These numbers measure whether the CURRENT code reproduces its own reviewed v0-set labels — a regression/consistency check, not an accuracy claim against independent gold, and not inter-annotator agreement. Single-annotator v0, seeking co-annotators.",
  },
  source: {
    textCount: texts.length,
    leafCount: allPredicted.length,
    overridesApplied,
  },
  boundaryF1: {
    precision: aggPrecision,
    recall: aggRecall,
    f1: aggF1,
    n: sumGoldSwitches,
    truePositive: sumTruePositive,
    falsePositive: sumFalsePositive,
    falseNegative: sumFalseNegative,
    classImbalanceCaveat:
      "High variance at small n (docs/batch2-linguistic-spec.md Section 5.2) — a single missed or extra boundary swings this number by several points at this sample size. Does not say WHICH label was wrong on either side of a correctly-placed boundary.",
  },
  perLabelAccuracy: perLabelAccuracy(allPredicted, allReviewed),
  perLabelAccuracyCaveat:
    "Per-label, never pooled (Section 5.1) — a trivial always-predict-majority-label baseline would score high pooled accuracy while being useless at the rare classes (MIXED, AMBIGUOUS, NE) this project exists to surface.",
  confusionMatrix: buildConfusionMatrix(allPredicted, allReviewed),
  kappa: null,
  kappaNote:
    "Not available. Self-test-retest kappa requires two independent annotation passes over blind-shuffled items (docs/batch2-linguistic-spec.md Section 4.1) — that is what the annotation workbench (/annotate) is for, and no human pass has run yet. No kappa number is fabricated or estimated here.",
  perText,
};

const outDir = path.join(repoRoot, "eval/results");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "v0-eval-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`gen-eval-report: wrote eval/results/v0-eval-report.json (${String(texts.length)} texts, ${String(allPredicted.length)} leaves, ${String(overridesApplied)} reviewed override(s) applied)`);
