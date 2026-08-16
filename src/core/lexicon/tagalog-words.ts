/**
 * tagalog-words v1 — closed-class function words + a curated open-class
 * root wordlist, plus the respelling-normalization table.
 *
 * Source: docs/batch2-linguistic-spec.md Section 1 ("a maintained, sourced,
 * versioned open-class Tagalog and English wordlist for root lookup") and
 * the worked examples in Section 2.3 (rows 4, 5, 13, 16, 17, 20 name
 * specific lexemes this list must contain: dyan/jan/diyan, ng, na, grabe,
 * ganda, bahay, order-adjacent function words). This is a curated v1 list,
 * not exhaustive — the OOV recall gap this implies is disclosed on
 * /docs/limitations, per Section 6's "reasoning against" paragraph.
 *
 * CLOSED_FUNCTION_WORDS: particles/clitics/determiners that are already
 * their own space-delimited orthographic words (row 20: "na/pa/ba/naman are
 * already separate orthographic words... Tier 1 handles their boundaries
 * with zero special-casing — the open question was always their label").
 * OPEN_ROOTS: a curated set of common Tagalog lexical roots, including the
 * ones the worked examples name.
 */

export const CLOSED_FUNCTION_WORDS: ReadonlySet<string> = new Set([
  "na",
  "pa",
  "ba",
  "naman",
  "ng",
  "ang",
  "mga",
  "sa",
  "ay",
  "at",
  "kung",
  "dahil",
  "para",
  "kasi",
  "pero",
  "may",
  "mayroon",
  "wala",
  "yan",
  "ito",
  "iyon",
  "iyan",
  "ako",
  "ikaw",
  "ka",
  "siya",
  "kami",
  "tayo",
  "kayo",
  "sila",
  "mo",
  "ko",
  "niya",
  "namin",
  "natin",
  "ninyo",
  "nila",
  "kanya",
  "akin",
  "iyo",
  "atin",
  "kanila",
  "hindi",
  "oo",
  "opo",
  "po",
  "diyan",
  "dito",
  "doon",
  // Common time/deictic adverbs — closed-class enough in practice that a
  // small curated set covers the great majority of casual-register usage.
  "bukas",
  "kahapon",
  "kanina",
  "ngayon",
  "mamaya",
  "araw-araw",
]);

/**
 * Open-class Tagalog roots — the pieces Tier 2 looks up once an affix or
 * circumfix has been tentatively stripped, and what determines whether a
 * stripped word "backs out" of a split (Section 1's "root-language
 * detection must run between the two strips": a native root means the
 * whole span stays ONE token instead of being split).
 */
export const OPEN_ROOTS: ReadonlySet<string> = new Set([
  "ganda", // maganda = ma- + ganda (row 17)
  "buti", // pinagbutihan = pinag- + buti + -an (Section 1 hazard example)
  // "butih" is NOT a separate root — it is "buti" plus the epenthetic
  // hiatus-breaking -h- Tagalog inserts before a vowel-initial suffix
  // (buti + -an -> butihan). v1 models this ONLY as a second listed form
  // for this one named hazard example (docs/batch2-linguistic-spec.md
  // Section 1's "pinagbutihan" prose case) rather than a general
  // epenthesis rule — a disclosed, deliberate simplification, not a
  // silent gap (see docs/limitations).
  "butih",
  "bahay", // row 17
  "saya", // grabe ang saya (row 13's example sentence) — also lets "masaya" resolve via ma- backout
  "kain",
]);

/**
 * Standalone whole-word Tagalog lexical items not decomposed by Tier 2 at
 * all (no affix pattern applies; looked up directly). "grabe" is the row 13
 * contrast case against "hahaha" (row 14, OTHER paralinguistic). Expanded
 * past the worked-example minimum with common, everyday, casual-register
 * vocabulary (curated by the bilingual author, James — a native speaker,
 * per the Linguistic Spec's own framing) so ordinary Taglish sentences
 * don't fall to AMBIGUOUS just from thin coverage. Still deliberately not
 * exhaustive — /limitations names the recall gap this implies.
 */
export const WHOLE_WORDS: ReadonlySet<string> = new Set([
  "grabe",
  "yata",
  "lang",
  "talaga",
  "sige",
  "papunta",
  "pumunta",
  "punta",
  "trabaho",
  "pamilya",
  "kaibigan",
  "gusto",
  "ayaw",
  "pwede",
  "dapat",
  "siguro",
  "tapos",
  "alam",
  "tao",
  "oras",
  "pera",
  "salamat",
  "ingat",
  "tulog",
  "kanta",
  "laro",
  "aral",
  "presyo",
  "bayad",
  "libre",
  "mahal",
  "mura",
  "bago",
  "luma",
  "mabuti",
  "masama",
  "araw",
  "gabi",
  "umaga",
  "hapon",
  "linggo",
  "buwan",
  "taon",
  "sabi",
]);

/** OPEN_ROOTS union WHOLE_WORDS — recognized as a standalone Tagalog word. */
export const TAGALOG_STANDALONE: ReadonlySet<string> = new Set([...OPEN_ROOTS, ...WHOLE_WORDS]);

/** Everything recognized as native Tagalog, for the Tier-2 root-language
 * backout check (Section 1: "root-language detection must run between the
 * two strips"). */
export const TAGALOG_NATIVE: ReadonlySet<string> = new Set([
  ...OPEN_ROOTS,
  ...WHOLE_WORDS,
  ...CLOSED_FUNCTION_WORDS,
]);

/**
 * Respelling normalization — informal/respelled orthography resolves to its
 * base lexeme BEFORE lookup (Section 1: "respellings resolve to their base
 * lexeme before lookup, not as a separate tokenization step"). Each entry
 * may carry a confidence override and an ambiguity flag: row 5's "jan" is a
 * LOW-confidence respelling of "diyan" specifically BECAUSE it collides
 * with the given name "Jan" — flagged here so tier2.ts can route a
 * capitalized surface form to the NE gazetteer contrast case instead.
 */
export interface Respelling {
  base: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  ambiguousWithName?: boolean;
}

export const RESPELLINGS: ReadonlyMap<string, Respelling> = new Map([
  ["dyan", { base: "diyan", confidence: "HIGH" }],
  ["jan", { base: "diyan", confidence: "LOW", ambiguousWithName: true }],
  ["kmusta", { base: "kumusta", confidence: "MEDIUM" }],
  ["kumusta", { base: "kumusta", confidence: "HIGH" }],
]);

/**
 * Nativized English-etymology roots that function as native Tagalog verb
 * roots for a large share of speakers (row 12: "gets" — visibly English in
 * spelling/etymology but takes native affixation productively, e.g.
 * "nagets"). AMBIGUOUS by design (Linguistic Spec Section 2.3 row 12), not
 * TAG and not ENG — this is exactly the class Section 4.2's claims-ceiling
 * table warns is one annotator's regime, not a fact.
 */
export const AMBIGUOUS_NATIVIZED: ReadonlyMap<string, string> = new Map([
  ["gets", "English-root-nativized: visibly English in etymology/spelling but functions as a native Tagalog verb root (takes native affixation, e.g. \"nagets\"); many speakers do not experience using it as switching."],
]);

/**
 * Paralinguistic/onomatopoeic tokens (row 14: "hahaha") — carry no
 * language-specific lexical content, so OTHER, not TAG or ENG.
 */
const LAUGHTER = /^(?:ha|he|ah|aha){2,}h?$/i;
export function isParalinguistic(word: string): boolean {
  return LAUGHTER.test(word);
}
