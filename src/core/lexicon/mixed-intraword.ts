/**
 * mixed-intraword v1 — curated list of known non-concatenative (infixed)
 * Tagalog-perfective + English-root hybrids.
 *
 * docs/batch2-linguistic-spec.md Section 1 "Explicit non-goals for v1":
 * general Tagalog infixation is out of scope for Tier 2's edge-matching
 * lexicon BY CONSTRUCTION — infixes are inserted inside a root, not at an
 * edge, so the affix lexicon (affixes.ts) structurally cannot find or
 * bisect them. Rather than mis-split or silently mislabel these, they are
 * recognized as a small, named, curated set and kept as ONE token, tagged
 * MIXED (Section 2.3 row 15's flagship hard case: "dinownload").
 *
 * "pinost" is cited directly from docs/PRIOR-ART.md's summary of the
 * CalamanCy-adjacent paper (row 7), which calls out "pinag-submit,"
 * "mag-download," and "pinost" as morphologically blended forms — pinost =
 * p<in>ost, the same -in- perfective infix inserted after the first
 * consonant of the English root "post."
 */
export interface MixedIntrawordEntry {
  surface: string;
  root: string;
  gloss: string;
}

export const MIXED_INTRAWORD: ReadonlyMap<string, MixedIntrawordEntry> = new Map(
  [
    {
      surface: "dinownload",
      root: "download",
      gloss:
        "Tagalog perfective marker realized as the non-concatenative infix -in- inserted after the first consonant of the English root \"download\" (d<in>ownload). Tier-2 edge-matching cannot bisect this — kept as one token by design.",
    },
    {
      surface: "pinost",
      root: "post",
      gloss:
        "Same -in- infix mechanism as \"dinownload,\" inserted after the first consonant of the English root \"post\" (p<in>ost). Cited via docs/PRIOR-ART.md's summary of the row-7 CalamanCy-adjacent paper, which names this exact form.",
    },
  ].map((e) => [e.surface, e])
);
