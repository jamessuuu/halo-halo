# SPEC — halo-halo (Taglish code-switch demo + eval)

2026-08-16. Batch-2 lead slot F (strategist 56/70). Binds to
BATCH-2-STANDARDS.md AND to the Linguistic Spec at
`showcase-program/research/batch2-linguistic-spec.md` (verdict:
GO-WITH-CONSTRAINTS — all ten §8.2 constraints are BINDING acceptance
criteria, not advice; the build agent reads that file in full before M1).
Name: **halo-halo** (recorded exception, research/naming.md batch-2; NEVER
shortened to "halo"; hyphenated everywhere).

## Positioning

The first legible, interactive Taglish code-switching segmenter — live
typing, every switch point shown, every label traceable to a readable rule —
plus an honestly-annotated eval set whose METHOD is published before its
numbers. Methodology lineage credited explicitly: CALCS/Solorio et al. 2014
tagset tradition + Universal Dependencies' MWT mechanism; task-granularity
gap vs TweetTaglish (tweet-level) and Batayan (no token-level tasks).

## Death conditions

- D1: the two-tier tokenizer cannot reproduce the Linguistic Spec's 15
  worked-example rulings as passing fixtures — stop and report (the
  construct fails its own examples).
- D2 (constraint 9): the CalamanCy prior-art item ("Code-Switching
  Detection and Processing in Filipino-English Text Using CalamanCy"),
  when run down in M0, turns out to be a shipped INTERACTIVE demo of the
  same mechanism — STOP and report (positioning dead as framed). If it is
  a paper/model without a legible public demo, proceed and CITE it.
- D3: any surface presenting eval numbers without their provisional/
  single-annotator flag attached AT the number.

## Architecture (per the Linguistic Spec's rulings)

1. **Two-tier tokenizer**: Tier 1 = UAX #29 word segmentation
   (Intl.Segmenter); Tier 2 = affix-lexicon MWT splitting INSIDE Tier-1
   spans (UD-precedented) so "nag-book" → [nag- TAG-affix][book ENG-root]
   → token-level MIXED with visible internal structure. UAX #29 alone is
   structurally blind to intra-word switching — Tier 2 is the project.
2. **Six-tag set**: TAG / ENG / MIXED / NE / OTHER / AMBIGUOUS. AMBIGUOUS
   is first-class (CALCS precedent) — assimilated forms ("gets") are
   uncertainty kept IN the data, never forced into TAG/ENG.
3. **Transparent rule/lexicon segmenter (v1)** — no black-box model.
   Every label traces to a rule/lexicon entry a visitor can read; the
   demo's rule-trace panel shows, per token, exactly which rule fired.
   Known cost disclosed: OOV English roots create recall gaps — this gets
   its own fixture and its own limitations paragraph.

## Surfaces

- **Live demo**: type/paste Taglish → colored token segmentation, switch
  points marked, MIXED tokens expandable to their internal affix/root
  split; click any token → rule trace. Sample texts include the hard
  cases. Fully client-side.
- **Method page** (`/method`): the annotation guidelines (published BEFORE
  any annotation), the tagset with the worked examples, the lineage
  credits, and the claims ceiling stated plainly.
- **Eval page** (`/eval`): per-label metrics (NEVER pooled kappa — pooled
  headline numbers are banned by the Linguistic Spec), each number
  carrying its provenance flag.
- **Annotation workbench** (`/annotate`): the tool for the human
  annotation pass — keyboard-first token tagging against the guidelines,
  per-item confidence, blind-shuffle test-retest mode that computes
  per-label self-agreement kappa. This is a real product surface: it is
  how the v0 set gets made and how anyone else could replicate the method.

## The eval set — honesty protocol (BINDING)

The build ships a **machine-drafted, provisional v0 set** (rule output +
agent review), labeled `"annotator": "draft-automated"` on every item and
every derived number — it is NOT gold and every surface says so. The
upgrade path is a human annotation pass by the bilingual author via the
workbench (guidelines-first, test-retest kappa per-label, per-item
confidence), which the README lists as the explicit next step with its
protocol already published. Claims ceiling: a documented method + a
calibrated demo; NO population claims, NO SOTA comparisons, NO
"first Taglish dataset" claims (TweetTaglish/Batayan exist and are cited).

## Verification plan

- Unit: tokenizer Tier 1+2 against ALL 15 worked-example fixtures (D1
  gate); rule engine (each rule has at least one positive + one negative
  fixture); metrics math (per-label kappa on synthetic agreement matrices
  with known answers).
- e2e (Playwright): demo renders + segments the sample texts to expected
  outputs; rule-trace panel; workbench keyboard flow; 320px; a11y
  walkthrough; client-side-only network assertion.
- CI green ON ACTIONS post-publication.

## Milestones

M0 scaffold + copy THIS spec and the Linguistic Spec into the repo
(docs/) + CalamanCy run-down (D2 gate; record findings in
docs/PRIOR-ART.md with the verdict).
M1 two-tier tokenizer + 15 worked-example fixtures green (D1 gate).
M2 rule/lexicon segmenter + rule-trace engine + OOV disclosure fixture.
M3 demo UI (live typing, coloring, MIXED expansion, trace panel, a11y).
M4 annotation workbench + guidelines page + machine-drafted provisional
v0 set (~400-600 tokens across ≥12 real-register sample texts the builder
composes as ORIGINAL Taglish — social/chat register, no scraped content)
+ eval harness computing per-label metrics with flags.
M5 method/eval/limitations pages + README (real numbers, flagged) +
docs/DRAFT-WRITEUP.md (finding-first: "what it takes to segment 'nag-book'
honestly — and why the word-boundary standard can't see it") +
DEVIATIONS.md + brand (house kit; the name's cultural note on the landing
page, one sentence, no kitsch).

## Limitations page must state

Single-annotator-protocol v0 with machine-drafted labels pending the human
pass; rule-based recall gaps on OOV roots; register bias of composed
samples; what the demo may NOT be used to claim (per the Linguistic Spec's
claims ceiling, restated verbatim).
