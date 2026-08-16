/**
 * Boundary-F1 — docs/batch2-linguistic-spec.md Section 5.2: precision/
 * recall/F1 over the set of switch-point boundaries (Section 3), treating
 * "is there a switch point between leaf i and leaf i+1" as a binary
 * detection task, scored over the positive (switch) class. Primary metric
 * (Section 5.3); MUST ship with n (the count of gold switch points).
 */
import type { Tag } from "../types";

const SWITCHABLE: ReadonlySet<Tag> = new Set(["TAG", "ENG"]);

/** Indices i such that a switch point sits between tags[i] and tags[i+1]. */
export function switchIndices(tags: Tag[]): Set<number> {
  const out = new Set<number>();
  for (let i = 0; i < tags.length - 1; i++) {
    const a = tags[i];
    const b = tags[i + 1];
    if (a === undefined || b === undefined) continue;
    if (a === b) continue;
    if (!SWITCHABLE.has(a) || !SWITCHABLE.has(b)) continue;
    out.add(i);
  }
  return out;
}

export interface BoundaryF1Result {
  precision: number;
  recall: number;
  f1: number;
  /** Count of gold switch points — must always be printed alongside F1 (Section 5.2). */
  n: number;
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
}

/**
 * `predicted` and `gold` must be the same length and cover the SAME leaf
 * sequence (this project never compares across two different
 * tokenizations) — only the tag values may differ.
 */
export function computeBoundaryF1(predicted: Tag[], gold: Tag[]): BoundaryF1Result {
  if (predicted.length !== gold.length) {
    throw new Error(`computeBoundaryF1: predicted (${String(predicted.length)}) and gold (${String(gold.length)}) must be the same length — same leaf sequence, different tags only`);
  }
  const predSet = switchIndices(predicted);
  const goldSet = switchIndices(gold);

  let truePositive = 0;
  for (const i of predSet) if (goldSet.has(i)) truePositive++;
  const falsePositive = predSet.size - truePositive;
  const falseNegative = goldSet.size - truePositive;

  // Standard vacuous-case convention: precision is about predictions ("of
  // what we predicted, how much was right") so an empty prediction set is
  // trivially precision 1 REGARDLESS of how many gold switches existed —
  // missed gold switches are a recall concern, not a precision one, and
  // conflating them here was a real bug caught by this file's own tests.
  // Symmetrically, recall is about gold ("of what actually switched, how
  // much did we find") so zero gold switches is trivially recall 1
  // regardless of any false positives predicted.
  const precision = predSet.size === 0 ? 1 : truePositive / predSet.size;
  const recall = goldSet.size === 0 ? 1 : truePositive / goldSet.size;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return { precision, recall, f1, n: goldSet.size, truePositive, falsePositive, falseNegative };
}
