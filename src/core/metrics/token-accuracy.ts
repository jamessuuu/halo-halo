/**
 * Per-label token accuracy + confusion matrix — docs/batch2-linguistic-
 * spec.md Section 5.1 and 5.3: "per-label (never pooled) token accuracy and
 * a confusion matrix" as the required secondary metric, always shown
 * alongside boundary-F1, never alone (each provably hides the other's
 * failure mode — Section 5.3).
 */
import type { Tag } from "../types";

export const ALL_TAGS: readonly Tag[] = ["TAG", "ENG", "MIXED", "NE", "OTHER", "AMBIGUOUS"];

/** confusion[gold][predicted] = count. */
export type ConfusionMatrix = Record<Tag, Record<Tag, number>>;

function emptyMatrix(): ConfusionMatrix {
  const m = {} as ConfusionMatrix;
  for (const g of ALL_TAGS) {
    m[g] = {} as Record<Tag, number>;
    for (const p of ALL_TAGS) m[g][p] = 0;
  }
  return m;
}

export function buildConfusionMatrix(predicted: Tag[], gold: Tag[]): ConfusionMatrix {
  if (predicted.length !== gold.length) {
    throw new Error(`buildConfusionMatrix: predicted (${String(predicted.length)}) and gold (${String(gold.length)}) must be the same length`);
  }
  const m = emptyMatrix();
  for (let i = 0; i < gold.length; i++) {
    const g = gold[i];
    const p = predicted[i];
    if (g === undefined || p === undefined) continue;
    m[g][p]++;
  }
  return m;
}

export interface PerLabelAccuracy {
  tag: Tag;
  /** Count of gold tokens with this label — the support (doctrine 5's
   * warning: never print a rate without its support). */
  support: number;
  /** Fraction of gold-label tokens the segmenter also labeled this tag
   * (per-class recall) — what "token-level accuracy... per label" means
   * once accuracy is broken out by class instead of pooled. */
  accuracy: number | null;
}

/**
 * Section 5.1's "severe class imbalance" failure mode, made impossible to
 * accidentally reproduce: this returns one number PER TAG with its
 * support, never a single pooled scalar.
 */
export function perLabelAccuracy(predicted: Tag[], gold: Tag[]): PerLabelAccuracy[] {
  const matrix = buildConfusionMatrix(predicted, gold);
  return ALL_TAGS.map((tag) => {
    const support = ALL_TAGS.reduce((sum, p) => sum + (matrix[tag][p] ?? 0), 0);
    const correct = matrix[tag][tag] ?? 0;
    return { tag, support, accuracy: support === 0 ? null : correct / support };
  });
}
