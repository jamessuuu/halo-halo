import type { Metadata } from "next";

import { RULES } from "@/core/rules";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "method",
  description: "The tagset, the tokenization architecture, the lineage credits, and the claims ceiling — published before any annotation.",
};

const WORKED_EXAMPLES: { input: string; ruling: string; why: string }[] = [
  { input: "nag-book", ruling: "nag- = TAG (prefix), book = ENG (root)", why: "Tier-2 prefix match at the left edge; the root is an unnativized English lexeme." },
  { input: "i-explain / iexplain", ruling: "i- = TAG, explain = ENG (identical with or without the hyphen)", why: "The hyphen is a confidence booster, not a requirement." },
  { input: "pinag-research-an", ruling: "pinag- = TAG, research = ENG, -an = TAG", why: "A circumfix wraps a foreign root on both sides — matched as ONE two-attachment-point entry, never two independent strips." },
  { input: "jan (lowercase)", ruling: "TAG, LOW confidence", why: "A respelling of \"diyan\" — but ambiguous with the given name \"Jan\"." },
  { input: "Jan (capitalized)", ruling: "NE", why: "Same string, different capitalization, different referent — the demo's canonical capitalization-sensitive case." },
  { input: "ATM", ruling: "ENG, not NE", why: "Refers to a class of machine, not a specific named entity — the NE/ENG line is drawn by referent type, never by capitalization or brand-like shape." },
  { input: "gets", ruling: "AMBIGUOUS, LOW confidence", why: "Visibly English in spelling, but takes native Tagalog affixation (\"nagets\") for many speakers — a label encodes a labeling regime, not a fact." },
  { input: "dinownload", ruling: "MIXED, one token", why: "The Tagalog perfective infix -in- lands INSIDE the English root, not at an edge — Tier 2's edge-matching lexicon structurally cannot bisect this. The flagship hard case." },
  { input: "magandang bahay", ruling: "maganda = TAG, -ng = TAG (linker, MWT-split), bahay = TAG", why: "Pure-Tagalog sanity check — the MWT mechanism is a general Tagalog phenomenon (Universal Dependencies already handles it), not invented for code-switching." },
  { input: "hahaha", ruling: "OTHER", why: "A paralinguistic marker attested identically in English- and Tagalog-language writing — no fact of the matter about its language." },
];

const CLAIMS_CAN: string[] = [
  "A documented, versioned method for tagging Taglish at token and intra-word granularity, with worked decision rules a second annotator could pick up.",
  "“The demo segmenter was calibrated against N fixture items” — a narrowly-scoped demo-calibration claim.",
  "Descriptive claims sourced to the linguistics literature (Bautista 2004's switch-type proportions) as independently published findings.",
];

const CLAIMS_CANNOT: string[] = [
  "Any population-level claim (“how Filipinos code-switch,” “X% of Taglish tokens are…”) — one author's fixtures are not a sample of a population.",
  "Any SOTA or “outperforms” comparison against TweetTaglish, Batayan, LinCE, or the CalamanCy-adjacent papers — none of them attempt this exact task, so there is no shared benchmark, and n=1 with no cross-annotator agreement cannot support a comparative accuracy claim regardless.",
  "Any claim that this label set or its rulings are correct in a normative sense — a label encodes one bilingual annotator's regime, not the truth.",
];

