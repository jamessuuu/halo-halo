/**
 * affixes v1 — closed, versioned lexicon of Tagalog grammatical affixes.
 *
 * Source: docs/batch2-linguistic-spec.md Section 1, Tier 2. Prefixes:
 * nag- (actor-focus, completed aspect), mag-, na-, ma-, i- (object/
 * conveyance-focus), ipag-, pag-. Circumfixes: pinag-...-an, pinag-...-in,
 * ka-...-an, pagka-...-an (locative/distributive-focus). Suffixes: -in, -an.
 *
 * This is v1 of this lexicon (docs/batch2-linguistic-spec.md Section 6:
 * "a maintained, versioned, published closed-class Tagalog lexicon"). Any
 * addition or removal is a new version, noted here.
 */

export interface Prefix {
  form: string;
  gloss: string;
}

export interface Circumfix {
  prefix: string;
  suffix: string;
  gloss: string;
}

export interface Suffix {
  form: string;
  gloss: string;
}

// Longest-prefix-first is enforced by sorting at match time (tier2.ts), not
// by list order here — "nag-" and "na-" both start with "na" and the longer
// form must win, per docs/batch2-linguistic-spec.md's implementation-order
// hazard note (Section 1, Tier 2).
export const PREFIXES: Prefix[] = [
  { form: "nag", gloss: "actor-focus, completed aspect (\"performed X\")" },
  { form: "mag", gloss: "actor-focus, contemplated/infinitive aspect" },
  { form: "ipag", gloss: "object/benefactive-focus (conveyance)" },
  { form: "pag", gloss: "nominalizing / actor-focus base" },
  { form: "na", gloss: "involuntary/completed-aspect actor-focus" },
  { form: "ma", gloss: "involuntary/potential actor-focus, or adjectival" },
  { form: "i", gloss: "object/conveyance-focus (\"i-explain mo\")" },
];

// Matched as ONE two-attachment-point lexicon entry (never as an
// independent prefix-strip then independent suffix-strip) — see the
// implementation-order hazard for "pinagbutihan" in Section 1.
export const CIRCUMFIXES: Circumfix[] = [
  { prefix: "pinag", suffix: "an", gloss: "locative/distributive-focus, completed aspect" },
  { prefix: "pinag", suffix: "in", gloss: "object-focus, completed aspect, distributive" },
  { prefix: "ka", suffix: "an", gloss: "locative/abstract-noun-forming" },
  { prefix: "pagka", suffix: "an", gloss: "abstract-noun-forming, distributive" },
];

export const SUFFIXES: Suffix[] = [
  { form: "in", gloss: "object-focus" },
  { form: "an", gloss: "locative/directional-focus" },
];
