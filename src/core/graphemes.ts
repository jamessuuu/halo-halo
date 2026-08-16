/**
 * Grapheme-cluster utilities.
 *
 * docs/batch2-linguistic-spec.md Section 1, "Grapheme-cluster rule (binding
 * wherever the UI shows any character or emoji count)": use UAX #29
 * grapheme-cluster boundaries (rules GB9, GB11) via a real segmenter, not
 * `.length` (wrong for surrogate pairs AND combining marks/ZWJ) and not
 * array-spread iteration (fixes surrogate pairs only, still wrong for ZWJ
 * sequences like a heart emoji written as base + variation selector,
 * U+2764 U+FE0F — two code points, one visible unit).
 */

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Split a string into its UAX #29 grapheme clusters. */
export function toGraphemes(text: string): string[] {
  return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
}

/** Grapheme-cluster-correct count — never `.length` (see module doc). */
export function graphemeLength(text: string): number {
  return toGraphemes(text).length;
}

/**
 * A grapheme cluster counts as "emoji-like" if it contains an
 * Extended_Pictographic code point (Unicode property escape, matches the
 * UAX #29 GB11 rule family this project binds to) or the Emoji_Presentation
 * property (covers a small number of emoji, e.g. some flags/keycaps, that
 * are not Extended_Pictographic but still render as emoji by default).
 */
const EMOJI_LIKE = /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u;

export function isEmojiLikeGrapheme(cluster: string): boolean {
  return EMOJI_LIKE.test(cluster);
}