export default function MethodPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="docs-prose">
        <h1>Method</h1>

        <p className="rounded-[var(--radius-brand)] border border-amber bg-amber-soft p-4 text-base leading-relaxed text-ink">
          &ldquo;{SITE.name} tags Tagalog-English code-switching at the token and intra-word level — including
          affixes like nag-/i-/pinag-...-an attached to English roots — using a six-label scheme adapted from the
          CALCS code-switching tagset (Solorio et al., 2014) and Universal Dependencies&apos; multi-word-token
          mechanism. It extends the granularity gap left by TweetTaglish (LREC 2022, tweet-level mixing proportion)
          and Batayan (ACL 2025, sentence-level Taglish sentiment/toxicity only) rather than reproducing either. The
          v1 segmenter is a transparent rule/lexicon baseline — every label traces to a published rule you can read.
          The eval set is a single-annotator v0 (James, native bilingual), calibrated by self test-retest agreement,
          not inter-annotator agreement — it supports a documented method and a demo calibration, not a population or
          state-of-the-art claim, and we are seeking co-annotators to change that.&rdquo;
        </p>
        <p className="mt-2 text-xs text-ink/50">
          The exact claims-boundary sentence from this project&apos;s Linguistic Spec (docs/batch2-linguistic-spec.md
          §8.4) — copywriting owns tone, this spec owns what may truthfully be asserted.
        </p>

        <h2>Two-tier tokenization</h2>
        <p>
          The unit of analysis is not &ldquo;word.&rdquo; It is a two-tier token, defined by a three-stage pipeline:
        </p>
        <ol>
          <li>
            <strong>Tier 0 — social pre-extraction.</strong> URLs, @mentions, #hashtags, and emoji sequences
            (grapheme-cluster-correct, never a raw code-point count) are pulled out as atomic OTHER spans BEFORE any
            word-boundary rule runs — otherwise a URL fragments unpredictably on &ldquo;.&rdquo;/&ldquo;/&rdquo;.
          </li>
          <li>
            <strong>Tier 1 — UAX #29 word boundaries.</strong> Standard Unicode word segmentation over what Tier 0
            left behind. Alone, this is structurally blind to intra-word switching — it sees &ldquo;nag-book&rdquo;
            as one opaque word.
          </li>
          <li>
            <strong>Tier 2 — the affix layer.</strong> Inside a Tier-1 span, a closed, versioned Tagalog affix
            lexicon splits grammatical prefixes/circumfixes from a foreign root — but ONLY when the root does not
            resolve to a recognized native Tagalog root first (the guard that stops a real Tagalog word like
            &ldquo;pinagbutihan&rdquo; from being torn into three meaningless pieces). This tier is the project.
          </li>
        </ol>

        <h2>The six-tag set</h2>
        <p>TAG / ENG / MIXED / NE / OTHER / AMBIGUOUS — adapted from the CALCS shared-task tagset (Solorio et al. 2014). AMBIGUOUS is first-class, not a residual bucket to minimize.</p>
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Decision rule</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>TAG</td><td>Carries Tagalog grammar or lexical meaning, after respelling normalization.</td></tr>
            <tr><td>ENG</td><td>An attested English lexeme not (yet) productively taking native Tagalog inflection.</td></tr>
            <tr><td>MIXED</td><td>One token, morphemes from both languages, that Tier 2's edge-matching cannot cleanly separate (non-concatenative morphology — infixation).</td></tr>
            <tr><td>NE</td><td>Proper nouns opt out of the TAG/ENG axis by referent type, not etymology or capitalization.</td></tr>
            <tr><td>OTHER</td><td>Punctuation, emoji, URLs, bare numerals, paralinguistic markers — no language-specific content.</td></tr>
            <tr><td>AMBIGUOUS</td><td>Cannot be resolved with confidence in good faith. Always paired with a confidence flag and, where possible, a reason. Never a silent default.</td></tr>
          </tbody>
        </table>

        <h2>Ten worked examples</h2>
        <p>
          The full 20-row table lives in{" "}
          <a href={`${SITE.repoUrl}/blob/main/docs/batch2-linguistic-spec.md`}>docs/batch2-linguistic-spec.md §2.3</a>{" "}
          and is reproduced as executable fixtures in{" "}
          <a href={`${SITE.repoUrl}/blob/main/src/core/segmenter.test.ts`}>src/core/segmenter.test.ts</a>. The ten
          hardest are worth reading here directly:
        </p>
        <table>
          <thead>
            <tr>
              <th>Input</th>
              <th>Ruling</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {WORKED_EXAMPLES.map((w) => (
              <tr key={w.input}>
                <td className="font-house-mono">{w.input}</td>
                <td>{w.ruling}</td>
                <td>{w.why}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Switch points</h2>
        <p>
          A switch point is a boundary between two adjacent tokens whose labels differ, counted ONLY over the
          {" "}{"{TAG, ENG}"} pair. A boundary touching OTHER, NE, AMBIGUOUS, or MIXED is not counted — that would
          conflate referent-type and discourse-marker boundaries with actual bilingual grammatical switching. A
          Tier-2-internal boundary (between &ldquo;nag-&rdquo; and &ldquo;book&rdquo;) IS a switch point — showing
          that intra-word switch points exist at all, and where, is this project&apos;s actual reason to exist.
        </p>

        <h2>Every label traces to a rule</h2>
        <p>
          The live demo&apos;s rule-trace panel shows, per token, exactly which of the following {Object.keys(RULES).length} registered
          rules fired — the same registry ships in{" "}
          <a href={`${SITE.repoUrl}/blob/main/src/core/rules.ts`}>src/core/rules.ts</a>, openable by anyone.
        </p>

        <h2>Claims ceiling</h2>
        <table>
          <thead>
            <tr>
              <th>CAN honestly support</th>
              <th>CANNOT honestly support</th>
            </tr>
          </thead>
          <tbody>
            {CLAIMS_CAN.map((can, i) => (
              <tr key={can}>
                <td>{can}</td>
                <td>{CLAIMS_CANNOT[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Lineage credits</h2>
        <ul>
          <li>CALCS shared-task tagset — Solorio et al. 2014 (aclanthology.org/W14-3907/) — the six-tag scheme's origin.</li>
          <li>Universal Dependencies — foreign-expression guidelines and the Multi-Word-Token mechanism (universaldependencies.org) — the MWT split's precedent.</li>
          <li>TweetTaglish — Herrera, Aich, Parde, LREC 2022 — the tweet-level task-granularity gap this project extends.</li>
          <li>Batayan — ACL 2025 — the sentence-level task-granularity gap this project extends.</li>
          <li>LinCE — LREC 2020 — confirms Tagalog-English is not one of its four covered pairs.</li>
          <li>ark-tweet-nlp / Twokenize — the Tier-0 pre-tokenization engineering pattern (cited for the pattern only, not language coverage).</li>
          <li>calamanCy — Miranda, NLP-OSS 2023 — the base Tagalog NLP toolkit this project&apos;s Tier 2 does not touch.</li>
          <li>&ldquo;Code-Switching Detection and Processing in Filipino-English Text Using CalamanCy&rdquo; (ResearchGate 401083773, venue/authorship UNVERIFIED) — the nearest prior-art mechanism, a fine-tuned mBERT classifier, cited per <a href="/limitations">/limitations</a>&apos;s full disclosure.</li>
          <li>Bautista (2004) — the sociolinguistic grounding for the switch-point construct.</li>
        </ul>

        <h2>Single-annotator honesty</h2>
        <p>
          &ldquo;v0, single bilingual annotator (James, native), self-test-retest reliability only — seeking
          co-annotators&rdquo; ships in the same breath as every kappa or accuracy number this project publishes.
          The full annotation guideline, worked examples, and test-retest protocol are committed at{" "}
          <a href={`${SITE.repoUrl}/blob/main/docs/annotation-guideline-v1.md`}>docs/annotation-guideline-v1.md</a> —
          dated and versioned BEFORE any item in the eval set was labeled. See <a href="/eval">/eval</a> for the
          current numbers and <a href="/annotate">/annotate</a> for the tool that produces the real human pass.
        </p>
      </div>
    </div>
  );
}
