/**
 * Demo sample texts — original compositions (no scraped content, per
 * docs/halo-halo-SPEC.md's honesty protocol), chosen to walk a visitor
 * through the hard cases docs/batch2-linguistic-spec.md Section 2.3 names,
 * not just the easy majority-TAG/majority-ENG cases. Distinct from
 * eval/v0-set/ (the ≥12-text, ~400-600-token honest eval artifact built in
 * M4) — these are illustration, not the measured set.
 */
export interface SampleText {
  id: string;
  label: string;
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: "intraword",
    label: "Intra-word switch (the whole point)",
    text: "Nag-book na ako ng grab papunta sa Jollibee, i-explain mo na lang sa kanya bukas.",
  },
  {
    id: "circumfix",
    label: "Circumfix wraps an English root",
    text: "Yung pinag-research-an namin kagabi, grabe, ang haba talaga.",
  },
  {
    id: "mixed-infix",
    label: "MIXED-intraword (can't be split)",
    text: "Dinownload ko na yung file kanina, pinost ko rin sa group chat natin.",
  },
  {
    id: "ambiguous",
    label: "AMBIGUOUS and low-confidence cases",
    text: "Gets mo ba ako? Jan ka lang maghintay, dyan sa may GCash booth, hahaha.",
  },
  {
    id: "social",
    label: "Social-text noise (URL, hashtag, emoji, numeral)",
    text: "Check niyo #OOTD ko dito bit.ly/abc123 ❤️, 365 days na kami nag-uusap everyday.",
  },
  {
    id: "sanity",
    label: "Pure-Tagalog sanity check (nothing switches)",
    text: "Maganda ang bahay nila, kain na tayo mamaya kung gusto ninyo.",
  },
  {
    id: "oov",
    label: "Out-of-vocabulary root (the disclosed recall gap)",
    text: "Nag-vlog ako kagabi tungkol sa bagong phone ko, medyo nahihiya pa ako i-post.",
  },
];
