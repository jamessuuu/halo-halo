# Linguistic Spec -- halo-halo (Taglish code-switching segmentation demo + eval set)

Computational Linguist. Gates the halo-halo candidate build under BATCH-2-STANDARDS.md.
Binding rule in force: the annotation scheme exists before any UI work; the eval is the
artifact, the demo illustrates it.

## VERDICT -- one line

GO-WITH-CONSTRAINTS. The construct (token- and intra-word-level Taglish language
tagging) is real, has a citable methodology lineage, and fills a genuine, verifiable gap.
It fails without the ten binding constraints in Section 8.2 -- most importantly: a
six-tag label set that keeps AMBIGUOUS, a rule/lexicon (not black-box) v1 segmenter, a
single-annotator claims ceiling stated in the same breath as every number, and a
positioning sentence that credits CALCS (Solorio et al. 2014) and Universal Dependencies
for the method, not just TweetTaglish and Batayan for the task gap.

## Executive summary -- the Linguistic Spec table

| Unit of analysis | Segmentation rule + source standard | Annotation scheme + source | Metric | Claim supported | Claim NOT supported |
|---|---|---|---|---|---|
| Two-tier token: (1) UAX #29 word-like span, (2) intra-word morpheme span split off a closed Tagalog-affix lexicon | Tier 0 regex pre-extraction (precedent: ark-tweet-nlp Twokenize), then Tier 1 UAX #29 default word boundaries (unicode.org/reports/tr29/), then Tier 2 multi-word-token split on affix match (precedent: UD MWT mechanism, universaldependencies.org/u/overview/tokenization.html) | Six tags: TAG / ENG / MIXED-intraword / NE / OTHER / AMBIGUOUS, adapted from the CALCS shared-task tagset (Solorio et al. 2014, aclanthology.org/W14-3907/) and the UD Lang / Foreign=Yes / OrigLang mechanism (universaldependencies.org/foreign.html) | Boundary-F1 (primary, n printed) plus per-label token accuracy/confusion (secondary, never pooled) | A documented, versioned method exists for tagging Taglish at token and intra-word granularity, calibrated against a self-consistent fixture set | Population claims about Filipino or Taglish speakers in general; SOTA or "beats TweetTaglish/Batayan" comparisons; a claim this label set is the one correct scheme rather than the regime of one bilingual annotator |

---

## 0. Scope of this gate

