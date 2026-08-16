/**
 * Cohen's kappa, per label — docs/batch2-linguistic-spec.md Section 4.1
 * item 3: "Report Cohen kappa, not raw percent agreement, and report it
 * PER LABEL, not only pooled." This computes self-test-retest kappa
 * between two annotation passes over the SAME items (the annotation
 * workbench's blind-shuffle retest mode, src/app/annotate/), never
 * inter-annotator agreement — Section 4.1 item 4's distinction, which this
 * project prints wherever a kappa number appears, not just here.
 *
 * Standard 2x2-per-label formulation: for label L, a = both raters said L,
 * b = rater1 said L / rater2 did not, c = rater1 did not / rater2 said L,
 * d = neither said L. po = (a+d)/n observed agreement; pe = expected
 * agreement by chance from each rater's own marginal rate of L.
 * kappa = (po - pe) / (1 - pe).
 */
import type { Tag } from "../types";
import { ALL_TAGS } from "./token-accuracy";

export interface LabelKappa {
  tag: Tag;
  /** Total item count the two passes cover (same for every label, since
   * it is the same annotated item set) — kappa is unstable at small n
   * (Section 4.1 item 2: "the PRIMARY protocol requires at least 20% of
   * the eval set or 40 items, whichever is larger"), so this must always
   * be printed alongside the number, same discipline as boundary-F1's n. */
  n: number;
  /** null when pe === 1 (both raters agree on everything by never varying
   * on this label) — kappa is mathematically undefined there, never
   * silently reported as 0 or 1. */
  kappa: number | null;
}

export function computePerLabelKappa(pass1: Tag[], pass2: Tag[]): LabelKappa[] {
  if (pass1.length !== pass2.length) {
    throw new Error(`computePerLabelKappa: pass1 (${String(pass1.length)}) and pass2 (${String(pass2.length)}) must be the same length — same items, two annotation passes`);
  }
  const n = pass1.length;

  return ALL_TAGS.map((tag) => {
    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;
    for (let i = 0; i < n; i++) {
      const p1IsTag = pass1[i] === tag;
      const p2IsTag = pass2[i] === tag;
      if (p1IsTag && p2IsTag) a++;
      else if (p1IsTag && !p2IsTag) b++;
      else if (!p1IsTag && p2IsTag) c++;
      else d++;
    }
    if (n === 0) return { tag, n: 0, kappa: null };

    const po = (a + d) / n;
    const p1Rate = (a + b) / n;
    const p2Rate = (a + c) / n;
    const pe = p1Rate * p2Rate + (1 - p1Rate) * (1 - p2Rate);
    const kappa = pe === 1 ? null : (po - pe) / (1 - pe);

    return { tag, n, kappa };
  });
}
