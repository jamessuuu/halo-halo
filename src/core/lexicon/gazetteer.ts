/**
 * gazetteer v1 — closed, case-sensitive Named-Entity list.
 *
 * Source: docs/batch2-linguistic-spec.md Section 2.3 rows 6-7 (Jollibee,
 * GCash — brand names, NE per UD's own guidance that proper names in
 * isolation opt out of the TAG/ENG axis by referent type, not etymology)
 * and row 5 ("Jan" as a plausible given name, the demo's canonical
 * capitalization-sensitive disambiguation case against the "jan" respelling
 * of "diyan" in tagalog-words.ts).
 *
 * Deliberately NOT a general capitalized-word-implies-NE heuristic: row 19
 * ("ATM") is the explicit contrast case showing that capitalization/brand-
 * like shape alone must NOT trigger NE. This is a closed list, curated —
 * the NE/ENG line is drawn by referent type, checked here only against
 * known entries, not inferred from orthography.
 */
export const NAMED_ENTITIES: ReadonlySet<string> = new Set([
  "Jollibee",
  "GCash",
  "Jan",
  "Manila",
  "Makati",
  "SM",
  "Grab",
  "Lazada",
  "Shopee",
]);
