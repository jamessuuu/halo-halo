# Deviations from spec

Every divergence between `docs/halo-halo-SPEC.md` / `docs/batch2-linguistic-spec.md`
and what actually got built, with reasoning (BATCH-2-STANDARDS.md's honesty-architecture
requirement).

## M1 — `Intl.Segmenter` does not keep hyphenated compounds as one word

**Spec text (docs/batch2-linguistic-spec.md Section 1, Tier 1):** "UAX #29 default
word-boundary algorithm deliberately keeps a hyphen-joined sequence as one word — the
standard's own prose explains this is so that hyphenated compounds (for example
out-of-the-box) behave as single, search-matchable units, and there is no rule that
breaks on ASCII hyphen-minus by default."

**What was found, verified empirically against the exact mandated primitive** (Node
24's ICU-backed `Intl.Segmenter`, `granularity: "word"`):

```
$ node -e 'const seg = new Intl.Segmenter(undefined, { granularity: "word" });
for (const s of seg.segment("nag-book")) console.log(JSON.stringify(s.segment), s.isWordLike);'
"nag" true
"-" false
"book" true
```

`Intl.Segmenter` does **not** keep `"nag-book"` as one word-like segment — it splits on
the hyphen into three segments, the middle one non-word-like. The same happens for
`"out-of-the-box"` (five segments). HYPHEN-MINUS is not in Unicode's MidLetter/
MidNumLet word-break classes, so this is not an implementation quirk of V8/ICU; the
Linguistic Spec's prose claim about UAX #29's default behavior does not hold for this
character, at least not as implemented by the exact API surface (`Intl.Segmenter`) the
same spec mandates as the Tier-1 primitive.

**Why this matters:** the whole two-tier architecture depends on Tier 1 handing Tier 2 a
single, unbroken span for words like "nag-book" so Tier 2's affix-lexicon matching can
look inside it. Every hyphenated worked example (Section 2.3 rows 1, 2, 3, 9, 16) breaks
without this.

**Fix (src/core/tier1.ts, `rejoinHyphenated`):** after `Intl.Segmenter` runs, a
post-process pass re-merges any `word-like / "-" / word-like` run (repeatable, so
multi-hyphen compounds like "out-of-the-box" fully collapse) back into one Tier-1 span,
before Tier 2 ever sees it. This uses the spec-mandated primitive (`Intl.Segmenter`) and
restores the spec's *architectural intent* (a hyphenated span reaches Tier 2 whole);
it corrects only the inaccurate premise about that primitive's out-of-the-box behavior.
It does not weaken row 2's "the hyphen is a confidence booster, not a requirement" test
— `tier2.ts`'s prefix/circumfix/suffix matchers already tolerate the hyphen being
present or absent (`matchAtStart`/`matchAtEnd`), independent of this fix, so
`"i-explain"` and `"iexplain"` still resolve identically.

**Verification:** `src/core/segmenter.test.ts` — all 20 Section 2.3 worked-example rows
pass, including all five hyphenated ones, plus the unhyphenated-must-match-identically
regression for row 2. `pnpm test` output pasted in the M1 milestone report.

## M1 — three pre-existing scaffold config bugs, fixed while getting `pnpm typecheck` green

Found while running the M1 verification gate (`pnpm typecheck`) for the first time
against real source files. None of these are spec deviations — they are bugs in the
M0-committed scaffold that only surfaced once there was TypeScript source to check
against real configs. Fixed rather than worked around, since `pnpm typecheck` is a
required, non-optional gate per BATCH-2-STANDARDS.md and CLAUDE.md's stated commit
order (`typecheck`, `lint`, `test`, `build`, `e2e:smoke`, `ci:zero-functions`).

1. **`eslint-plugin-jsx-a11y` ships no type declarations**, and `eslint.config.mjs` is
   itself typechecked (it opts in via `// @ts-check`, and `tsconfig.json` includes
   `**/*.mjs`). Fixed with an ambient module shim,
   `src/types/eslint-plugin-jsx-a11y.d.ts` — copied verbatim from the identical fix
   already present in the sibling showcase project `clarifier`
   (`clarifier/src/types/eslint-plugin-jsx-a11y.d.ts`), so this is a known, precedented
   accommodation, not a new invention.
2. **`playwright.config.ts`'s `mobile-320` project had a real logic bug**, not just a
   type error: `use: { viewport: { width: 320, height: 640 }, ...devices["Desktop
   Chrome"] }` spreads `devices["Desktop Chrome"]` (which itself sets a `viewport`)
   *after* the explicit 320×640 override, so the override was silently clobbered by
   Desktop Chrome's default viewport — the 320px project would never actually have
   tested at 320px. Fixed by reordering the spread before the override: `use: {
   ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 } }`. Caught by
   TypeScript's "specified more than once" duplicate-property check, not manually
   spotted — worth noting since it means the bug would have shipped silently without
   `pnpm typecheck` in the gate.
3. **`vitest.config.ts` set `resolve: { alias }` both at the top level and, redundantly
   and with a wrong type shape, inside `test:`.** `vitest` 4.x's `InlineConfig` type
   (the `test` field) does not have a `resolve` property — resolve config lives at the
   top level of `defineConfig`, which was already correctly set. Fixed by removing the
   redundant/invalid nested `resolve` inside `test`.

## M2 — `eval/fixtures/self-retest-subset.jsonl` deferred, not fabricated

`docs/batch2-linguistic-spec.md` Section 8.3 lists `eval/fixtures/self-retest-subset.jsonl`
(pass-1 label, pass-2 label, per-item confidence, timestamp of each pass) as part of the
committed fixture set. This file is **not created in M2** because its content is, by
definition, the output of an actual human self-test-retest annotation pass — and per
`docs/halo-halo-SPEC.md`'s honesty protocol, this build ships only a machine-drafted v0
set (rule output + agent review), explicitly NOT gold, with the human annotation pass
named as the next step, not something this build performs on James's behalf. Writing
placeholder or synthetic rows into this file would fabricate the exact kind of
single-annotator evidence Section 4 exists to keep honest. Instead: the annotation
workbench (M4, `/annotate`) is built with a blind-shuffle retest mode whose export
format IS this file's schema, so a real human pass — whenever James runs it — produces
this file directly, correctly dated and versioned. No kappa is published anywhere in
this build; `docs/limitations` states this explicitly.

## M1 — narrowed scope, disclosed rather than silently cut

- **`-ng` linker recognition is gated on the stem resolving through the curated
  Tagalog lookup**, per the Linguistic Spec's own coverage-matrix admission ("-ng
  linker MWT-split only; other Tagalog-internal clitic/linker forms not exhaustively
  enumerated in v1"). This means the linker only fires when the stem is a word this
  project's small `tagalog-words.ts` lexicon already recognizes (e.g. "maganda" via its
  root "ganda") — it is not a general Tagalog morphological analyzer. Any stem outside
  the curated lexicon falls through to the normal whole-word pipeline instead of being
  linker-split, which is the conservative (never-mis-split) direction to fail in.
- **Epenthetic `-h-` insertion is modeled only for the one named hazard example**
  ("pinagbutihan" — Section 1's own prose case). `buti` + `-an` surfaces as `butihan`,
  not `butian`, via a standard Tagalog hiatus-breaking consonant; v1 lists `"butih"` as
  a second literal root form in `src/core/lexicon/tagalog-words.ts` rather than
  implementing general epenthesis rules. Disclosed here and in the lexicon file's own
  comment, not silently absorbed as if it were a general capability.
