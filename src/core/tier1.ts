/**
 * Tier 1 — UAX #29 outer tokenization.
 *
 * docs/batch2-linguistic-spec.md Section 1: apply UAX #29 default word-
 * boundary rules to whatever Tier 0 left behind, via `Intl.Segmenter`
 * word-granularity (locale-sensitive, exposes `isWordLike` per segment —
 * confirmed via MDN).
 *
 * DEVIATION (see docs/DEVIATIONS.md): the Linguistic Spec's prose claims
 * "there is no rule that breaks on ASCII hyphen-minus by default" and that
 * a hyphenated compound like "out-of-the-box" stays one UAX #29 word-like
 * segment. Verified empirically against Node's ICU-backed
 * `Intl.Segmenter` (the exact primitive the spec mandates) — this is NOT
 * what happens: HYPHEN-MINUS is not in the MidLetter/MidNumLet word-break
 * classes, so `Intl.Segmenter` emits "nag" / "-" / "book" as three
 * separate segments, the middle one non-word-like. Since the architecture
 * (Tier 2 must see the whole hyphenated span to do affix matching) and
 * every worked example that uses a hyphen (rows 1, 2, 3, 9, 16) require
 * the joined span, `rejoinHyphenated` below re-merges a
 * word-like/"-"/word-like run (repeatable, so "out-of-the-box" collapses
 * fully) back into one Tier-1 span AFTER Intl.Segmenter runs. This
 * preserves the spec's architectural intent using the spec's own mandated
 * primitive, correcting only the inaccurate premise about that primitive's
 * default behavior — it does not change what "unhyphenated must resolve
 * identically" (row 2) requires, since Tier 2's affix matching already
 * tolerates the hyphen being present or absent (tier2.ts's
 * matchAtStart/matchAtEnd).
 */
export interface Tier1Span {
  start: number;
  end: number;
  text: string;
  isWordLike: boolean;
}

const wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" });

function rejoinHyphenated(rawSpans: Tier1Span[]): Tier1Span[] {
  const out: Tier1Span[] = [];
  let i = 0;
  while (i < rawSpans.length) {
    const current = rawSpans[i];
    if (!current) {
      i++;
      continue;
    }
    if (!current.isWordLike) {
      out.push(current);
      i++;
      continue;
    }
    let merged = current;
    let j = i;
    while (j + 2 < rawSpans.length) {
      const hyphen = rawSpans[j + 1];
      const next = rawSpans[j + 2];
      if (!hyphen || !next || hyphen.text !== "-" || hyphen.isWordLike || !next.isWordLike) break;
      merged = { start: merged.start, end: next.end, text: merged.text + hyphen.text + next.text, isWordLike: true };
      j += 2;
    }
    out.push(merged);
    i = j + 1;
  }
  return out;
}

/**
 * Segments one Tier-0 "plain" span. `baseOffset` is that span's start
 * offset into the ORIGINAL input, so returned spans carry original-string
 * offsets throughout the pipeline.
 */
export function runTier1(text: string, baseOffset: number): Tier1Span[] {
  const raw: Tier1Span[] = [];
  for (const seg of wordSegmenter.segment(text)) {
    if (seg.segment.length === 0) continue;
    raw.push({
      start: baseOffset + seg.index,
      end: baseOffset + seg.index + seg.segment.length,
      text: seg.segment,
      isWordLike: seg.isWordLike ?? false,
    });
  }
  return rejoinHyphenated(raw);
}
