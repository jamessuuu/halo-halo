/**
 * Tier 0 — social pre-extraction.
 *
 * docs/batch2-linguistic-spec.md Section 1: regex-extract, as atomic
 * OTHER-tagged spans, BEFORE Tier 1 touches the string: URLs, at-mentions,
 * hashtags, and emoji sequences (as UAX #29 grapheme clusters). Precedent:
 * the standard social-text pre-tokenization pattern from ark-tweet-nlp /
 * Twokenize (OConnor, Gimpel, Mills, Owoputi; CMU ARK), cited for the
 * engineering pattern only. Reason this must run first: UAX #29 word-
 * boundary rules were never designed for URL syntax and fragment it
 * unpredictably on ".", "/", "-", "?", "=" — handing a URL to Tier 1
 * unprotected is a guaranteed, silent, demo-visible bug (row 11).
 */
import { isEmojiLikeGrapheme, toGraphemes } from "./graphemes";

export interface Tier0Span {
  start: number;
  end: number;
  text: string;
  /** "protected" spans are atomic and skip Tier 1 entirely; "plain" spans
   * are handed to Tier 1 for UAX #29 word segmentation. */
  kind: "protected" | "plain";
  /** Rule id, present only on protected spans. */
  ruleId?: string;
}

// URLs: scheme-qualified ("https://...") or a bare shortlink-style domain +
// path (row 11: "bit.ly/abc123", no scheme). General URL recognition is a
// known-hard problem (RFC 3986 does not define a closed grammar for
// "looks like a URL in free text") — this regex covers the shapes this
// project's fixtures and sample texts use; anything outside it is a named,
// disclosed non-goal, not a silent gap.
const URL_RE = /\b(?:https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+|[a-z0-9-]+\.(?:ly|com|net|org|io|co|ph|gov|edu)\/[^\s<>"')\]]*)/giu;
const MENTION_RE = /(?<![\w@])@[A-Za-z0-9_]+\b/gu;
const HASHTAG_RE = /(?<![\w#])#[A-Za-z0-9_]+\b/gu;

interface RawMatch {
  start: number;
  end: number;
  ruleId: string;
}

function findAll(re: RegExp, text: string, ruleId: string): RawMatch[] {
  const out: RawMatch[] = [];
  for (const m of text.matchAll(re)) {
    if (m.index === undefined) continue;
    out.push({ start: m.index, end: m.index + m[0].length, ruleId });
  }
  return out;
}

/** Merge overlapping/adjacent raw matches, first-found-wins on overlap, then sort by start. */
function resolveOverlaps(matches: RawMatch[]): RawMatch[] {
  const sorted = [...matches].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: RawMatch[] = [];
  let cursor = -1;
  for (const m of sorted) {
    if (m.start >= cursor) {
      out.push(m);
      cursor = m.end;
    }
  }
  return out;
}

export function runTier0(input: string): Tier0Span[] {
  const raw: RawMatch[] = [
    ...findAll(URL_RE, input, "tier0-url"),
    ...findAll(MENTION_RE, input, "tier0-mention"),
    ...findAll(HASHTAG_RE, input, "tier0-hashtag"),
  ];

  // Emoji-like grapheme clusters, scanned over the whole string via a real
  // UAX #29 grapheme segmenter (never .length, never array-spread — see
  // graphemes.ts). Each qualifying cluster becomes its own protected span
  // unless it already falls inside a URL/mention/hashtag match above.
  let cursor = 0;
  for (const g of toGraphemes(input)) {
    const start = cursor;
    const end = cursor + g.length;
    cursor = end;
    if (!isEmojiLikeGrapheme(g)) continue;
    const insideExisting = raw.some((m) => start >= m.start && start < m.end);
    if (!insideExisting) raw.push({ start, end, ruleId: "tier0-emoji" });
  }

  const resolved = resolveOverlaps(raw);

  const spans: Tier0Span[] = [];
  let pos = 0;
  for (const m of resolved) {
    if (m.start > pos) {
      spans.push({ start: pos, end: m.start, text: input.slice(pos, m.start), kind: "plain" });
    }
    spans.push({ start: m.start, end: m.end, text: input.slice(m.start, m.end), kind: "protected", ruleId: m.ruleId });
    pos = m.end;
  }
  if (pos < input.length) {
    spans.push({ start: pos, end: input.length, text: input.slice(pos), kind: "plain" });
  }
  return spans;
}
