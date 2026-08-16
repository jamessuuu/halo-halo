/**
 * Rule registry — docs/batch2-linguistic-spec.md Section 6 / constraint 7:
 * "every label the demo produces must be traceable, in the UI, to a
 * specific rule or lexicon entry a visitor can open and read." Every
 * `ruleId` the segmenter emits (tier0.ts, tier2.ts) MUST have an entry
 * here — enforced by src/core/segmenter.test.ts, which asserts every leaf
 * produced across the full fixture set resolves to a registered rule.
 */
export interface Rule {
  id: string;
  /** One-sentence, human-readable description of what fires this rule. */
  description: string;
}

export const RULES: Record<string, Rule> = {
  "tier0-url": {
    id: "tier0-url",
    description: "Tier 0: matched a URL pattern (scheme-qualified or a bare shortlink domain+path) and extracted it as one atomic OTHER span before word segmentation ran, so UAX #29 never fragments it on \".\"/\"/\"/\"-\".",
  },
  "tier0-mention": {
    id: "tier0-mention",
    description: "Tier 0: matched an @mention handle and extracted it as one atomic OTHER span (a handle is not a language-diagnostic lexical item).",
  },
  "tier0-hashtag": {
    id: "tier0-hashtag",
    description: "Tier 0: matched a #hashtag and extracted it as one atomic OTHER span, unsegmented internally (hashtag-internal segmentation is an explicit v1 non-goal — see docs/limitations).",
  },
  "tier0-emoji": {
    id: "tier0-emoji",
    description: "Tier 0: this UAX #29 grapheme cluster contains an Extended_Pictographic or Emoji_Presentation code point, so it was extracted as one atomic OTHER span (grapheme-cluster-correct, not a raw code-point count).",
  },
  "other-numeral": {
    id: "other-numeral",
    description: "Bare numeral (UAX #29 Numeric word class) — digits carry no language-specific content, so OTHER, never TAG or ENG.",
  },
  "other-punctuation": {
    id: "other-punctuation",
    description: "A UAX #29 non-word-like, non-whitespace segment (punctuation/symbols) — carries no language-specific lexical content, so OTHER.",
  },
  "other-root": {
    id: "other-root",
    description: "The root slot of a Tier-2 split resolved to a non-lexical, digit-initial form (e.g. \"2x\") — OTHER, because a Tier-2 root position is not always TAG/ENG.",
  },
  "other-paralinguistic": {
    id: "other-paralinguistic",
    description: "Matched a laughter/paralinguistic pattern (e.g. \"hahaha\") attested identically in English- and Tagalog-language internet writing — carries no language-specific lexical content, so OTHER.",
  },
  "ne-gazetteer": {
    id: "ne-gazetteer",
    description: "Exact, case-sensitive match against the closed Named-Entity gazetteer (src/core/lexicon/gazetteer.ts) — proper names in isolation opt out of the TAG/ENG axis by referent type (Universal Dependencies' own guidance), not by etymology or capitalization shape.",
  },
  "eng-wordlist": {
    id: "eng-wordlist",
    description: "Whole-token, case-insensitive match against the curated English root wordlist (src/core/lexicon/english-words.ts) — an attested English lexeme, ENG.",
  },
  "eng-root": {
    id: "eng-root",
    description: "The root slot of a Tier-2 split matched the curated English root wordlist — ENG, and the affix wrapped around it is the genuine code-switch this project exists to show.",
  },
  "tag-whole-word": {
    id: "tag-whole-word",
    description: "Whole-token, case-insensitive match against the curated Tagalog open-class root/standalone-word list (src/core/lexicon/tagalog-words.ts) — TAG.",
  },
  "tag-closed-function-word": {
    id: "tag-closed-function-word",
    description: "Exact match against the closed-class Tagalog particle/clitic/pronoun list — these are already their own space-delimited orthographic words (docs/batch2-linguistic-spec.md row 20), so Tier 1 needed zero special-casing; only the label was in question.",
  },
  "tag-respelling-normalized": {
    id: "tag-respelling-normalized",
    description: "The surface form is a listed informal respelling; normalized to its base lexeme before lookup (e.g. \"dyan\" -> \"diyan\"), which resolved to a recognized Tagalog word — TAG.",
  },
  "tag-respelling-low-confidence": {
    id: "tag-respelling-low-confidence",
    description: "The surface form is a listed respelling flagged ambiguous with a given name (e.g. lowercase \"jan\" vs the given name \"Jan\") — resolves TAG but at LOW confidence; the capitalized form routes to the NE gazetteer instead.",
  },
  "tag-native-whole-word": {
    id: "tag-native-whole-word",
    description: "A candidate Tagalog affix/circumfix matched at the edge of this token, but the extracted root resolved to a recognized NATIVE Tagalog root — per the root-language-detection ordering rule, the split is backed out and the whole token is treated as one native Tagalog word, TAG (this is the guard against mis-splitting words like \"pinagbutihan\" into three pieces).",
  },
  "tag-linker-ng": {
    id: "tag-linker-ng",
    description: "The Tagalog -ng linker clitic, MWT-split off a vowel-final host whose stem independently resolved to a recognized native Tagalog word — a general Tagalog phenomenon (Universal Dependencies already MWT-splits it), not something invented only for code-switching. Always TAG.",
  },
  "tier2-prefix-tag": {
    id: "tier2-prefix-tag",
    description: "Matched a Tagalog verbal-focus prefix (nag-/mag-/na-/ma-/i-/ipag-/pag-) at the left edge of this token, against the closed affix lexicon (src/core/lexicon/affixes.ts) — TAG.",
  },
  "tier2-circumfix-tag": {
    id: "tier2-circumfix-tag",
    description: "Matched one attachment point of a Tagalog circumfix (pinag-...-an / pinag-...-in / ka-...-an / pagka-...-an), matched as ONE two-attachment-point lexicon entry, not an independent strip — TAG.",
  },
  "tier2-suffix-tag": {
    id: "tier2-suffix-tag",
    description: "Matched a standalone Tagalog suffix (-in/-an) at the right edge of this token, against the closed affix lexicon — TAG.",
  },
  "ambiguous-nativized": {
    id: "ambiguous-nativized",
    description: "Listed as an English-etymology root that functions as a native Tagalog verb root for many speakers (e.g. \"gets\", which takes native affixation as \"nagets\") — AMBIGUOUS by design, not forced into TAG or ENG (docs/batch2-linguistic-spec.md Section 2.3 row 12).",
  },
  "ambiguous-oov-root": {
    id: "ambiguous-oov-root",
    description: "The root slot of a Tier-2 split matched a Tagalog affix at the edge, but the extracted root was found in NEITHER the Tagalog nor the English wordlist — a disclosed out-of-vocabulary recall gap (docs/limitations), defaulting to AMBIGUOUS/LOW rather than silently guessing ENG.",
  },
  "ambiguous-oov-whole-word": {
    id: "ambiguous-oov-whole-word",
    description: "This token matched no lexicon entry, gazetteer entry, or affix pattern at all — a disclosed out-of-vocabulary recall gap (docs/limitations), defaulting to AMBIGUOUS/LOW rather than silently guessing a language.",
  },
  "mixed-intraword": {
    id: "mixed-intraword",
    description: "Matched the curated MIXED-intraword fixture list (src/core/lexicon/mixed-intraword.ts) — a Tagalog perfective infix (-in-) inserted inside an English root (non-concatenative morphology). Tier 2's edge-matching lexicon structurally cannot bisect this, so it is recognized by name and kept as one token, MIXED.",
  },
} as const;

export function getRule(id: string): Rule {
  const rule = RULES[id];
  if (!rule) throw new Error(`unregistered ruleId: ${id}`);
  return rule;
}
