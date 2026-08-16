/**
 * Tier 2 — intra-word split (the affix layer) + whole-token labeling.
 *
 * docs/batch2-linguistic-spec.md Section 1, Tier 2 + Section 2 (label
 * decision rules). Implements, in this order (each step only runs if the
 * previous ones did not resolve the token):
 *
 *  1. NE gazetteer (exact, case-sensitive) — "Tier 2 never fires on a token
 *     that has already matched NE."
 *  2. Bare numeral.
 *  3. Paralinguistic (laughter markers).
 *  4. Nativized-ambiguous whole-word list ("gets").
 *  5. MIXED-intraword whole-word list ("dinownload", "pinost").
 *  6. Respelling normalization -> base-lexeme lookup ("dyan"/"jan").
 *  7. Closed-class function word.
 *  8. Whole-word Tagalog (open-class root/standalone list).
 *  9. Whole-word English.
 * 10. The -ng linker (unconditional MWT split when the stem independently
 *     resolves native — a general Tagalog phenomenon, not conditioned on a
 *     foreign root).
 * 11. Circumfix match, with root-language backout.
 * 12. Prefix match, with root-language backout.
 * 13. Suffix match, with root-language backout.
 * 14. Fallback: AMBIGUOUS, out-of-vocabulary, LOW confidence.
 *
 * The backout rule (steps 11-13): "root-language detection must run
 * between the two strips" (Section 1) — if the extracted root independently
 * resolves to a recognized NATIVE Tagalog root, the split is abandoned and
 * the whole token is treated as one native word. This is what stops
 * "pinagbutihan" from being torn into three pieces, and what lets
 * "maganda" (ma- + ganda, both native) resolve as one TAG token instead of
 * ma-/anda nonsense (see pickBestPrefixMatch below for the disambiguation
 * this requires when more than one prefix candidate matches).
 */
import { ENGLISH_ROOTS } from "./lexicon/english-words";
import { CIRCUMFIXES, PREFIXES, SUFFIXES } from "./lexicon/affixes";
import { NAMED_ENTITIES } from "./lexicon/gazetteer";
import { MIXED_INTRAWORD } from "./lexicon/mixed-intraword";
import {
  AMBIGUOUS_NATIVIZED,
  CLOSED_FUNCTION_WORDS,
  isParalinguistic,
  RESPELLINGS,
  TAGALOG_NATIVE,
  TAGALOG_STANDALONE,
} from "./lexicon/tagalog-words";
import type { Leaf } from "./types";

function leaf(text: string, start: number, tag: Leaf["tag"], confidence: Leaf["confidence"], ruleId: string, note?: string): Leaf {
  return note === undefined
    ? { text, start, end: start + text.length, tag, confidence, ruleId }
    : { text, start, end: start + text.length, tag, confidence, ruleId, note };
}

function isNativeTagalogRoot(rootLower: string): boolean {
  return TAGALOG_NATIVE.has(rootLower);
}

/** The root slot of an already-decided split: ENG, digit-led OTHER, or the disclosed OOV/AMBIGUOUS fallback. */
function classifyNonNativeRoot(rootText: string, rootStart: number): Leaf {
  const rootLower = rootText.toLowerCase();
  if (/^[0-9]/.test(rootLower)) {
    return leaf(rootText, rootStart, "OTHER", "HIGH", "other-root", `"${rootText}" is digit-initial, non-lexical in this root position.`);
  }
  if (ENGLISH_ROOTS.has(rootLower)) {
    return leaf(rootText, rootStart, "ENG", "HIGH", "eng-root");
  }
  return leaf(
    rootText,
    rootStart,
    "AMBIGUOUS",
    "LOW",
    "ambiguous-oov-root",
    `"${rootText}" is not in the maintained Tagalog or English wordlist — disclosed out-of-vocabulary recall gap, not silently defaulted to ENG.`
  );
}

// --- hyphen-tolerant edge matching -----------------------------------------
// "the hyphen is a confidence booster, not a requirement" (row 2): an affix
// form matches whether or not a literal hyphen separates it from the root.

function matchAtStart(lower: string, form: string): number | null {
  if (lower.startsWith(form + "-")) return form.length + 1;
  if (lower.startsWith(form)) return form.length;
  return null;
}

function matchAtEnd(lower: string, form: string): number | null {
  if (lower.endsWith("-" + form)) return form.length + 1;
  if (lower.endsWith(form)) return form.length;
  return null;
}

// --- candidate selection: prefer a match whose root resolves to a known
// lexeme (native, then recognized-foreign) over one that does not, rather
// than blindly taking the longest matching affix string. This is what
// correctly resolves "maganda" as ma-+ganda (both native prefixes "ma-"
// and "mag-" match the literal string; only "ma-" leaves a recognized
// root) instead of a nonsense mag-+"anda" split. -----------------------

interface PrefixCandidate {
  form: string;
  consumed: number;
  root: string;
}

