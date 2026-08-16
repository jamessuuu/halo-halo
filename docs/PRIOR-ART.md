# Prior art — CalamanCy run-down (D2 gate)

Run FIRST, before any code in this repo, per `docs/halo-halo-SPEC.md`'s death
condition D2 and `docs/batch2-linguistic-spec.md` §8.2 constraint 9. This
file is the record of that run-down and its verdict, dated 2026-08-16.

## D2, restated

> D2 (constraint 9): the CalamanCy prior-art item ("Code-Switching Detection
> and Processing in Filipino-English Text Using CalamanCy"), when run down
> in M0, turns out to be a shipped INTERACTIVE demo of the same mechanism —
> STOP and report (positioning dead as framed). If it is a paper/model
> without a legible public demo, proceed and CITE it.

## What was checked this session

Four search passes plus one direct-fetch attempt, all live this session
(2026-08-16):

1. Exact-title search for "Code-Switching Detection and Processing in
   Filipino-English Text Using CalamanCy".
2. A second search combining the title with the ResearchGate publication ID
   (401083773).
3. `WebFetch` directly against the ResearchGate URL —
   returned **HTTP 403 Forbidden** (ResearchGate's standard bot-block; this
   matches the Linguistic Spec's own note that venue/authorship could not be
   confirmed beyond search-snippet level). Full text was not read directly
   in this session either.
4. A demo-specific search: "CalamanCy code-switching Filipino English demo
   interactive tool try it online".
5. An author-name search combining the title with "authors Tagalog 2026".
6. A Semantic Scholar search-page fetch (returned no usable result rows —
   the paper does not appear to be indexed there, or at least not
   surfaced).
7. The same battery, lighter pass, for the adjacent row 8 item
   ("Cross-Lingual Transfer Learning for Tagalog-English Code-Switched Text
   Processing", ResearchGate 404019023), since §8.2 constraint 9 names both
   rows.

## Findings

**Row 7 — "Code-Switching Detection and Processing in Filipino-English Text
Using CalamanCy" (ResearchGate 401083773).**

- What it is, per every retrieved search snippet (consistent across all four
  search passes): an experimental framework paper. Pipeline = orthographic
  normalization/tokenization tuned for Filipino morphology, THEN
  **token-level language ID via a fine-tuned multilingual BERT**, THEN
  "language-aware reintegration" into the base CalamanCy spaCy pipeline for
  downstream syntactic/semantic tasks. Evaluated on an
  "semi-supervised annotated Filipino-English corpus" (size never given in
  any retrieved snippet). Reported result: a transformer/contextual variant
  beats a static-embedding baseline by "a 14-point improvement in boundary
  F1"; attention-visualization analysis claims the transformer weights
  tokens near switch points more heavily; the paper specifically calls out
  morphologically blended forms ("nag-submit," "mag-download," "pinost") as
  a case WordPiece subword decomposition handles better than static
  embeddings.
- **This is a learned, black-box classifier (fine-tuned mBERT + WordPiece
  subwords), not a rule/lexicon system.** That is a different mechanism
  from halo-halo's Tier 0/1/2 pipeline (UAX #29 word boundaries + a
  versioned, readable affix-lexicon MWT split, zero learned components,
  every label traceable to a rule a visitor can open) even before the demo
  question is settled.
- **No interactive demo, hosted web tool, Hugging Face Space, or public code
  repository was found for this paper**, despite a search pass aimed
  directly at that question ("demo", "try it online", "interactive tool").
  Every hit across every search was the same ResearchGate listing or
  citations of it in unrelated survey papers — never a product, app, or
  playground.
- Venue, peer-review status, and author byline remain **UNVERIFIED** —
  `WebFetch` against the ResearchGate page itself was blocked (HTTP 403,
  ResearchGate's bot-block, not a content finding), and no mirror
  (Semantic Scholar, arXiv, ACL Anthology, a university repository) turned
  up in four search passes. Search snippets attribute a "February 2026"
  publication/upload date to the ResearchGate listing, but that is
  ResearchGate metadata, not confirmed peer-reviewed publication.
  This exact gap is what the Linguistic Spec already flagged (its row 7:
  "UNVERIFIED: venue, peer-review status, and author byline could not be
  confirmed beyond search-snippet level") — this session's independent
  run-down reaches the same unresolved state, not a new one, and adds the
  demo-search finding on top.

**Row 8 — "Cross-Lingual Transfer Learning for Tagalog-English Code-Switched
Text Processing" (ResearchGate 404019023).** Same category, lower priority
per the Linguistic Spec. Search snippets describe a pretrained-multilingual-
LM transfer-learning study across sentiment/NER/POS on Tagalog-English CS
text, apparently uploaded around April 2026. No author names, no venue, and
no demo surfaced in this session either. Same UNVERIFIED status as the
Linguistic Spec recorded.

## Verdict: PROCEED — cite row 7 as the nearest prior art

Neither item is a shipped interactive demo. Both are papers describing
experimental frameworks around a fine-tuned multilingual transformer
classifier, not a legible, checkable rule system, and neither has a public
demo, app, or tool a visitor could open next to halo-halo and compare by
eye. That is exactly the SPEC.md D2 branch that says "proceed and CITE it,"
not the branch that says stop.

Two things this verdict does NOT resolve, and this repo does not claim it
resolves them:

- Venue/peer-review/authorship for both ResearchGate items stay UNVERIFIED.
  `docs/limitations` and any positioning copy cite row 7 as "a ResearchGate
  listing, venue and peer review unverified" — never as a confirmed
  peer-reviewed publication, and never with invented author names.
- This does not mean halo-halo is "better" than row 7's approach. Row 7's
  own reported number (a 14-point boundary-F1 lift from a transformer over
  a static-embedding baseline) is a same-paper internal comparison, not a
  number halo-halo's rule-based v1 is benchmarked against — per the
  Linguistic Spec §4.2 claims ceiling, there is no shared benchmark between
  the two approaches, so there is nothing to claim victory over. halo-halo's
  positioning is granularity + transparency (every label traces to a
  published rule; the annotation guideline predates annotation) against a
  gap in TweetTaglish/Batayan/LinCE, credited to CALCS/UD for method — row 7
  is cited as the closest adjacent mechanism attempt, not as a baseline
  halo-halo claims to beat.

## Sources (all consulted live, 2026-08-16)

- https://www.researchgate.net/publication/401083773_Code-Switching_Detection_and_Processing_in_Filipino-English_Text_Using_CalamanCy
  (title page reachable via search snippet; direct fetch returned HTTP 403)
- https://www.researchgate.net/publication/404019023_CROSS-LINGUAL_TRANSFER_LEARNING_FOR_TAGALOG-ENGLISH_CODE-_SWITCHED_TEXT_PROCESSING
- https://arxiv.org/abs/2311.07171 (calamanCy base toolkit, Miranda,
  NLP-OSS 2023 — confirmed no code-switching component, per Linguistic Spec
  row 6, independently unaffected by this run-down)
- Semantic Scholar search (no indexed result found for the row-7 title)

This file satisfies Linguistic Spec §8.2 constraint 9's build-time half (run
the item down, record the verdict). The constraint's other half — full
resolution of venue/authorship before any *public positioning claim* ships —
is still open, stays open in `docs/limitations` and `docs/DEVIATIONS.md`,
and is James's call per the Linguistic Spec's Handoff section, not this
build's to close unilaterally.
