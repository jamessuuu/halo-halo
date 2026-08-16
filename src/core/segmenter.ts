/**
 * The orchestrator: Tier 0 -> Tier 1 -> Tier 2, then switch-point
 * computation (docs/batch2-linguistic-spec.md Section 3). This is the one
 * entry point the demo (src/app), the eval harness (scripts/gen-eval-
 * report.ts), and the annotation workbench all call — pure, isomorphic,
 * zero DOM/network (enforced by eslint.config.mjs's src/core restriction).
 */
import { runTier0 } from "./tier0";
import { runTier1 } from "./tier1";
import { classifyWord } from "./tier2";
import type { Leaf, SegmentResult, SwitchPoint, Word } from "./types";

const WHITESPACE_ONLY = /^\s+$/;

function wordFromLeaves(text: string, start: number, end: number, leaves: Leaf[]): Word {
  return { text, start, end, split: leaves.length > 1, leaves };
}

export function segment(input: string): SegmentResult {
  const words: Word[] = [];

  for (const t0 of runTier0(input)) {
    if (t0.kind === "protected") {
      const l: Leaf = { text: t0.text, start: t0.start, end: t0.end, tag: "OTHER", confidence: "HIGH", ruleId: t0.ruleId ?? "other-punctuation" };
      words.push(wordFromLeaves(t0.text, t0.start, t0.end, [l]));
      continue;
    }

    for (const t1 of runTier1(t0.text, t0.start)) {
      if (!t1.isWordLike) {
        if (WHITESPACE_ONLY.test(t1.text)) continue; // pure whitespace: a rendering gap, not a token
        const l: Leaf = { text: t1.text, start: t1.start, end: t1.end, tag: "OTHER", confidence: "HIGH", ruleId: "other-punctuation" };
        words.push(wordFromLeaves(t1.text, t1.start, t1.end, [l]));
        continue;
      }
      const leaves = classifyWord(t1.text, t1.start);
      words.push(wordFromLeaves(t1.text, t1.start, t1.end, leaves));
    }
  }

  const leaves = words.flatMap((w) => w.leaves);
  const switchPoints = computeSwitchPoints(words, leaves);

  return { input, words, leaves, switchPoints };
}

/**
 * docs/batch2-linguistic-spec.md Section 3: a switch point is a boundary
 * between two adjacent leaves whose labels differ, counted ONLY over the
 * {TAG, ENG} pair. A boundary touching OTHER/NE/AMBIGUOUS/MIXED is not
 * counted. A Tier-2-internal boundary (e.g. between "nag-" and "book") IS
 * counted — that is this project's actual reason to exist.
 */
function computeSwitchPoints(words: Word[], leaves: Leaf[]): SwitchPoint[] {
  const out: SwitchPoint[] = [];
  const SWITCHABLE: ReadonlySet<Leaf["tag"]> = new Set(["TAG", "ENG"]);

  // Map each leaf index to whether it starts a new Word (interword boundary
  // on its LEFT edge), for labeling switch points as interword vs
  // Tier-2-internal.
  const wordStartLeafIndex = new Set<number>();
  let idx = 0;
  for (const w of words) {
    wordStartLeafIndex.add(idx);
    idx += w.leaves.length;
  }

  for (let i = 0; i < leaves.length - 1; i++) {
    const a = leaves[i];
    const b = leaves[i + 1];
    if (!a || !b) continue;
    if (!SWITCHABLE.has(a.tag) || !SWITCHABLE.has(b.tag)) continue;
    if (a.tag === b.tag) continue;
    out.push({ leafIndex: i, interword: wordStartLeafIndex.has(i + 1) });
  }
  return out;
}
