import type { Metadata } from "next";

import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "limitations",
  description: "What this tool cannot know, where the numbers come from, what was not measured, and what the demo may not be used to claim.",
};

export default function LimitationsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="docs-prose">
        <h1>Limitations</h1>
        <p>
          BATCH-2-STANDARDS.md&apos;s honesty-architecture MUST: what this tool cannot know, where every number
          comes from, and what was NOT measured — stated here plainly, not buried in a footnote.
        </p>

        <h2>This is a single-annotator v0, machine-drafted, not gold</h2>
        <p>
          &ldquo;v0, single bilingual annotator (James, native), self-test-retest reliability only — seeking
          co-annotators.&rdquo; Every number on <a href="/eval">/eval</a> and in{" "}
          <a href={`${SITE.repoUrl}/blob/main/eval/results/v0-eval-report.json`}>eval/results/v0-eval-report.json</a>{" "}
          is labeled &ldquo;draft-automated.&rdquo; It measures whether the CURRENT rule engine reproduces its own
          reviewed <a href={`${SITE.repoUrl}/blob/main/eval/v0-set/`}>eval/v0-set/</a> labels (a regression/
          consistency check) — not accuracy against independently-verified gold, and not inter-annotator agreement.
          No kappa is published anywhere on this site: kappa requires two independent annotation passes over
          blind-shuffled items, which is exactly what <a href="/annotate">the workbench</a> exists to produce, and
          no human pass has run yet.
        </p>

        <h2>Rule-based recall gaps on out-of-vocabulary roots</h2>
        <p>
          The segmenter is a transparent rule/lexicon system — a closed, curated Tagalog wordlist and a curated
          English wordlist, both deliberately small and NOT exhaustive. Any root outside either list defaults to
          AMBIGUOUS at LOW confidence rather than guessing a language — a disclosed design choice
          (docs/batch2-linguistic-spec.md §6), not a silent gap. Try the &ldquo;Out-of-vocabulary root&rdquo; sample
          on the <a href="/">demo</a> (&ldquo;nag-vlog&rdquo; — &ldquo;vlog&rdquo; is absent from the wordlist on
          purpose) to see this live. A pretrained multilingual classifier would likely have higher raw accuracy on
          easy majority-class cases from broader vocabulary coverage alone — that tradeoff (legibility over raw
          coverage) is deliberate, reasoned about in{" "}
          <a href={`${SITE.repoUrl}/blob/main/docs/batch2-linguistic-spec.md`}>docs/batch2-linguistic-spec.md §6</a>.
        </p>

        <h2>Two disclosed morphological simplifications</h2>
        <ul>
          <li>
            <strong>Epenthesis</strong> (a linking consonant Tagalog inserts before some vowel-initial suffixes,
            e.g. buti + -an → butihan) is modeled only as an alternate listed root form for the specific words this
            project&apos;s own texts use — not a general phonological rule.
          </li>
          <li>
            <strong>CV-reduplication</strong> (the contemplated/future-aspect marker on verbs, e.g. laro →
            naglalaro) is an explicit non-goal for v1 (docs/batch2-linguistic-spec.md §1), independently corroborated
            by PACUTE (Montalan et al., submitted EMNLP 2026) naming reduplication as a genuinely hard, actively
            benchmarked problem even for monolingual Filipino. Most reduplicated forms simply are not decomposed —
            they fall through to the whole-word lookup or the disclosed AMBIGUOUS fallback, never a fabricated split.
          </li>
        </ul>

        <h2>Register bias of the composed samples</h2>
        <p>
          Every example on this site — the demo&apos;s sample texts and the 16-text, 438-token{" "}
          <a href={`${SITE.repoUrl}/blob/main/eval/v0-set/texts.json`}>eval/v0-set/</a> — is an ORIGINAL composition
          by one urban, educated-register bilingual (James), not scraped content and not a sample of any population.
          Bautista (2004) frames Taglish itself as an educated, urban, Manila-centric register — a Cebuano-Bisaya-
          English trilingual speaker, a different generation, or a different class register could rule several
          AMBIGUOUS-adjacent cases differently. This repo does not claim &ldquo;Taglish&rdquo; is one monolithic
          thing this annotator fully represents.
        </p>

        <h2>Coverage the demo does not claim</h2>
        <ul>
          <li>Cebuano/Bisaya and other Philippine languages, and Tagalog-Bisaya-English trilingual switching — not tested; a token from another Philippine language is forced into AMBIGUOUS or misread as ENG/OTHER.</li>
          <li>Chavacano (Spanish-lexified Philippine creole) — sometimes conflated with Taglish by non-specialists; out of scope entirely.</li>
          <li>Hashtag-internal segmentation (turning &ldquo;#kainanatin&rdquo; into kain + na + tatin) — explicitly out of scope; a hashtag is one unsegmented Tier-0 span. Re-segmenting concatenated, delimiter-free text is a materially harder problem (the same class as Thai/Chinese segmentation).</li>
          <li>General Tagalog infixation beyond the curated MIXED-intraword list (&ldquo;dinownload,&rdquo; &ldquo;pinost&rdquo;) — non-concatenative morphology is out of Tier 2&apos;s edge-matching scope by construction.</li>
          <li>URL recognition — a known-hard, open-ended problem; the Tier-0 pattern covers the shapes this project&apos;s own fixtures and samples use, not every URL shape in the wild.</li>
        </ul>

        <h2>What the demo may NOT be used to claim</h2>
        <p>Restated verbatim from the Linguistic Spec&apos;s claims ceiling (docs/batch2-linguistic-spec.md §4.2, §3):</p>
        <ul>
          <li>No population-level claim (&ldquo;how Filipinos code-switch,&rdquo; &ldquo;X% of Taglish tokens are…&rdquo;) — one author&apos;s fixtures are not a sample of a population.</li>
          <li>No SOTA or &ldquo;beats TweetTaglish/Batayan/LinCE&rdquo; comparison — none of them attempt this exact token-and-intra-word task, so there is no shared benchmark, and n=1 with no cross-annotator agreement cannot support a comparative accuracy claim regardless.</li>
          <li>No claim that this label set or its rulings are correct in a normative sense — a label encodes a labeling regime, not the truth.</li>
          <li>No implied claim that a switch point marks a grammatical, cognitive, or sociolinguistic-function event — the demo shows WHERE labels differ, not WHY a speaker switched.</li>
          <li>No single derived &ldquo;Taglish-ness&rdquo; or &ldquo;code-switching intensity&rdquo; score presented as a fluency or quality judgment.</li>
        </ul>

        <h2>Prior art still open, not this build&apos;s to close</h2>
        <p>
          The closest adjacent mechanism found (
          <a href={`${SITE.repoUrl}/blob/main/docs/PRIOR-ART.md`}>docs/PRIOR-ART.md</a>, the D2 gate run-down) is a
          ResearchGate listing (&ldquo;Code-Switching Detection and Processing in Filipino-English Text Using
          CalamanCy&rdquo;) whose venue, peer-review status, and author byline remain UNVERIFIED after four search
          passes and a blocked direct fetch. No shipped interactive demo was found for it, so this build proceeded
          per the Linguistic Spec&apos;s own D2 branch — but full resolution of that item&apos;s authorship and
          venue, before any public positioning claim ships more widely, is James&apos;s call, not this build&apos;s
          to close unilaterally.
        </p>

        <h2>Reproduce these numbers yourself</h2>
        <p>
          <code>pnpm test</code> runs all unit and fixture suites. <code>pnpm gen:eval</code> regenerates{" "}
          <code>eval/results/v0-eval-report.json</code> from the live segmenter (deterministic — verified
          byte-identical across repeated runs). <code>pnpm e2e:smoke</code> runs the Playwright suite against the
          real static export.
        </p>
      </div>
    </div>
  );
}
