<img src="public/brand/lockup.svg" alt="halo-halo" height="56" />

The first legible, interactive Taglish code-switching segmenter — every switch point
shown, every label traceable to a readable rule, at the token level AND the intra-word
level (`nag-book` → `nag-` TAG, `book` ENG). No learned model. No black box.

Zero server compute at any traffic. Nothing you type ever leaves your device — there
is no API route in this app at all.

## What it does

Most code-switching tools work at the sentence or tweet level. halo-halo tags
Tagalog-English code-switching at the **token and intra-word level** — including
affixes like `nag-`/`i-`/`pinag-...-an` attached to English roots — using a six-label
scheme (`TAG` / `ENG` / `MIXED` / `NE` / `OTHER` / `AMBIGUOUS`) adapted from the CALCS
code-switching tagset (Solorio et al., 2014) and Universal Dependencies' multi-word-
token mechanism. It extends the granularity gap left by TweetTaglish (LREC 2022,
tweet-level mixing proportion) and Batayan (ACL 2025, sentence-level Taglish sentiment/
toxicity only) rather than reproducing either. Full lineage credits and the exact
claims boundary: [`/method`](https://halo-halo-coral.vercel.app/method).

The segmenter is a transparent rule/lexicon baseline — every label the demo produces
traces, in the UI's rule-trace panel, to one of the rules committed in
[`src/core/rules.ts`](src/core/rules.ts). No neural component, nothing unexplainable.

## Try it

- [`/`](https://halo-halo-coral.vercel.app/) — the live demo. Type or paste Taglish; every
  token gets colored by its tag, intra-word splits expand on click, and clicking any
  token opens its rule trace.
- [`/method`](https://halo-halo-coral.vercel.app/method) — the tagset, worked examples,
  lineage credits, and the exact claims ceiling.
- [`/eval`](https://halo-halo-coral.vercel.app/eval) — the current numbers, every one flagged
  `draft-automated`.
- [`/annotate`](https://halo-halo-coral.vercel.app/annotate) — the keyboard-first annotation
  workbench: per-item confidence, blind-shuffle test-retest, per-label Cohen's kappa.
- [`/limitations`](https://halo-halo-coral.vercel.app/limitations) — what this tool cannot
  know, where every number comes from, what was not measured.

## Honesty, up front

This project ships a **machine-drafted, provisional v0 eval set** — rule output
reviewed once by the builder — labeled `draft-automated` on every item and every
derived number. It is **not gold**. The upgrade path is a real human self-test-retest
annotation pass by the bilingual author (James, native), via the workbench at
`/annotate` — that pass has not happened yet, and no kappa number is published
anywhere on this site until it does. See
[`docs/batch2-linguistic-spec.md`](docs/batch2-linguistic-spec.md) (the binding
Linguistic Spec, verdict GO-WITH-CONSTRAINTS) and
[`docs/DEVIATIONS.md`](docs/DEVIATIONS.md) (every divergence between spec and reality,
with reasoning) for the full picture.

## Measured numbers (with the command that produced them)

```
$ pnpm test
 Test Files  5 passed (5)
      Tests  79 passed (79)
```

```
$ pnpm e2e:smoke
  22 passed (5.5s)
```

```
$ pnpm gen:eval
gen-eval-report: wrote eval/results/v0-eval-report.json
  (16 texts, 438 leaves, 1 reviewed override(s) applied)
```

From the committed [`eval/results/v0-eval-report.json`](eval/results/v0-eval-report.json)
(regenerate with `pnpm gen:eval` — deterministic, verified byte-identical across
repeated runs):

| Metric | Value |
|---|---|
| Boundary-F1 (n = 95 gold switch points) | precision 100.0%, recall 97.9%, F1 98.9% |
| Per-label token accuracy (never pooled) | TAG 100.0% (n=317), ENG 98.2% (n=56), MIXED 100.0% (n=3), NE 100.0% (n=5), OTHER 100.0% (n=56), AMBIGUOUS 100.0% (n=1) |
| Self-test-retest kappa | **not available** — requires a real human pass via `/annotate`, which has not run |

These numbers measure whether the current rule engine reproduces its own **reviewed**
v0-set labels (a regression/consistency check across code changes) — not accuracy
against independently-verified gold, and not inter-annotator agreement. Full framing:
[`/eval`](https://halo-halo-coral.vercel.app/eval).

## Quickstart

```bash
git clone https://github.com/jamessuuu/halo-halo.git
cd halo-halo
pnpm install
pnpm build && node scripts/serve-out.mjs
# open http://localhost:4173
```

## Development

```bash
pnpm install
pnpm dev              # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test              # unit + fixture suites (src/**/*.test.ts, eval/fixtures.test.ts)
pnpm gen:eval           # regenerate eval/results/v0-eval-report.json (deterministic)
pnpm build && pnpm e2e:smoke   # e2e against the real static export
pnpm ci:zero-functions  # verifies the build emits zero server functions
pnpm ci:brand-check     # verifies public/brand/ matches scripts/brand.mjs
pnpm ci:eval-check      # verifies eval/results/ matches the live segmenter
```

See [`docs/halo-halo-SPEC.md`](docs/halo-halo-SPEC.md) for the binding project spec,
[`docs/batch2-linguistic-spec.md`](docs/batch2-linguistic-spec.md) for the binding
Linguistic Spec (the construct-validity gate this project passed
GO-WITH-CONSTRAINTS), and [`docs/annotation-guideline-v1.md`](docs/annotation-guideline-v1.md)
for the annotation guideline — committed before any item in the eval set was labeled.

## Prior art

Nearest neighbors and how halo-halo differs from each: TweetTaglish (tweet-level
mixing proportion, not token-level), Batayan (sentence-level sentiment/toxicity, no
segmentation task), LinCE (Tagalog-English is not one of its four covered pairs), and
a ResearchGate listing on a fine-tuned mBERT classifier for the same language pair
(venue/authorship unverified — see [`docs/PRIOR-ART.md`](docs/PRIOR-ART.md) for the
full run-down). Full table: [`/method`](https://halo-halo-coral.vercel.app/method).

## License

Code is MIT (see [`LICENSE`](LICENSE)). Brand assets under `public/brand/` are ©
James Lorenz Santos, all rights reserved, and are not covered by the code license.
The Taglish sample texts under `eval/v0-set/` are original compositions written for
this project and carry the same MIT license as the code.

---

Part of the [Agent James](https://agentjames.vercel.app) portfolio.