function prefixCandidates(lower: string): PrefixCandidate[] {
  const out: PrefixCandidate[] = [];
  for (const p of PREFIXES) {
    const consumed = matchAtStart(lower, p.form);
    if (consumed !== null && lower.length > consumed) {
      out.push({ form: p.form, consumed, root: lower.slice(consumed) });
    }
  }
  return out;
}

function isRecognizedForeignRoot(root: string): boolean {
  return ENGLISH_ROOTS.has(root) || /^[0-9]/.test(root);
}

function pickBestPrefixMatch(lower: string): PrefixCandidate | null {
  const candidates = prefixCandidates(lower);
  if (candidates.length === 0) return null;
  const native = candidates.find((c) => isNativeTagalogRoot(c.root));
  if (native) return native;
  const foreign = candidates.filter((c) => isRecognizedForeignRoot(c.root));
  if (foreign.length > 0) {
    return foreign.reduce((best, c) => (c.consumed > best.consumed ? c : best));
  }
  return candidates.reduce((best, c) => (c.consumed > best.consumed ? c : best));
}

interface CircumfixCandidate {
  prefix: string;
  suffix: string;
  prefixConsumed: number;
  suffixConsumed: number;
  root: string;
}

function circumfixCandidates(lower: string): CircumfixCandidate[] {
  const out: CircumfixCandidate[] = [];
  for (const cf of CIRCUMFIXES) {
    const prefixConsumed = matchAtStart(lower, cf.prefix);
    const suffixConsumed = matchAtEnd(lower, cf.suffix);
    if (prefixConsumed === null || suffixConsumed === null) continue;
    if (lower.length <= prefixConsumed + suffixConsumed) continue;
    out.push({
      prefix: cf.prefix,
      suffix: cf.suffix,
      prefixConsumed,
      suffixConsumed,
      root: lower.slice(prefixConsumed, lower.length - suffixConsumed),
    });
  }
  return out;
}

function pickBestCircumfixMatch(lower: string): CircumfixCandidate | null {
  const candidates = circumfixCandidates(lower);
  if (candidates.length === 0) return null;
  const native = candidates.find((c) => isNativeTagalogRoot(c.root));
  if (native) return native;
  const foreign = candidates.filter((c) => isRecognizedForeignRoot(c.root));
  if (foreign.length > 0) {
    return foreign.reduce((best, c) => (c.prefixConsumed + c.suffixConsumed > best.prefixConsumed + best.suffixConsumed ? c : best));
  }
  return candidates[0] ?? null;
}

interface SuffixCandidate {
  form: string;
  consumed: number;
  root: string;
}

function suffixCandidates(lower: string): SuffixCandidate[] {
  const out: SuffixCandidate[] = [];
  for (const s of SUFFIXES) {
    const consumed = matchAtEnd(lower, s.form);
    if (consumed !== null && lower.length > consumed) {
      out.push({ form: s.form, consumed, root: lower.slice(0, lower.length - consumed) });
    }
  }
  return out;
}

function pickBestSuffixMatch(lower: string): SuffixCandidate | null {
  const candidates = suffixCandidates(lower);
  if (candidates.length === 0) return null;
  const native = candidates.find((c) => isNativeTagalogRoot(c.root));
  if (native) return native;
  const foreign = candidates.filter((c) => isRecognizedForeignRoot(c.root));
  if (foreign.length > 0) {
    return foreign.reduce((best, c) => (c.consumed > best.consumed ? c : best));
  }
  return candidates.reduce((best, c) => (c.consumed > best.consumed ? c : best));
}

/**
 * Classify one Tier-1 word-like span into one or more Leaf tokens.
 * `text`/`start` are this span's surface text and its offset into the
 * ORIGINAL input string.
 */
