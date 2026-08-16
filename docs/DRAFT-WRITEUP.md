# What it takes to segment "nag-book" honestly — and why the word-boundary standard can't see it

*Draft writeup — staged for review, not published. ~800 words (`wc -w docs/DRAFT-WRITEUP.md`).*

## The finding

Unicode's word-segmentation standard, UAX #29, cannot see "nag-book" as two things. Feed
it to `Intl.Segmenter` — the same API every modern browser ships, the one this project's
own binding spec cited as proof that hyphenated compounds survive as one unit — and it
comes back as three segments: `"nag"`, `"-"`, `"book"`, the middle one flagged
non-word-like. That's not a bug in the browser. HYPHEN-MINUS simply isn't in Unicode's
MidLetter/MidNumLet word-break classes, so nothing keeps a hyphen-joined pair together
by default. I verified this directly rather than trusting the spec's prose claim:

```
$ node -e 'const seg = new Intl.Segmenter(undefined, { granularity: "word" });
for (const s of seg.segment("nag-book")) console.log(JSON.stringify(s.segment), s.isWordLike);'
"nag" true
"-" false
"book" true
```

This matters because the entire premise of halo-halo — a Taglish code-switching
segmenter that tags Tagalog-English mixing at the intra-word level, not just between
words — depends on a Tagalog verbal prefix like `nag-` and its English root `book`
reaching the labeling stage as one candidate unit. If the standard word-boundary
algorithm already splits them apart with a stray punctuation token in between, there's
no "inside a word" left to look at. The fix (a documented post-process pass in
`src/core/tier1.ts` that re-merges `word / "-" / word` runs after `Intl.Segmenter` runs)
is three lines of logic, but finding that the premise itself was slightly wrong — not
assumed, checked — is the actual finding here, and it's recorded in full in
[`docs/DEVIATIONS.md`](DEVIATIONS.md) rather than quietly patched over.

## Why this is a real gap, not a curiosity

Most Taglish tooling — TweetTaglish (LREC 2022), Batayan (ACL 2025), the CALCS shared
task tradition this project's own tagset borrows from — works at the tweet or sentence
level. None of them ask what happens *inside* a single orthographic token when a
Tagalog grammatical affix wraps around a borrowed English root. That's not a small
omission: `nag-download`, `i-explain`, `pinag-research-an` are ordinary, everyday
Taglish, not edge cases someone made up for a demo. A segmenter that only sees
word-level boundaries is structurally blind to exactly the phenomenon that makes
Taglish Taglish at the morphological level — and half the reason halo-halo runs a
second, deliberate tier (Tier 2, an affix-lexicon match against a closed, versioned
list of prefixes and circumfixes) *inside* whatever Tier 1 hands it, rather than
trusting `Intl.Segmenter` alone.

## What "honest" costs here

Two disciplines cost real engineering time and are worth naming, because they're
exactly the corners a faster build would have cut.

**Refusing to guess.** When Tier 2 strips a candidate affix and the leftover root
isn't in the maintained wordlist, the label defaults to `AMBIGUOUS` at `LOW`
confidence — never a silent guess at `ENG`. Building the eval set (16 original
Taglish texts, 438 tokens) surfaced this immediately: common everyday words like
"papunta," "kanya," "bukas" were falling into that bucket purely from thin wordlist
coverage, not genuine rarity, which would have made an honest design choice look like
a broken demo. The fix was expanding real vocabulary coverage, not lowering the bar
for what counts as "recognized" — and one item, "crash" in a tech-support sample text,
was deliberately left unfixed and recorded as a disclosed reviewed override, so the
shipped eval numbers have one real point of divergence to show instead of a
suspiciously perfect self-match.

**Refusing to fabricate agreement.** No Cohen's kappa is published anywhere on this
site. Computing one requires two independent annotation passes over blind-shuffled
items — that's what the annotation workbench at `/annotate` exists to produce, and no
human pass has run yet. The temptation to synthesize a plausible-looking number, or to
quietly repurpose the machine-drafted labels as if they were gold, was resisted at
every surface: the eval report's own JSON carries a `kappaNote` field stating this
outright, and `/eval` and `/limitations` repeat it in plain language rather than a
footnote.

## Reproduce it

```
git clone https://github.com/jamessuuu/halo-halo.git
cd halo-halo && pnpm install
pnpm test        # 79 tests, including all 20 of the Linguistic Spec's worked examples
pnpm gen:eval     # regenerates eval/results/v0-eval-report.json — deterministic
```

The 20-row worked-example table this project's tokenizer is graded against lives in
`docs/batch2-linguistic-spec.md` §2.3; the fixtures that check it are in
`src/core/segmenter.test.ts`. The hyphen-rejoin fix is in `src/core/tier1.ts`, with the
`node -e` command above reproduced in its own comment.

## What this is not

Not a claim about how Filipinos code-switch in general — one bilingual author's
composed examples aren't a population sample. Not a state-of-the-art comparison —
TweetTaglish and Batayan don't attempt this task, so there's no shared benchmark to
beat. Not a finished dataset — it's a documented method, a working demo calibrated
against a self-consistent fixture set, and an open invitation, via the workbench, for
a second annotator to help make the numbers real.
