"use client";

import { useId, useMemo, useState } from "react";

import { graphemeLength } from "@/core/graphemes";
import { segment } from "@/core/segmenter";
import type { Leaf } from "@/core/types";
import { RuleTracePanel } from "@/components/RuleTracePanel";
import { TokenView, type SelectedLeaf } from "@/components/TokenView";
import { SAMPLE_TEXTS } from "@/lib/sample-texts";
import { TAG_STYLE } from "@/lib/tag-style";

const DEFAULT_TEXT = SAMPLE_TEXTS[0]?.text ?? "";

/**
 * The instrument is the first screen. This page used to open with three
 * paragraphs of explanation — what the tool is, where the name comes from,
 * what the calibration caveat is — and only then a plain bordered textarea.
 * The segmenter is the product, so the segmenter is now the hero: loaded
 * with a real sample, already segmented, above the fold. The prose that
 * used to sit on top of it is either a chip, a stat, or behind a
 * <details> below the instrument. Nothing was deleted, only demoted.
 */
export default function Page(): React.JSX.Element {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [selected, setSelected] = useState<SelectedLeaf | null>(null);
  const inputId = useId();

  const result = useMemo(() => segment(text), [text]);

  /* The trace panel used to sit empty until the visitor guessed that tokens
     were clickable. It now opens on the most interesting leaf in the current
     text — the first one that came out of an intra-word split, which is the
     thing this project exists to show — and an explicit click still wins. */
  const defaultLeaf: Leaf | null = useMemo(() => {
    const splitWord = result.words.find((w) => w.split && w.leaves.length > 0);
    return splitWord?.leaves[0] ?? result.leaves[0] ?? null;
  }, [result]);
  const selectedLeaf: Leaf | null = selected?.leaf ?? defaultLeaf;

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of result.leaves) counts[l.tag] = (counts[l.tag] ?? 0) + 1;
    return counts;
  }, [result]);

  const intraWordSplits = useMemo(() => result.words.filter((w) => w.split).length, [result]);

  return (
    <>
      <div className="ambient">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-6 sm:pt-14">
          <section aria-labelledby="intro-heading" className="rise">
            <p className="t-kicker">Taglish · rule and lexicon · nothing leaves this tab</p>
            <h1 id="intro-heading" className="t-display mt-3">
              halo-halo
            </h1>
            <p className="t-lede mt-4 max-w-2xl">
              Paste Taglish. Every token gets its language tag, and every intra-word affix split
              &mdash; the point of this project &mdash; is shown, not hidden.
            </p>
          </section>

          {/* At lg the instrument and its trace sit side by side, so clicking a
              token and reading why it got that label happens without scrolling
              and without the right third of the viewport sitting empty. */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          {/* --- The instrument -------------------------------------------------- */}
          <section aria-labelledby="input-heading" className="instrument rise rise-2 overflow-hidden">
            <h2 id="input-heading" className="sr-only">
              Segmenter
            </h2>

            <div className="border-b border-rule bg-sub-2/60 px-4 py-3 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor={inputId} className="font-house-mono text-xs uppercase tracking-[0.14em] text-ink-3">
                  Taglish text
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    setSelected(null);
                  }}
                  className="chip"
                >
                  Clear
                </button>
              </div>
              <div className="rail mt-3" aria-label="Sample texts">
                {SAMPLE_TEXTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setText(s.text);
                      setSelected(null);
                    }}
                    aria-pressed={text === s.text}
                    className="chip"
                    title={s.text}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 pt-4 sm:px-6">
              <textarea
                id={inputId}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
                rows={2}
                spellCheck={false}
                className="field field-area w-full p-3 font-house-mono text-base leading-relaxed outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip">
                  <b className="font-semibold text-ink">{graphemeLength(text)}</b> characters
                </span>
                <span className="chip">
                  <b className="font-semibold text-ink">{result.leaves.length}</b> tokens
                </span>
                <span className="chip">
                  <b className="font-semibold text-ink">{result.switchPoints.length}</b> switch points
                </span>
                <span className="chip">
                  <b className="font-semibold text-ink">{intraWordSplits}</b> intra-word splits
                </span>
              </div>
            </div>

            {/* --- The readout: the money shot ---------------------------------- */}
            <div className="readout mt-5 border-t border-rule px-4 py-6 sm:px-6">
              <div className="mb-3 flex items-center gap-2 font-house-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
                <h2 className="font-normal">Segmented output</h2>
              </div>
              {text.trim().length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-3">
                  Nothing to segment yet &mdash; type above or pick a sample.
                </p>
              ) : (
                <TokenView
                  result={result}
                  selectedKey={selected?.key ?? null}
                  onSelectLeaf={(sel) => {
                    setSelected(sel);
                  }}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-rule px-4 py-3 text-xs text-ink-2 sm:px-6">
              {(Object.keys(TAG_STYLE) as (keyof typeof TAG_STYLE)[]).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 font-house-mono">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: TAG_STYLE[tag].color }}
                  />
                  {TAG_STYLE[tag].label}
                  {tagCounts[tag] ? (
                    <b className="font-semibold text-ink">{tagCounts[tag]}</b>
                  ) : (
                    <span className="text-ink-3">0</span>
                  )}
                </span>
              ))}
            </div>
          </section>

          <section aria-labelledby="trace-heading" className="rise rise-3 lg:sticky lg:top-24">
            <h2 id="trace-heading" className="font-house-mono text-xs uppercase tracking-[0.14em] text-ink-3">
              Rule trace
            </h2>
            <div className="mt-2">
              <RuleTracePanel leaf={selectedLeaf} />
            </div>
          </section>
          </div>
        </div>
      </div>

      {/* --- Below the fold: the context, compressed --------------------------- */}
      <section aria-labelledby="about-heading" className="border-t border-rule bg-sub-1">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
          <h2 id="about-heading" className="t-section max-w-xl">
            A transparent segmenter, not a model.
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a href="/method" className="panel panel-lift block p-5">
              <p className="font-house-mono text-xs uppercase tracking-[0.14em] text-amber">Method</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Rules and lexicons only. Every label traces to a rule id you can open.
              </p>
            </a>
            <a href="/eval" className="panel panel-lift block p-5">
              <p className="font-house-mono text-xs uppercase tracking-[0.14em] text-amber">Eval</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Calibrated against a self-consistent fixture set. Not a population-scale claim.
              </p>
            </a>
            <a href="/limitations" className="panel panel-lift block p-5">
              <p className="font-house-mono text-xs uppercase tracking-[0.14em] text-amber">Limitations</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                The disclosed recall gap, and what an out-of-vocabulary root does to it.
              </p>
            </a>
          </div>

          <details className="panel mt-6 p-5">
            <summary className="cursor-pointer font-house-mono text-sm text-ink">
              Why &ldquo;halo-halo&rdquo;?
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
              It is the Filipino dessert of mixed, layered ingredients that stay visibly distinct in
              one glass &mdash; the way this tool keeps every code-switched token visibly distinct
              instead of blending into one undifferentiated &ldquo;mixed language&rdquo; blur.
            </p>
          </details>
        </div>
      </section>
    </>
  );
}