export function classifyWord(text: string, start: number): Leaf[] {
  const lower = text.toLowerCase();

  // 1. NE gazetteer — exact, case-sensitive.
  if (NAMED_ENTITIES.has(text)) {
    return [leaf(text, start, "NE", "HIGH", "ne-gazetteer")];
  }

  // 2. Bare numeral.
  if (/^[0-9]+$/.test(text)) {
    return [leaf(text, start, "OTHER", "HIGH", "other-numeral")];
  }

  // 3. Paralinguistic.
  if (isParalinguistic(lower)) {
    return [
      leaf(text, start, "OTHER", "HIGH", "other-paralinguistic", `"${text}" is a laughter/paralinguistic marker attested identically in English- and Tagalog-language writing.`),
    ];
  }

  // 4. Nativized-ambiguous whole word.
  const nativized = AMBIGUOUS_NATIVIZED.get(lower);
  if (nativized !== undefined) {
    return [leaf(text, start, "AMBIGUOUS", "LOW", "ambiguous-nativized", nativized)];
  }

  // 5. MIXED-intraword whole word.
  const mixed = MIXED_INTRAWORD.get(lower);
  if (mixed !== undefined) {
    return [leaf(text, start, "MIXED", "HIGH", "mixed-intraword", mixed.gloss)];
  }

  // 6. Respelling normalization.
  const respelling = RESPELLINGS.get(lower);
  if (respelling !== undefined && TAGALOG_NATIVE.has(respelling.base)) {
    const ruleId = respelling.confidence === "LOW" ? "tag-respelling-low-confidence" : "tag-respelling-normalized";
    const note = respelling.ambiguousWithName
      ? `Respelling of "${respelling.base}"; ambiguous with a given name in this spelling — the capitalized form routes to the NE gazetteer instead.`
      : `Respelling of "${respelling.base}".`;
    return [leaf(text, start, "TAG", respelling.confidence, ruleId, note)];
  }

  // 7. Closed-class function word.
  if (CLOSED_FUNCTION_WORDS.has(lower)) {
    return [leaf(text, start, "TAG", "HIGH", "tag-closed-function-word")];
  }

  // 8. Whole-word Tagalog.
  if (TAGALOG_STANDALONE.has(lower)) {
    return [leaf(text, start, "TAG", "HIGH", "tag-whole-word")];
  }

  // 9. Whole-word English.
  if (ENGLISH_ROOTS.has(lower)) {
    return [leaf(text, start, "ENG", "HIGH", "eng-wordlist")];
  }

  // 10. The -ng linker: unconditional MWT split when the stem
  // independently resolves to a single native-Tagalog leaf.
  if (lower.length > 3 && lower.endsWith("ng") && /[aeiou]$/.test(lower.slice(0, -2))) {
    const stemText = text.slice(0, -2);
    const stemLeaves = classifyWord(stemText, start);
    if (stemLeaves.length === 1 && stemLeaves[0]?.tag === "TAG") {
      const ngStart = start + stemText.length;
      return [...stemLeaves, leaf(text.slice(-2), ngStart, "TAG", "HIGH", "tag-linker-ng")];
    }
  }

  // 11. Circumfix, with root-language backout.
  const cf = pickBestCircumfixMatch(lower);
  if (cf !== null) {
    if (isNativeTagalogRoot(cf.root)) {
      return [
        leaf(
          text,
          start,
          "TAG",
          "HIGH",
          "tag-native-whole-word",
          `Candidate circumfix "${cf.prefix}-...-${cf.suffix}" strips to root "${cf.root}", a recognized native Tagalog root — kept as one word, not split.`
        ),
      ];
    }
    const prefixText = text.slice(0, cf.prefixConsumed);
    const rootText = text.slice(cf.prefixConsumed, text.length - cf.suffixConsumed);
    const suffixText = text.slice(text.length - cf.suffixConsumed);
    return [
      leaf(prefixText, start, "TAG", "HIGH", "tier2-circumfix-tag"),
      classifyNonNativeRoot(rootText, start + cf.prefixConsumed),
      leaf(suffixText, start + text.length - cf.suffixConsumed, "TAG", "HIGH", "tier2-circumfix-tag"),
    ];
  }

  // 12. Prefix, with root-language backout.
  const pf = pickBestPrefixMatch(lower);
  if (pf !== null) {
    if (isNativeTagalogRoot(pf.root)) {
      return [
        leaf(
          text,
          start,
          "TAG",
          "HIGH",
          "tag-native-whole-word",
          `Candidate prefix "${pf.form}-" strips to root "${pf.root}", a recognized native Tagalog root — kept as one word, not split.`
        ),
      ];
    }
    const prefixText = text.slice(0, pf.consumed);
    const rootText = text.slice(pf.consumed);
    return [leaf(prefixText, start, "TAG", "HIGH", "tier2-prefix-tag"), classifyNonNativeRoot(rootText, start + pf.consumed)];
  }

  // 13. Suffix, with root-language backout.
  const sf = pickBestSuffixMatch(lower);
  if (sf !== null) {
    if (isNativeTagalogRoot(sf.root)) {
      return [
        leaf(
          text,
          start,
          "TAG",
          "HIGH",
          "tag-native-whole-word",
          `Candidate suffix "-${sf.form}" strips to root "${sf.root}", a recognized native Tagalog root — kept as one word, not split.`
        ),
      ];
    }
    const rootText = text.slice(0, text.length - sf.consumed);
    const suffixText = text.slice(text.length - sf.consumed);
    return [classifyNonNativeRoot(rootText, start), leaf(suffixText, start + rootText.length, "TAG", "HIGH", "tier2-suffix-tag")];
  }

  // 14. Fallback: disclosed OOV.
  return [
    leaf(
      text,
      start,
      "AMBIGUOUS",
      "LOW",
      "ambiguous-oov-whole-word",
      `"${text}" matched no lexicon entry, gazetteer entry, or affix pattern — disclosed out-of-vocabulary recall gap.`
    ),
  ];
}
