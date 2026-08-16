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

export default function Page(): React.JSX.Element {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [selected, setSelected] = useState<SelectedLeaf | null>(null);
  const inputId = useId();

  const result = useMemo(() => segment(text), [text]);
  const selectedLeaf: Leaf | null = selected?.leaf ?? null;

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of result.leaves) counts[l.tag] = (counts[l.tag] ?? 0) + 1;
    return counts;
  }, [result]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <section aria-labelledby="intro-heading">
        <h1 id="intro-heading" className="font-house-mono text-2xl tracking-tight">
          halo-halo
        </h1>
        <p className="mt-2 max-w-2xl text-ink/80">{`Type or paste Taglish below. Every token gets colored by its tag, and every intra-word affix split — the point of this project — is shown, not hidden.`}</p>
        <p className="mt-3 max-w-2xl text-sm text-ink/60">
          &ldquo;halo-halo&rdquo; is named for the Filipino dessert of mixed, layered ingredients that stay visibly
          distinct in one glass — the way this tool keeps every code-switched token visibly distinct instead of
          blending into one undifferentiated &ldquo;mixed language&rdquo; blur.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-ink/60">
          This is a transparent rule/lexicon segmenter (no learned model) calibrated against a self-consistent
          fixture set, not a population-scale claim. Read{" "}
          <a href="/method" className="underline decoration-rule hover:text-amber">
            the method
          </a>{" "}
          and{" "}
          <a href="/limitations" className="underline decoration-rule hover:text-amber">
            the limitations
          </a>{" "}
          before judging any label.
        </p>
      </section>

      <section aria-labelledby="input-heading" className="mt-8">
        <h2 id="input-heading" className="sr-only">
          Input
        </h2>
        <label htmlFor={inputId} className="block font-house-mono text-sm text-ink/70">
          Taglish text
        </label>
        <textarea
          id={inputId}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          rows={4}
          spellCheck={false}
          className="mt-2 w-full rounded-[var(--radius-brand)] border border-rule bg-white/60 p-3 font-house-mono text-base leading-relaxed text-ink outline-none focus-visible:border-amber"
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/50">
          <span>{graphemeLength(text)} characters</span>
          <span>{result.leaves.length} tokens</span>
          <span>{result.switchPoints.length} switch points</span>
          <button
            type="button"
            onClick={() => {
              setText("");
              setSelected(null);
            }}
            className="ml-auto rounded-[var(--radius-brand)] border border-rule px-2 py-0.5 hover:border-amber hover:text-amber"
          >
            Clear
          </button>
        </div>

        <div className="mt-4">
          <span className="block font-house-mono text-xs text-ink/60">Sample texts (include the hard cases):</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLE_TEXTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setText(s.text);
                  setSelected(null);
                }}
                aria-pressed={text === s.text}
                className="rounded-[var(--radius-brand)] border border-rule px-2.5 py-1 text-xs hover:border-amber hover:text-amber"
                title={s.text}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="output-heading" className="mt-8">
        <h2 id="output-heading" className="font-house-mono text-sm text-ink/70">
          Segmented output
        </h2>
        <div className="mt-2 rounded-[var(--radius-brand)] border border-rule bg-white/40 p-4">
          {text.trim().length === 0 ? (
            <p className="text-sm text-ink/50">Nothing to segment yet — type above or pick a sample text.</p>
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

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
          {(Object.keys(TAG_STYLE) as (keyof typeof TAG_STYLE)[]).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TAG_STYLE[tag].color }} />
              {TAG_STYLE[tag].label}
              {tagCounts[tag] ? ` (${String(tagCounts[tag])})` : ""}
            </span>
          ))}
        </div>
      </section>

      <section aria-labelledby="trace-heading" className="mt-8">
        <h2 id="trace-heading" className="font-house-mono text-sm text-ink/70">
          Rule trace
        </h2>
        <div className="mt-2">
          <RuleTracePanel leaf={selectedLeaf} />
        </div>
      </section>
    </div>
  );
}