No halo-halo repository, code, or fixture exists on this machine yet (confirmed via
Glob/Grep/directory listing across C:\Users\admin and the showcase-program tree: nothing
under that name, and no prior Linguistic Spec or vault note mentions it). That is correct,
not a gap in this review -- it is the binding rule working as intended. Doctrine 3's
obligation to check text-handling code against fixtures therefore becomes a forward
obligation on the builder: before merge, grep the actual implementation for the patterns
split(, .length, normalize(, array-spread string iteration, and any hand-rolled regex
word class, and diff the result against Section 1 of this spec. ondevice-ml-engineer and
qa-engineer inherit that check explicitly (see Section 8.3).

The one piece of prior, adjacent work on this machine is
C:\Users\admin\showcase-program\research\phase2-linguistic-spec.md (clarifier, a
semantic-similarity notes tool), which already flagged Taglish as an unstable region for
sentence-embedding cosine similarity and specified a 15-20 item code-switch-taglish.json
fixture. That finding is about a different construct (semantic similarity, not
segmentation) and is not reused here directly, but its skepticism toward Taglish
cosine-similarity claims and its committed-fixture pattern are a direct precedent for the
discipline imposed below.

---

## 1. Unit of analysis + tokenization contract

Ruling: the unit of analysis is not "word." It is a two-tier token defined by a
three-stage pipeline. Stating it as word-level tagging anywhere on the page would be the
doctrine-3 bug this program has already been warned about once in this repo
(phase2-linguistic-spec.md), recurring here on a different construct because the bug
recurs by default, not because anyone repeated it on purpose.

### Tier 0 -- social pre-extraction (before any word-boundary rule runs)

Regex-extract, as atomic OTHER-tagged spans, before Tier 1 touches the string: URLs,
at-mentions, hashtags, and emoji sequences (as UAX #29 grapheme clusters, not code points
or UTF-16 units -- see below). Precedent: this is the standard social-text
pre-tokenization pattern from ark-tweet-nlp / Twokenize (OConnor, Gimpel, Mills, Owoputi;
CMU ARK -- ark.cs.cmu.edu/TweetNLP, github.com/brendano/ark-tweet-nlp), cited here for the
engineering pattern only -- it is English-only and has no Taglish awareness itself. Reason
this must run first: UAX #29 word-boundary rules were never designed for URL syntax and
fragment it unpredictably on the characters period, slash, hyphen, question mark, equals;
handing a URL to Tier 1 unprotected is a guaranteed, silent, demo-visible bug.

Grapheme-cluster rule (binding wherever the UI shows any character or emoji count): use
UAX #29 grapheme-cluster boundaries (unicode.org/reports/tr29/, rules GB9 -- no break
before Extend or ZWJ -- and GB11 -- an Extended_Pictographic followed by Extend-star then
ZWJ then another Extended_Pictographic stays fused as one cluster). A heart emoji written
as base plus variation selector (U+2764 U+FE0F) is two code points and must still count
as one visible unit; a raw length property in JS returns 2 and is wrong for this purpose;
even array-spread iteration, which fixes UTF-16 surrogate pairs, is not sufficient for
combining marks or ZWJ sequences -- only a UAX #29-conformant grapheme segmenter is. This
is the exact failure mode doctrine 3 names, surfacing again on a new surface.

### Tier 1 -- UAX #29 outer tokenization

Apply UAX #29 default word-boundary rules (unicode.org/reports/tr29/) to whatever Tier 0
left behind -- in practice, an Intl.Segmenter word-granularity call or an equivalent
UAX #29-conformant library such as ICU BreakIterator. Intl.Segmenter is locale-sensitive
and exposes an isWordLike boolean per segment (confirmed via MDN), which is what
separates actual word-like tokens from interstitial whitespace or punctuation spans.

The load-bearing finding in this section: UAX #29 default word-boundary algorithm
deliberately keeps a hyphen-joined sequence as one word -- the standard own prose
explains this is so that hyphenated compounds (for example out-of-the-box) behave as
single, search-matchable units, and there is no rule that breaks on ASCII hyphen-minus by
default. Consequence for this project specifically: Tier 1 alone cannot see nag-book,
i-explain, or pinag-research-an as anything other than one opaque word each. A segmenter
that stops at Tier 1 -- which is what "just use Intl.Segmenter" would silently produce --
is blind to the exact phenomenon the demo exists to show. This must be stated on the page
(Section 8.4) or the first specialist who types a hyphenated example into the demo and
inspects the rule trace will find the gap unassisted, which is the worst way for it to
surface.

### Tier 2 -- intra-word split (the affix layer)

Inside a Tier-1 word-like span that matches a closed, versioned lexicon of Tagalog
grammatical affixes at a word edge -- prefixes such as nag- (actor-focus, completed
aspect: roughly "performed X"), mag-, na-, ma-, i- (object/conveyance-focus, common in
imperative Taglish borrowings such as "i-explain mo"), ipag-, pag-; circumfixes such as
pinag-...-an, pinag-...-in, ka-...-an, pagka-...-an (locative/distributive-focus);
suffixes -in, -an -- split into multiple syntactic tokens attached under the one
orthographic Tier-1 span. Precedent for the mechanism, not just the idea: Universal
Dependencies already does exactly this for other languages -- its Multi-Word Token (MWT)
architecture splits one surface token into several syntactic word tokens (canonical
example: Spanish "damelo" into "da" + "me" + "lo"), and the existing UD Tagalog treebanks
(UD_Tagalog-TRG, Samson 2018; UD_Tagalog-Ugnayan, Aquino and de Leon 2020; UD-NewsCrawl,
arXiv:2505.20428) already MWT-split the -ng linker clitic on vowel-final hosts. Tier 2 for
halo-halo is the same mechanism applied to a different, and until now unattempted, split:
a Tagalog affix glued to a non-Tagalog root.

Implementation-order hazard worth naming even though it is not itself a labeling call: a
circumfix like pinag-...-an must be matched as one lexicon entry with two attachment
points, not as an independent prefix-strip followed by an independent suffix-strip --
otherwise a pure-Tagalog word like "pinagbutihan" (pinag- + buti + -an, no English root
at all) risks being torn into three pieces by a strip-independently implementation when
it should not be split at all outside a genuine code-switch context. Root-language
detection must run between the two strips, not after both.

Ordering rule: a Named-Entity/gazetteer check (capitalization plus a maintained
brand/place list) runs before Tier 2 affix matching, not after -- otherwise a
token-initial capitalized string that happens to resemble an affix pattern can be wrongly
offered to the affix lexicon. Tier 2 never fires on a token that has already matched NE.

### Explicit non-goals for v1 (name the boundary, do not silently mishandle it)

- General Tagalog infixation (-um-, -in- inserted inside a root, not at an edge) is out
  of scope for Tier 2 edge-matching lexicon by construction -- see the MIXED-intraword
  ruling in Section 2 for how these cases are handled instead of silently mis-split. This
  is independently corroborated as a genuinely hard problem, not just an implementation
  shortcut: PACUTE (Montalan, Africa, Layacan, Flores, De Leon, Gamboa; submitted to
  EMNLP 2026, not yet peer-reviewed, arXiv:2606.15144) is a 4,600-item diagnostic
  benchmark built specifically because infixation and reduplication are where Filipino
  morphological understanding breaks down -- for monolingual Filipino, with no
  code-switching involved at all.
- Reduplication ("kaka-book" style intensifiers) is out of scope for the same reason.
- Hashtag-internal segmentation (turning "#kainanatin" into kain + na + tatin) is
  explicitly out of scope for v1; a hashtag is kept as one Tier-0 OTHER span, unsegmented
  internally. Re-segmenting concatenated, undelimited, uncased text is a materially
  harder problem (word segmentation under total ambiguity, the same class of problem as
  Thai or Chinese segmentation) and folding it into v1 would silently expand the
  construct being claimed.

### Coverage matrix

| Language/script | Claimed | Tested | Known break |
|---|---|---|---|
| Tagalog (monolingual) | Yes | Yes -- sanity fixture required (8.3): must segment plain Tagalog correctly before it is trusted on mixed input | -ng linker MWT-split only; other Tagalog-internal clitic/linker forms not exhaustively enumerated in v1 |
| English (monolingual, in Taglish context) | Yes | Yes | Out-of-vocabulary English roots (rare slang, new borrowings, typos) fall to AMBIGUOUS/low-confidence by design (Section 6), not silently to ENG |
| Taglish (intra-sentential, inter-word) | Yes | Yes | Constituent-insertion vs smooth-switch distinction (Bautista 2004) is not encoded -- labels mark where language differs, not what kind of switch it linguistically is |
| Taglish (intra-word: affix + foreign root) | Yes -- this is the demo actual claim | Yes, for prefix/circumfix-at-edge cases only | Infixed and reduplicated hybrids ("dinownload") are not split -- see MIXED-intraword, Section 2 |
| Respelled/informal orthography (dyan/jan, kmusta) | Yes | Yes | Normalization lexicon is finite and versioned; a respelling not yet in it defaults to low-confidence, not silently to the wrong language |
| Emoji / URLs / hashtags (social text) | Yes | Yes | Hashtag-internal text unsegmented (see non-goals); emoji ZWJ sequences require a real UAX #29 grapheme segmenter, not a raw length count |
| Cebuano/Bisaya and other Philippine languages; Tagalog-Bisaya-English trilingual switching | Not claimed | Not tested | Real and common outside Metro Manila (Bautista frames Taglish itself as an educated, urban, Manila-centric register) -- a token from another Philippine language is forced into AMBIGUOUS or misread as ENG/OTHER; the page must not imply national coverage |
| Chavacano (Spanish-lexified Philippine creole) | Not claimed | Not tested | Sometimes conflated with Taglish by non-specialists; out of scope entirely, worth one explicit disclaimer line to preempt the confusion |
| RTL scripts, CJK, Thai/Lao/Khmer | Not claimed | N/A | Irrelevant to this construct (Tagalog and English are both LTR Latin-script) -- named only so the coverage matrix is not silently read as handling anything |

---

## 2. Label set

### 2.1 Six tags, not five -- and not more

TAG / ENG / MIXED-intraword / NE / OTHER / AMBIGUOUS.

The brief itself proposed a five-tag starting point (TAG / ENG / MIXED-intraword / NE /
OTHER). AMBIGUOUS is added back in over that suggestion, deliberately, against the
brief own proposed minimum, for a specific reason: the CALCS shared-task tradition
(Solorio et al. 2014, aclanthology.org/W14-3907/) keeps AMBIGUOUS as a first-class tag in
its six-tag scheme (lang1, lang2, mixed, ne, ambiguous, other) precisely because a forced
binary choice under genuine uncertainty is where inter-annotator agreement collapses in
this literature. Doctrine states it plainly: if no guideline could be written that two
people would apply to the same text with measurable agreement, it is not a measurement.
Dropping AMBIGUOUS does not make the hard cases go away, it just forces them into TAG or
ENG silently, which converts a real uncertainty into a false-confidence data point -- the
opposite of construct validity. See row "gets" in Section 2.3 for the worked case this
protects.

No tag is added beyond CALCS six-tag lineage. A temptation exists to add a
"loanword" tag distinct from AMBIGUOUS, or to split OTHER into "emoji" / "punctuation" /
"url" -- both are rejected here as unnecessary: CALCS own definition of "other" names
"smileys, punctuations, etc." directly, and a nativized-loanword axis is exactly what
AMBIGUOUS plus a confidence flag (Section 4) already covers without adding a seventh
category nobody could reliably apply either. The smallest construct-valid set is six, not
five and not eight.

### 2.2 Decision rules per tag (summary; full worked cases in 2.3)

- TAG: the token, or Tier-2 morpheme, carries Tagalog grammar or lexical meaning, under
  the normalized-spelling lexicon (respellings resolve to their base lexeme before
  lookup, not as a separate tokenization step -- see Section 1).
- ENG: the token, or Tier-2 morpheme, is an attested English lexeme not (yet) productively
  taking native Tagalog inflection elsewhere in the corpus.
- MIXED-intraword: reserved for a single orthographic token carrying morphemes from both
  languages that Tier 2 structurally cannot cleanly separate -- in practice, this means
  non-concatenative morphology (infixation) rather than the prefix/circumfix-at-edge
  cases Tier 2 already splits. If Tier 2 CAN split it, it is not MIXED-intraword, it is
  two tokens of their own labels.
- NE: proper nouns (brand, place, person, org). Per Universal Dependencies own guidance
  (universaldependencies.org/foreign.html), proper names mentioned in isolation should
  generally NOT receive a foreign-language/code-switched tag at all -- they opt out of
  the TAG/ENG axis by referent type, not by etymology.
- OTHER: punctuation, emoji, URLs, bare numerals, and paralinguistic/onomatopoeic tokens
  (laughter markers, etc.) that carry no language-specific lexical content -- there is no
  fact of the matter about their language, so forcing TAG or ENG on them is invalid.
- AMBIGUOUS: the annotator, applying the guideline in good faith, cannot resolve the
  token with confidence. Always paired with a confidence flag and, where possible, a
  one-line reason (Section 4). Never a silent default -- it must be actively chosen.

### 2.3 Worked examples (20; the hard cases are the point)

| # | Input | Ruling | Why |
|---|---|---|---|
| 1 | "nag-book" | nag- = TAG (prefix), book = ENG (root) | Tier-2 prefix match at left edge; root is an unnativized English lexeme, no Tagalog phonological adaptation |
| 2 | "i-explain" | i- = TAG (prefix), explain = ENG (root) | Same mechanism; the hyphen is a confidence booster, not a requirement -- "iexplain" unhyphenated must resolve identically |
| 3 | "pinag-research-an" | pinag- = TAG, research = ENG, -an = TAG | Circumfix wraps a foreign root on both sides; must be matched as one two-attachment-point lexicon entry, not two independent strips (see 1.4 implementation-order hazard) |
| 4 | "dyan" | TAG (one token) | Respelling of "diyan" (there); normalization-before-lookup resolves the surface form to its base lexeme -- a label-layer rule, not a tokenization-layer one |
| 5 | "jan" (lowercase, particle position) | TAG, LOW confidence | Further respelling of "diyan/dyan"; ruling is context-conditioned -- capitalized "Jan" in a name slot would instead be NE. Flag this row as the demo canonical hard case for capitalization-sensitive disambiguation |
| 6 | "Jollibee" | NE | Proper noun (brand); per UD own guidance, proper names in isolation opt out of the TAG/ENG axis rather than being decided by etymology |
| 7 | "GCash" | NE | Same as above; also the ruling that brand-internal orthography (the capital-G prefix) is out of Tier-2 scope -- NE gazetteer match runs before Tier 2, so Tier 2 never tries to affix-split it |
| 8 | "365" (bare numeral) | OTHER | UAX #29 Numeric word-break class; digits are language-non-diagnostic |
| 9 | "i-2x" ("i-2x mo yan") | i- = TAG, 2x = OTHER | Shows a Tier-2 root slot is not always TAG/ENG -- it can be OTHER, and the guideline must say so rather than forcing ENG onto anything sitting in root position |
| 10 | heart emoji written as base character plus variation selector | OTHER, one grapheme cluster | UAX #29 GB9/GB11; two code points, one visible/countable unit -- a naive length-based count would see two |
| 11 | "bit.ly/abc123" (URL) | OTHER, one Tier-0 atomic span | Extracted before word-segmentation runs; UAX #29 word rules were never designed for URL syntax and would fragment it on period/slash unpredictably |
| 12 | "gets" ("Gets mo ba ako?") | AMBIGUOUS, default note ENG-root-nativized, LOW confidence | Visibly English in etymology/spelling but functions as a native Tagalog verb root (takes native affixation productively: "nagets," colloquially) -- many speakers do not experience using it as switching at all. A textbook case of a label encoding a labelling regime, not a fact |
| 13 | "grabe" ("grabe ang saya!") | TAG | Contrast case against row 14: a real Tagalog lexical item with a specific meaning (intense/excessive), not a cross-linguistic sound effect -- full confidence |
| 14 | "hahaha" | OTHER | Paralinguistic laughter marker attested identically in English- and Tagalog-language internet writing; carries no language-specific lexical content, so forcing TAG or ENG would be a construct-invalid choice with no fact of the matter behind it |
| 15 | "dinownload" (download nativized with the perfective infix inserted after the first consonant) | MIXED-intraword (one token) | Flagship hard case: the Tagalog perfective marker is realized as a non-concatenative infix, not a prefix or circumfix at a word edge, so Tier-2 edge-matching structurally cannot bisect it. Rather than force a wrong split, it stays one token, flagged as a known-hard fixture -- the single highest-value adversarial input in the set |
| 16 | "pag-order ng food" | pag- = TAG, order = ENG, ng = TAG (own token), food = ENG | Mixes intra-word switching (pag-order) with inter-word switching (food) in one fixture; disambiguates free-standing "ng" (its own token, no MWT needed) from the bound "-ng" linker in row 17 |
| 17 | "magandang bahay" (maganda + linker + bahay) | maganda = TAG, -ng = TAG (MWT-split linker), bahay = TAG | Pure-Tagalog case included on purpose: proves the MWT mechanism is a general Tagalog phenomenon UD already handles, not something invented only for code-switching -- a segmenter that only works on mixed input and breaks on plain Tagalog fails a basic sanity check |
| 18 | "#OOTD" (hashtag) | OTHER, one Tier-0 span, not internally segmented | v1 scope boundary: hashtag-internal segmentation (case-blind, delimiter-free) is a materially harder problem, explicitly out of scope (Section 1) rather than silently attempted and gotten wrong |
| 19 | "ATM" ("nasa ATM ako") | ENG, not NE | Contrast case against rows 6-7: refers to a class of machine, not a specific named entity -- the NE/ENG line is drawn by referent type, not by capitalization or brand-like shape, which both a naive gazetteer-only tagger and a naive if-capitalized-then-NE rule would get wrong |
| 20 | "na" ("kain na tayo") | TAG (already its own space-delimited token) | Settles the clitic-boundary question with a worked example: na/pa/ba/naman are already separate orthographic words in standard Filipino writing, so Tier 1 handles their boundaries with zero special-casing -- the open question was always their label, never their segmentation |

---

## 3. Switch-point definition

A switch point is a boundary between two adjacent tokens (post Tier-1 + Tier-2 split)
whose labels differ, counted ONLY over the {TAG, ENG} pair:

- TAG-to-ENG or ENG-to-TAG adjacency = a switch point.
- A boundary touching OTHER, NE, AMBIGUOUS, or MIXED-intraword is NOT counted as a switch
  point by default -- counting a boundary next to a brand name or an emoji as a "switch"
  would conflate referent-type and discourse-marker boundaries with actual bilingual
  grammatical switching, a different phenomenon. This directly reflects Bautista (2004):
  Taglish switch-point analysis is specifically about where the bilingual grammar crosses
  between the two language systems, not about every heterogeneous-token boundary in a
  post.
- A Tier-2 MWT-internal boundary (for example between "nag-" and "book") IS a switch
  point. This is the demo actual reason to exist: most code-switching tools and
  literature only surface inter-word switches; showing that intra-word switch points
  exist at all, and where, is the honest extension of granularity over prior art (Section
  7), not a claim of superseding it.

### What the demo may visualize without overclaiming

- Colour-coded token spans by label -- a phenomenon the visitor can see and a specialist
  can check against the published rule table. This is the core, defensible visual.
- Switch-point markers between TAG/ENG-labelled adjacent tokens only, using the neutral-
  boundary rule above -- copy must say "switch points between Tagalog- and
  English-labelled tokens," not "all code-switches," a subtly broader and false claim.
- A per-sentence switch-point COUNT, since a visitor can recount it by eye against the
  visualization.
- Per-token confidence/flag indicators (Section 4) -- showing where the tool itself is
  unsure is more trustworthy than hiding it, not less.

### What it may NOT visualize or claim

- No implied claim that a switch point marks a grammatical, cognitive, or sociolinguistic-
  function event. Bautista own smooth/insertion/nonce-borrowing typology is not something
  this label set distinguishes -- the demo shows WHERE labels differ, not WHY a speaker
  switched or what discourse function it served.
- No single derived "Taglish-ness" or "code-switching intensity" score presented as a
  quality or fluency judgment. This is exactly TweetTaglish own construct (a scalar
  mixing-proportion regression target) -- if any scalar ships, it must be labelled
  literally as "tag-boundary count divided by token count," with the calculation visible,
  never as an opaque score, and never described as extending TweetTaglish while quietly
  reproducing its construct under a new name.
- No accuracy number on the page without its failure mode in the same breath (Section 5)
  and without the single-annotator ceiling stated (Section 4).
- No "beats TweetTaglish" or "beats Batayan" framing -- neither does this task, so there
  is nothing to beat; the honest claim is coverage of a task gap (Section 7), not
  superiority on a shared benchmark.

---

## 4. Single-annotator honesty

### 4.1 Integrity protocol

1. Guideline before annotation, and before self-retest. Sections 1-3 above, plus the
   worked-examples table, are committed to the repo as a dated, versioned document
   (intended path: halo-halo/docs/annotation-guideline-v1.md) BEFORE a single fixture
   item is labelled. This extends the program binding rule one step further than "before
   UI work": the guideline must also predate annotation itself, because a guideline
   revised mid-annotation, informed by the annotator own in-progress judgment calls,
   contaminates the consistency measurement in step 2 below -- there is no fixed target
   left to be consistent with.

2. Self test-retest agreement. Re-annotate a blind, re-shuffled, re-identified subset of
   at least 20% of the eval set (or 40 items, whichever is larger -- kappa is unstable at
   very small n) under one of two protocols:
   - PRIMARY (required for the reported number): at least 7 days after the first pass,
     so short-term memory of specific strings has decayed.
   - SUPPLEMENTARY ONLY, never the reported number: same-day, fully reshuffled and
     re-anonymized with no visible timestamps or original order. Same-day re-annotation
     is vulnerable to working-memory recall on a small (40-80 item), highly memorable set
     -- state explicitly which protocol produced any published kappa.

3. Report Cohen kappa, not raw percent agreement, and report it PER LABEL, not only
   pooled. Raw agreement is inflated by class imbalance (TAG/ENG dominate most Taglish
   sentences by token count; two passes can agree often just by both defaulting to the
   majority label). A pooled kappa can look healthy while hiding a real problem: if
   MIXED-intraword and AMBIGUOUS -- the rare classes the entire project exists to surface
   -- disagree with themselves badly, a pooled number launders that into an average. This
   is the direct token-level analogue of doctrine 5's warning that F1 hides class
   imbalance unless the support is printed.

4. Interpretation, honestly bounded. Batayan (ACL 2025) reports Cohen kappa 0.8202 and
   Krippendorff alpha 0.8268 for its own Taglish sentiment task, with three trained
   annotators on a coarser, more balanced label space, at sentence level. That number is
   cited here only as evidence that credible IAA on Taglish social text is achievable in
   this literature -- it is NOT a pass bar for halo-halo's self-retest kappa, because the
   two measurements are not equivalent (different task, different label cardinality,
   three annotators versus one, sentence versus token granularity). Self-test-retest
   kappa measures a narrower, weaker thing: whether one person can apply their own stated
   rules consistently to themselves. It is a floor, a necessary condition for the
   guideline being followable at all -- it is not evidence a second annotator would agree.
   This distinction must be printed verbatim wherever the kappa number appears, not once
   in a footnote (BATCH-2-STANDARDS.md already binds this "never only in a footnote" rule
   program-wide; it is simply correct here too).

5. Per-item confidence flags, set by the annotator at annotation time, not retrofitted
   after seeing a disagreement. HIGH/MEDIUM/LOW. Rows 5, 9, and 12 in Section 2.3 are
   exactly the LOW-confidence class -- the fixture set must ship with its confidence
   flags visible, not curated away. A demo whose fixtures are all easy is not honest
   about where the construct gets shaky.

6. Explicit "single-annotator v0" label, everywhere a number appears: the repo README,
   the demo limits page (already a BATCH-2-STANDARDS.md MUST for every batch-2 project),
   and any writeup -- "v0, single bilingual annotator (James, native), self-test-retest
   reliability only -- seeking co-annotators," in the same breath as the number, never
   separated from it.

### 4.2 Claims ceiling

| CAN honestly support | CANNOT honestly support |
|---|---|
| "A documented, versioned method for tagging Taglish at token and intra-word granularity, with worked decision rules a second annotator could pick up" | Any population-level claim ("how Filipinos code-switch," "X% of Taglish tokens are...") -- one author's fixtures, however honest, are not a sample of a population |
| "The demo segmenter was calibrated against N fixture items, self-retest kappa = X (per label, 7-day protocol)" -- a narrowly-scoped demo-calibration claim | Any SOTA or "outperforms" comparison against TweetTaglish, Batayan, LinCE, or the CalamanCy-adjacent papers -- none of them attempt this exact task (Section 7), so there is no shared benchmark to outperform, and n=1 with no cross-annotator agreement cannot support a comparative accuracy claim regardless |
| Descriptive claims sourced to the linguistics literature (Bautista 2004's switch-type proportions, Matrix Language Frame applicability) as independently published findings | Any claim that this label set or its rulings are correct in a normative sense. Per doctrine, a label encodes a labelling regime, not the truth -- this is one Manila-raised, urban, educated-register bilingual's regime specifically (Bautista own framing of Taglish itself as that specific register). A Cebuano-Bisaya-English trilingual speaker, a different generation, or a different class register could rule several Section 2.3 AMBIGUOUS-adjacent rows differently, and the repo must say so, not imply "Taglish" is one monolithic thing this annotator fully represents |

---

## 5. Metrics

### 5.1 Token-level accuracy

Definition: proportion of tokens (post Tier-1 + Tier-2 splitting) whose predicted label
matches gold. Legible and easy to explain on a demo page -- a visitor can literally count
it by hand on a short sentence.

Failure mode, in the same breath: severe class imbalance. Most Taglish sentences are
majority-TAG or majority-ENG by token count, with MIXED-intraword/AMBIGUOUS/NE a small
minority. A trivial always-predict-majority-label baseline scores high pooled accuracy
while being useless at the one thing this project exists to show -- correctly finding
rare intra-word switches. Pooled accuracy is actively misleading as a headline number
here, one level worse than the F1-hides-imbalance warning in doctrine 5, because accuracy
does not even split by class unless explicitly reported per-label.

### 5.2 Boundary-F1

Definition: precision/recall/F1 over the set of switch-point boundaries (Section 3),
treating "is there a switch point between token i and token i+1" as a binary detection
task, scored over the positive (switch) class. This is the same framing pattern used for
word-segmentation evaluation generally (for example Chinese/Thai segmentation F1) -- not
invented for this project, borrowed from an established metric-choice pattern in
segmentation literature. It targets the actual construct (finding switch points,
especially rare intra-word ones) instead of being dominated by abundant, easy,
monolingual-run tokens.

Failure mode, in the same breath: high variance at small n (a single missed circumfix
boundary in an 18-40 item fixture set swings F1 by several points), and boundary-F1 alone
does not say WHICH label was wrong on either side of a correctly-placed boundary -- a
segmenter can get the boundary position right while mislabelling both sides (calling
"nag-" ENG and "book" TAG, backwards but boundary-correct). Must always ship with n (the
count of gold switch points) printed alongside it, exactly as doctrine 5 requires for F1
generally.

### 5.3 Decision: both, never either alone

Primary: boundary-F1 with n printed. Secondary: per-label (never pooled) token accuracy
and a confusion matrix. Neither metric alone is construct-valid for this task -- each
provably hides the other failure mode, so picking only one would repeat the exact mistake
doctrine 5 warns against rather than avoid it. Neither metric is a semantic or
comprehension judgment, neither says whether a human reader finds the segmentation
natural, and neither is comparable across label-set versions -- if a future v2 changes
the AMBIGUOUS decision rule, v1 and v2 numbers are not on the same scale, the direct
token-level analogue of "perplexity is not comparable across different tokenizers."

---

## 6. What the segmenter may be

Ruling: v1 is a transparent rule/lexicon-based baseline. No learned component. This is an
explicit architectural decision, not a default, and it is bound into this spec.

Reasoning for: (a) doctrine's preference for a phenomenon a specialist can check with
their own knowledge is satisfied only if every decision is explainable in one sentence --
"prefix nag- matched at position 0, root book not in the Tagalog lexicon, defaults to
ENG" is auditable in a way a neural black-box decision is not, and legibility is stated
as this project's actual brand. (b) Single-annotator honesty (Section 4) pairs badly with
a black-box scorer: if gold is one person's judgment AND the segmenter is opaque, neither
half of the pipeline is inspectable, and there is no way to locate WHERE a model's
internal reasoning diverges from the guideline -- only that the output disagrees, not
why, whereas a rule system's why is the rule itself. (c) The field own admission that
annotated Tagalog-English corpora are scarce (the CalamanCy-adjacent 2025 item in Section
7 names this directly) means a model trained in-house on this project own 40-80 item
single-annotator fixture set would be badly overfit or underpowered, and presenting its
output as a calibrated classifier would be a larger claims-ceiling violation than Section
4 already guards against for the eval set alone. A pretrained off-the-shelf model used
zero-shot would avoid that specific problem but reintroduce (b) -- it was never trained
against THIS guideline, so its errors are unexplainable relative to it. (d) Doctrine 8's
base-rate warning applies directly to an opaque "is this a switch point" classifier
deployed at demo scale: a rule-based system does not remove the risk of being wrong, but
it removes the opacity that turns a wrong call into an unfalsifiable one -- every miss is
diagnosable by reading the published rule table.

Reasoning against, disclosed rather than hidden: a pretrained multilingual token
classifier would likely have higher raw accuracy on the easy majority TAG/ENG-run cases
than a hand-built lexicon, simply from broader vocabulary coverage than one annotator can
maintain by hand. A lexicon-based system has a real, known recall gap on any English root
absent from the maintained wordlist -- this must be disclosed on the limits page, not
hidden, and the fixture set (Section 8.3) includes a deliberately out-of-vocabulary
example so a visitor sees this failure live rather than reading about it abstractly.

What v1 concretely is: (a) a maintained, versioned, published closed-class Tagalog
lexicon (clitics, common function words, the affix list from Section 1); (b) a
maintained, sourced, versioned open-class Tagalog and English wordlist for root lookup;
(c) the Tier-0/1/2 procedural pipeline from Section 1; (d) zero learned components. Every
label the demo produces must be traceable, in the UI itself, to the specific rule or
lexicon entry that produced it.

Path to v2, gated rather than closed off: a learned or hybrid component is not ruled out
permanently, but is explicitly gated behind (i) a larger, ideally multi-annotator corpus
existing first, since a model needs training/eval data this project does not yet have,
and (ii) an explanation layer that keeps every hybrid decision traceable to a rule or
lexicon entry even when a model is in the loop, so legibility is not lost as a side
effect of raising accuracy.

---

## 7. Prior art table (verified live; all rows fetched or searched this session)

| # | Work | Provides | Gap / honest relationship to halo-halo |
|---|---|---|---|
| 1 | TweetTaglish -- Herrera, Aich, Parde, LREC 2022. aclanthology.org/2022.lrec-1.225/, github.com/uic-nlp-lab/LREC-2022-CodeSwitch, github.com/meg2121/TweetTaglish-Dataset | 20k+ tweet dataset with a PER-TWEET (Tagalog, English, Other) proportion tuple label, plus a validated mixing-proportion regression task (R2 0.797-0.909, RMSE 0.068-0.057), confirmed via the dataset repo schema | No token-level segmentation, no intra-word/morpheme boundary marking, no switch-point definition, no published per-token annotation guideline. halo-halo extends GRANULARITY (tweet to token/morpheme); it is a different construct from the regression task, not an improved version of it |
| 2 | Batayan -- ACL 2025 Long. arxiv.org/abs/2502.14911, aclanthology.org/2025.acl-long.1509/ | An 8-task Filipino LLM benchmark; only 2 of 8 (Sentiment Analysis, Toxicity Detection) use naturally-occurring Taglish text, both at SENTENCE level, with rigorous 3-annotator IAA (Cohen kappa 0.8202, Krippendorff alpha 0.8268 for SA), confirmed via full task-list fetch | No task at token granularity anywhere in the benchmark; no LID/segmentation/switch-point task exists in it at all. halo-halo fills a structural-task gap the benchmark authors did not attempt, not a harder version of an existing Batayan task |
| 3 | LinCE -- LREC 2020. arxiv.org/abs/2005.04322, aclanthology.org/2020.lrec-1.223/, ritual.uh.edu/lince | Multi-corpus benchmark across 4 code-switched pairs (Spanish-English, Nepali-English, Hindi-English, MSA-Egyptian Arabic) times 4 tasks (LID, NER, POS, sentiment), all using the CALCS-tradition token tagset | Tagalog-English confirmed NOT one of the 4 pairs -- absent, not merely under-resourced within it. halo-halo adopts LinCE/CALCS TAGGING METHODOLOGY for a pair LinCE has never covered -- the most defensible "extends" claim available, but it extends CALCS/LinCE, not TweetTaglish/Batayan, and page copy must say so |
| 4 | CALCS shared task tagset -- Solorio et al. 2014. aclanthology.org/W14-3907/ | The field-standard six-tag scheme (lang1, lang2, mixed, ne, ambiguous, other) this spec label set is adapted from | Flat token tagging only, no MWT/intra-word split mechanism. halo-halo actual novel contribution is marrying this tagset to UD MWT mechanism for the intra-word case (row 5) |
| 5 | Universal Dependencies -- foreign-expression guidelines, MWT mechanism, UD_Tagalog-TRG (Samson 2018), UD_Tagalog-Ugnayan (Aquino and de Leon 2020), UD-NewsCrawl (arXiv:2505.20428). universaldependencies.org/foreign.html, universaldependencies.org/u/overview/tokenization.html | The Lang/Foreign=Yes/OrigLang mechanism for marking code-switched versus borrowed tokens, and the MWT one-surface-token-to-many-syntactic-tokens architecture, already applied to Tagalog for the -ng linker | No UD Tagalog treebank currently MWT-splits a Tagalog-affix-plus-English-root combination -- as far as retrieved, unattempted. The single most precise, most defensible gap halo-halo can claim to fill |
| 6 | calamanCy -- Miranda, NLP-OSS 2023 (EMNLP workshop). aclanthology.org/2023.nlposs-1.1/, arxiv.org/abs/2311.07171 | Production Tagalog spaCy pipeline: POS tagging, NER, dependency parsing, morphology, trained on TLUnified plus UD Tagalog-TRG/Ugnayan | Not a code-switching tool; no CS/LID component in the published base toolkit |
| 7 | "Code-Switching Detection and Processing in Filipino-English Text Using CalamanCy" -- ResearchGate publication ID 401083773. UNVERIFIED: venue, peer-review status, and author byline could not be confirmed beyond search-snippet level this session | Per retrieved abstract/snippets only: token-level Filipino-English LID via fine-tuned multilingual BERT plus orthographic normalization plus reintegration into calamanCy, evaluated on an unnamed-size "semi-supervised annotated" corpus | This is, on its face, the CLOSEST prior art to halo-halo's actual mechanism. If it is a real, citable, peer-reviewed paper with a public corpus, "extends TweetTaglish/Batayan" is not just incomplete, it misses the nearest neighbour. MUST be run to full text, venue, and corpus availability before any public positioning claim ships -- flagged here as a pre-publication verification task, not resolved by this spec |
| 8 | "Cross-Lingual Transfer Learning for Tagalog-English Code-Switched Text Processing" -- ResearchGate publication ID 404019023. UNVERIFIED, same caveat as row 7 | Per retrieved snippets: sentiment/NER/POS on Tagalog-English CS text via cross-lingual transfer learning | Adjacent, lower-confidence signal; same pre-publication verification obligation as row 7, lower priority |
| 9 | Bautista (2004), "Tagalog-English Code Switching as a Mode of Discourse," Asia-Pacific Education Review. files.eric.ed.gov/fulltext/EJ720543.pdf, link.springer.com/article/10.1007/BF03024960 | Sociolinguistic/descriptive foundation: switch typology (roughly 80% smooth transitions, 15% constituent insertion, nonce borrowing rare), Matrix Language Frame applicability, the "communicative efficiency" functional account | Purely descriptive/qualitative, no computational artifact or annotation scheme for NLP use -- the correct citation for WHY the Section 3 switch-point construct is linguistically grounded, not invented from nothing |
| 10 | ark-tweet-nlp / Twokenize -- OConnor, Gimpel, Mills, Owoputi; CMU ARK. ark.cs.cmu.edu/TweetNLP, github.com/brendano/ark-tweet-nlp | The standard precedent for social-text pre-tokenization (URL/mention/hashtag/emoticon extraction before word-boundary segmentation) | English-only, no Tagalog/CS awareness -- cited for the pre-tokenization ENGINEERING PATTERN only (Tier 0), not for language coverage |
| 11 | PACUTE -- Montalan, Africa, Layacan, Flores, De Leon, Gamboa; submitted to EMNLP 2026, arxiv.org/abs/2606.15144. NOT YET PEER-REVIEWED | A 4,600-item diagnostic benchmark for Filipino morphological understanding (infixation, reduplication, diacritic-driven distinctions), confirmed no code-switching coverage | Monolingual Filipino only. Cited here only to independently corroborate that infixation is a genuinely hard, actively-benchmarked problem even without code-switching in the picture -- supporting evidence for the MIXED-intraword ruling (Section 2), not a competing or overlapping artifact |

---

## 8. Verdict

### 8.1 GO-WITH-CONSTRAINTS -- full reasoning

The construct passes the test that matters most: it can fail. A low self-retest kappa
(Section 4) is a real, checkable way for this project to be wrong, and the spec response
to that outcome (withhold the calibration claim, delay the demo) is already specified,
not improvised after the fact. The demo shape as briefed -- an interactive segmentation
VISUALIZATION plus a small honestly-annotated eval set, annotation-scheme-first -- is
already aimed at a visible phenomenon rather than a bare trust-me number, which is the
doctrine-9 shape this kind of project should take. That is what keeps this out of
INVALID CONSTRUCT territory: the failure modes here are about execution discipline
(dropping AMBIGUOUS for a cleaner UI, reaching for a black-box model, overclaiming the
positioning, showing only easy fixtures), not about the underlying construct being
unmeasurable or unfalsifiable. A clean VALID is withheld only because those five
temptations are specific, foreseeable, and each one individually would have shipped past
a demo that "looked" fine -- so they are bound into the spec as constraints rather than
left as advice.

### 8.2 Binding constraints (the gate conditions)

1. Two-tier tokenization contract (Section 1) is mandatory: Tier 0 social pre-extraction,
   Tier 1 UAX #29 word boundaries, Tier 2 affix-lexicon MWT split. No naive whitespace
   splitting or raw length-based counting anywhere in the build; grapheme-cluster-safe
   counting anywhere a character or emoji count is shown.
2. The six-tag label set (TAG/ENG/MIXED-intraword/NE/OTHER/AMBIGUOUS) is mandatory as
   specified. AMBIGUOUS may not be dropped for a cleaner-looking UI.
3. The annotation guideline is committed to the repo, versioned, before any item is
   labelled. Self-retest kappa is computed per label, not only pooled, using the 7-day
   protocol as the reported number; same-day blind-shuffle is disclosed-supplementary
   only.
4. The "single-annotator v0, seeking co-annotators" statement ships in the same breath as
   every kappa or accuracy number on every surface -- repo, limits page, any writeup --
   never footnoted alone.
5. No population claim and no SOTA/beats-X claim, ever, from this dataset as currently
   constituted.
6. Boundary-F1 with n printed is the primary metric; per-label token accuracy and a
   confusion matrix is secondary; neither ships alone; the class-imbalance caveat is
   stated wherever either number appears.
7. The v1 segmenter is transparent rule/lexicon-based, zero learned components; every
   label the demo produces is traceable, in the UI, to a specific rule or lexicon entry a
   visitor can open and read.
8. The positioning sentence credits CALCS (Solorio et al. 2014) and Universal
   Dependencies for the annotation-scheme and tokenization-mechanism lineage, and credits
   TweetTaglish and Batayan only for the task-granularity gap being filled -- never for a
   tagging method neither of them contains.
9. Before publication: resolve prior-art rows 7 and 8 (Section 7) to full-text, venue,
   and authorship confidence. Row 7 in particular is plausibly the true nearest-neighbour
   prior art; an uncredited collision there would be the single most damaging finding a
   specialist could make post-launch, more damaging than any gap versus TweetTaglish or
   Batayan.
10. The committed fixture set ships its confidence flags visibly, including the
    deliberately hard, low-confidence items (Section 2.3 rows 5, 9, 12, 15) -- a
    curated easy-only demo set is not honest per Section 4.

### 8.3 Fixture set

Intended path (repo not yet created; follows the sibling-repo convention already used by
sluice, clarifier, tiltmeter, etc. on this machine): C:\Users\admin\halo-halo\eval\

- eval/annotation-guideline-v1.md -- governs everything below; must exist first (the
  binding rule this whole spec enforces).
- eval/fixtures/core-affixation.jsonl -- rows 1, 2, 3, 15 from Section 2.3 (nag-book,
  i-explain, pinag-research-an, dinownload). Catches: Tier-2 MWT-split logic breaking on
  prefix versus circumfix versus non-splittable-infix cases. Highest-value file; this is
  the demo entire reason to exist.
- eval/fixtures/respelling-and-clitics.jsonl -- dyan/jan, free "ng" versus bound "-ng",
  "magandang bahay". Catches: normalization-before-lookup not being applied (respellings
  wrongly defaulting to AMBIGUOUS/OTHER instead of resolving to base lexeme), and MWT
  over-firing on a free-standing "ng" that should not be split.
- eval/fixtures/ne-vs-common-noun.jsonl -- Jollibee, GCash, ATM, jan-as-name-versus-
  particle. Catches: gazetteer/capitalization heuristics over-firing NE on a class noun
  (ATM) or under-firing on a portmanteau brand (GCash), and capitalization-sensitive
  disambiguation failures on short tokens.
- eval/fixtures/social-media-noise.jsonl -- emoji ZWJ/variation-selector sequence, a URL,
  a hashtag, a bare numeral, "i-2x". Catches: Tier-0 failing to protect URLs/emoji from
  word-boundary fragmentation, and grapheme-cluster miscounting.
- eval/fixtures/ambiguous-and-paralinguistic.jsonl -- gets, grabe versus hahaha. Catches:
  the label set being silently collapsed to a forced binary in practice (a sign AMBIGUOUS
  and OTHER were specified but not actually enforced).
- eval/fixtures/self-retest-subset.jsonl -- the greater-than-or-equal-to 20% blind-
  shuffle subset: pass-1 label, pass-2 label, per-item confidence, timestamp of each
  pass. Catches: a reported kappa becoming stale or unverifiable against committed
  evidence -- qa-engineer regression-checks this file against any future writeup number,
  mirroring BATCH-2-STANDARDS.md drift-check requirement for performance claims.

### 8.4 The sentence the page may print

"halo-halo tags Tagalog-English code-switching at the token and intra-word level --
including affixes like nag-/i-/pinag-...-an attached to English roots -- using a
six-label scheme adapted from the CALCS code-switching tagset (Solorio et al., 2014) and
Universal Dependencies' multi-word-token mechanism. It extends the granularity gap left
by TweetTaglish (LREC 2022, tweet-level mixing proportion) and Batayan (ACL 2025,
sentence-level Taglish sentiment/toxicity only) rather than reproducing either. The v1
segmenter is a transparent rule/lexicon baseline -- every label traces to a published
rule you can read. The eval set is a single-annotator v0 (James, native bilingual),
calibrated by self test-retest agreement, not inter-annotator agreement -- it supports a
documented method and a demo calibration, not a population or state-of-the-art claim, and
we are seeking co-annotators to change that."

This is the factual content and claims boundary, not final copy tone -- copywriter owns
phrasing; this spec owns what may truthfully be asserted.

---

## Handoff

- ondevice-ml-engineer: builds the Tier 0/1/2 pipeline and the v1 rule/lexicon segmenter
  against Section 1 and Section 6; owns the affix/wordlist lexicons as versioned,
  committed data.
- qa-engineer: the fixture set (Section 8.3) becomes the regression suite; owns the
  drift-check on the self-retest-subset file against any future writeup number.
- copywriter: turns Section 8.4 into final page tone without changing its claims
  boundary.
- localization-specialist: not consulted by this spec (structural/construct-validity
  scope only); should review register/dialect representativeness of the fixture set
  before wide release, given the Section 4.2 finding that this is one urban, educated-
  register bilingual's regime, not a national one.
- James: holds the go/no-go on the build itself and on resolving prior-art rows 7-8
  (Section 7, constraint 9) before any public positioning claim ships.

## References (all retrieved live this session)

- Unicode UAX #29, Text Segmentation: unicode.org/reports/tr29/
- MDN, Intl.Segmenter: developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- Solorio et al. 2014, First Shared Task on LID in Code-Switched Data: aclanthology.org/W14-3907/
- LinCE, LREC 2020: arxiv.org/abs/2005.04322, aclanthology.org/2020.lrec-1.223/, ritual.uh.edu/lince
- TweetTaglish, LREC 2022: aclanthology.org/2022.lrec-1.225/, github.com/uic-nlp-lab/LREC-2022-CodeSwitch
- Batayan, ACL 2025: arxiv.org/abs/2502.14911, aclanthology.org/2025.acl-long.1509/
- Universal Dependencies, foreign expressions: universaldependencies.org/foreign.html
- Universal Dependencies, tokenization/MWT: universaldependencies.org/u/overview/tokenization.html
- UD_Tagalog-TRG, UD_Tagalog-Ugnayan, UD-NewsCrawl: github.com/UniversalDependencies/UD_Tagalog-TRG, github.com/UniversalDependencies/UD_Tagalog-Ugnayan, arxiv.org/abs/2505.20428
- calamanCy, NLP-OSS 2023: aclanthology.org/2023.nlposs-1.1/, arxiv.org/abs/2311.07171
- Bautista 2004, Tagalog-English Code Switching as a Mode of Discourse: files.eric.ed.gov/fulltext/EJ720543.pdf
- ark-tweet-nlp / Twokenize: ark.cs.cmu.edu/TweetNLP, github.com/brendano/ark-tweet-nlp
- PACUTE (submitted, not yet peer-reviewed): arxiv.org/abs/2606.15144
- Two UNVERIFIED ResearchGate items requiring follow-up before publication (constraint 9): researchgate.net/publication/401083773, researchgate.net/publication/404019023
