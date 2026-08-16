/**
 * Shared types for the halo-halo segmenter.
 *
 * docs/batch2-linguistic-spec.md Section 2.1: six tags, not five and not
 * more — TAG / ENG / MIXED / NE / OTHER / AMBIGUOUS. "MIXED" here is the
 * Linguistic Spec's "MIXED-intraword" (SPEC.md's own six-tag list uses the
 * short form; both names refer to the identical tag).
 */
export type Tag = "TAG" | "ENG" | "MIXED" | "NE" | "OTHER" | "AMBIGUOUS";

/**
 * docs/batch2-linguistic-spec.md Section 4.1 item 5: per-item confidence,
 * set at labeling time, HIGH/MEDIUM/LOW. Never retrofitted after the fact.
 */
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

/**
 * A leaf token: the atomic unit switch points are computed over (Section 3).
 * One leaf may be the whole of a Tier-1 word-like span (no Tier-2 split), or
 * one of several leaves produced by a Tier-2 MWT split of one span.
 */
export interface Leaf {
  /** Surface text of this leaf as it appears in the original input. */
  text: string;
  /** UTF-16 code-unit offset into the original input string (inclusive). */
  start: number;
  /** UTF-16 code-unit offset into the original input string (exclusive). */
  end: number;
  tag: Tag;
  confidence: Confidence;
  /** Rule/lexicon-entry id this label traces to — see src/core/rules.ts. */
  ruleId: string;
  /**
   * One-line reason, required whenever tag is AMBIGUOUS (Linguistic Spec
   * Section 2.2) and used elsewhere to carry a worked-example's "why".
   */
   note?: string;
}

/**
 * A word: the "visible" collapsed unit the demo shows before expansion —
 * one Tier-0 atomic span (URL/mention/hashtag/emoji-grapheme) or one Tier-1
 * UAX #29 word-like span, together with the one-or-more Leaf tokens Tier 2
 * split it into. `leaves.length > 1` is exactly what "MIXED tokens
 * expandable to their internal affix/root split" (SPEC.md Surfaces) means.
 */
export interface Word {
  text: string;
  start: number;
  end: number;
  /** true when Tier 2 produced more than one leaf from this span. */
  split: boolean;
  leaves: Leaf[];
}

/**
 * A switch point per docs/batch2-linguistic-spec.md Section 3: a boundary
 * between two adjacent leaves whose labels differ, counted ONLY over the
 * {TAG, ENG} pair. `interword` is false for a Tier-2-internal boundary
 * (e.g. between "nag-" and "book") and true for a boundary between two
 * different Words.
 */
export interface SwitchPoint {
  /** Index into the flat leaves array (see SegmentResult.leaves) of the
   * left-hand leaf; the switch point sits between this index and the next. */
  leafIndex: number;
  interword: boolean;
}

export interface SegmentResult {
  input: string;
  words: Word[];
  /** All leaves, flattened, in document order — what metrics run over. */
  leaves: Leaf[];
  switchPoints: SwitchPoint[];
}
