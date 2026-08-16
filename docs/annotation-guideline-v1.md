# halo-halo annotation guideline — v1

Dated 2026-08-16. Committed BEFORE any item in `eval/v0-set/` is labeled, per
`docs/batch2-linguistic-spec.md` Section 4.1 item 1 and binding constraint 3: "The
annotation guideline is committed to the repo, versioned, before any item is
labelled." This document transcribes the binding decision rules from
`docs/batch2-linguistic-spec.md` (the source of authority — this file restates it as a
standalone reference an annotator or a second bilingual reviewer can work from without
reading the full Linguistic Spec) and adds nothing not already ruled there.

If this guideline is ever revised, the revision gets a new version number and date, and
any annotation done under v1 stays attributed to v1 — per Section 4.1 item 1, "a
guideline revised mid-annotation... contaminates the consistency measurement."

## 1. Unit of analysis

Not "word." A two-tier token: (1) a UAX #29 word-like span (Tier 1), inside which (2) a
closed affix lexicon may split off morpheme-level sub-tokens (Tier 2). See
`docs/batch2-linguistic-spec.md` Section 1 for the full tokenization contract
(Tier 0 social pre-extraction, Tier 1 UAX #29, Tier 2 affix-lexicon MWT split). This
project's implementation is `src/core/tier0.ts` / `tier1.ts` / `tier2.ts`.

## 2. The six tags

TAG / ENG / MIXED (the Linguistic Spec's "MIXED-intraword") / NE / OTHER / AMBIGUOUS.
No tag is added or dropped — AMBIGUOUS is first-class, not a residual "unsure" bucket to
be minimized.

- **TAG** — the token/morpheme carries Tagalog grammar or lexical meaning, under the
  normalized-spelling lexicon (respellings resolve to their base lexeme before lookup).
- **ENG** — an attested English lexeme not (yet) productively taking native Tagalog
  inflection elsewhere in the corpus.
- **MIXED** — reserved for a single orthographic token carrying morphemes from both
  languages that Tier 2 structurally cannot cleanly separate (non-concatenative
  morphology — infixation — not the prefix/circumfix-at-edge cases Tier 2 already
  splits). If Tier 2 CAN split it, it is not MIXED, it is two tokens of their own
  labels.
- **NE** — proper nouns (brand, place, person, org). Per Universal Dependencies'
  guidance, proper names in isolation opt out of the TAG/ENG axis by referent type, not
  by etymology or capitalization shape.
- **OTHER** — punctuation, emoji, URLs, bare numerals, and paralinguistic/onomatopoeic
  tokens that carry no language-specific lexical content.
- **AMBIGUOUS** — the annotator, applying this guideline in good faith, cannot resolve
  the token with confidence. Always paired with a confidence flag and, where possible, a
  one-line reason. Never a silent default — it must be actively chosen (or, in the
  automated v0 pass, actively assigned by the rule engine's own OOV/nativized-root
  fallback logic, which is exactly the same discipline applied mechanically).

## 3. Confidence flags

HIGH / MEDIUM / LOW, set at labeling time, not retrofitted after seeing a disagreement.
LOW-confidence items are not curated away — a demo whose fixtures are all easy is not
honest about where the construct gets shaky (Section 4.1 item 5).

## 4. Switch-point definition

A switch point is a boundary between two adjacent leaf tokens whose labels differ,
counted ONLY over the {TAG, ENG} pair. A boundary touching OTHER, NE, AMBIGUOUS, or
MIXED is NOT a switch point. A Tier-2-internal boundary (e.g. between "nag-" and "book")
IS a switch point — see `docs/batch2-linguistic-spec.md` Section 3 for the full
reasoning and what the demo may/may not visualize or claim from this.

## 5. Twenty worked examples

The full table is `docs/batch2-linguistic-spec.md` Section 2.3, reproduced as
executable fixtures in `src/core/segmenter.test.ts` (all 20 rows) and as committed
JSONL regression data in `eval/fixtures/*.jsonl`. Six rows are the ones most likely to
trip an annotator applying this guideline for the first time, and are worth reading
before starting:

- Row 5 ("jan" vs "Jan") — capitalization-sensitive disambiguation: a respelling of
  "diyan" at LOW confidence in lowercase/particle position, but NE when capitalized in
  name position. Do not resolve this by "look up the word once" — check the surface
  form's capitalization first.
- Row 9 ("i-2x") — a Tier-2 root slot is not always TAG/ENG. It can be OTHER. Do not
  force ENG onto whatever sits in root position just because it's not obviously
  Tagalog.
- Row 12 ("gets") — AMBIGUOUS, not TAG and not ENG, even though the word is visibly
  English by spelling. A label encodes a labeling regime, not a fact about the word.
- Row 15 ("dinownload") — the flagship hard case. One token, MIXED, because the
  perfective infix -in- is inserted INSIDE the English root, not at an edge — Tier 2's
  edge-matching lexicon cannot bisect it, and forcing a split would be a fabricated
  boundary, worse than not splitting at all.
- Row 17 ("magandang bahay") — a pure-Tagalog sanity check. If a segmenter only
  behaves sensibly on mixed input and breaks on plain Tagalog, it fails a basic check.
- Row 19 ("ATM") — ENG, not NE, despite looking brand-like/capitalized. The NE/ENG line
  is drawn by referent type (a specific named entity vs. a class of thing), never by
  capitalization or shape alone.

## 6. The out-of-vocabulary recall gap (disclose, never hide)

This is a rule/lexicon system with closed, curated wordlists (`src/core/lexicon/`).
Any English root outside `english-words.ts`, or any Tagalog root outside
`tagalog-words.ts`, is NOT silently guessed at — it defaults to AMBIGUOUS at LOW
confidence, with a note naming the gap. This is a deliberate, documented design
decision (`docs/batch2-linguistic-spec.md` Section 6's "reasoning against"), not a bug.
`eval/fixtures/core-affixation.jsonl` includes a fixture demonstrating this live (an
affix attached to a root absent from both wordlists).

## 7. Single-annotator honesty (binding, restated verbatim from Section 4.2)

> "v0, single bilingual annotator (James, native), self-test-retest reliability only —
> seeking co-annotators"

This statement ships in the same breath as every kappa or accuracy number this project
publishes — repo, `/docs/limitations`, any writeup — never footnoted alone. See
`docs/batch2-linguistic-spec.md` Section 4.2's claims-ceiling table for exactly what
this can and cannot support.

## 8. Test-retest protocol (for the human annotation pass, when it happens)

Re-annotate a blind, re-shuffled, re-identified subset of at least 20% of the eval set
(or 40 items, whichever is larger) at least 7 days after the first pass (PRIMARY,
required for any reported kappa) — a same-day re-annotation is supplementary-only and
must be labeled as such if ever shown. Report Cohen's kappa PER LABEL, never only
pooled. This project's v0 set (`eval/v0-set/`) is machine-drafted (rule output + agent
review), not human-annotated, so no kappa is published from it — see
`docs/halo-halo-SPEC.md`'s honesty protocol and `docs/limitations` for the exact
upgrade path via the annotation workbench (`/annotate`).
