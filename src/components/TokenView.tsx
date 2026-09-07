"use client";

import { useState } from "react";

import type { Leaf, SegmentResult, Word } from "@/core/types";
import { TAG_STYLE } from "@/lib/tag-style";

export interface SelectedLeaf {
  key: string;
  leaf: Leaf;
}

interface TokenViewProps {
  result: SegmentResult;
  onSelectLeaf: (selected: SelectedLeaf) => void;
  selectedKey: string | null;
}

function leafKey(leaf: Leaf): string {
  return `${leaf.start}-${leaf.end}`;
}

function LeafButton({
  leaf,
  selected,
  onSelect,
}: {
  leaf: Leaf;
  selected: boolean;
  onSelect: (selected: SelectedLeaf) => void;
}): React.JSX.Element {
  const style = TAG_STYLE[leaf.tag];
  return (
    <button
      type="button"
      onClick={() => {
        onSelect({ key: leafKey(leaf), leaf });
      }}
      aria-pressed={selected}
      aria-label={`"${leaf.text}", tagged ${style.label}, ${leaf.confidence.toLowerCase()} confidence. Press to open the rule trace.`}
      className="rounded-[var(--radius-brand)] px-0.5 py-0.5 font-house-mono text-[17px] leading-relaxed transition-colors hover:bg-amber-soft focus-visible:bg-amber-soft"
      style={{
        color: style.color,
        textDecorationLine: style.decorationStyle === "none" ? "none" : "underline",
        textDecorationStyle: style.decorationStyle === "none" ? undefined : style.decorationStyle,
        textDecorationThickness: "2px",
        textUnderlineOffset: "3px",
        opacity: leaf.confidence === "LOW" ? 0.72 : leaf.confidence === "MEDIUM" ? 0.86 : 1,
        background: selected ? "var(--color-amber-soft)" : undefined,
        outline: selected ? "1px dashed var(--color-amber)" : undefined,
        outlineOffset: selected ? "2px" : undefined,
      }}
    >
      {leaf.text}
    </button>
  );
}

function WordView({
  word,
  selectedKey,
  onSelectLeaf,
}: {
  word: Word;
  selectedKey: string | null;
  onSelectLeaf: (selected: SelectedLeaf) => void;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  if (!word.split || word.leaves.length === 0) {
    const [only] = word.leaves;
    if (!only) return <span>{word.text}</span>;
    return <LeafButton leaf={only} selected={selectedKey === leafKey(only)} onSelect={onSelectLeaf} />;
  }

  if (!expanded) {
    const tagList = [...new Set(word.leaves.map((l) => l.tag))].join(" + ");
    return (
      <button
        type="button"
        onClick={() => {
          setExpanded(true);
          const first = word.leaves[0];
          if (first) onSelectLeaf({ key: leafKey(first), leaf: first });
        }}
        aria-expanded={false}
        aria-label={`"${word.text}", ${String(word.leaves.length)} internal parts (${tagList}). Press to expand and see the split.`}
        className="rounded-[var(--radius-brand)] border border-dashed border-amber px-0.5 py-0.5 font-house-mono text-[17px] leading-relaxed text-ink transition-colors hover:bg-amber-soft focus-visible:bg-amber-soft"
      >
        {word.text}
        <span aria-hidden="true" className="ml-0.5 text-amber">
          ⌄
        </span>
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-px rounded-[var(--radius-brand)] border border-rule px-0.5">
      {word.leaves.map((leaf, i) => (
        <span key={leafKey(leaf)} className="inline-flex items-center">
          {i > 0 && (
            <span aria-hidden="true" className="mx-0.5 inline-block h-3 w-px bg-amber" title="intra-word switch point" />
          )}
          <LeafButton leaf={leaf} selected={selectedKey === leafKey(leaf)} onSelect={onSelectLeaf} />
        </span>
      ))}
      <button
        type="button"
        onClick={() => {
          setExpanded(false);
        }}
        aria-expanded={true}
        aria-label={`Collapse "${word.text}" back to one unit.`}
        className="ml-0.5 rounded-[var(--radius-brand)] px-1 text-xs text-ink-3 hover:text-amber focus-visible:text-amber"
      >
        ×
      </button>
    </span>
  );
}

/**
 * Renders a full SegmentResult, preserving the original text's exact
 * whitespace between words (the gaps are not tokens — src/core/segmenter.ts
 * never emits a leaf for pure whitespace) and inserting an interword
 * switch-point marker between adjacent Words whose adjacent leaves count as
 * a switch (docs/batch2-linguistic-spec.md Section 3).
 */
export function TokenView({ result, onSelectLeaf, selectedKey }: TokenViewProps): React.JSX.Element {
  const interwordSwitchAfterWord = new Set<number>();
  {
    let leafIdx = 0;
    for (const w of result.words) {
      leafIdx += w.leaves.length;
      const isSwitchHere = result.switchPoints.some((sp) => sp.interword && sp.leafIndex === leafIdx - 1);
      if (isSwitchHere) interwordSwitchAfterWord.add(leafIdx - 1);
    }
  }

  let cursor = 0;
  const nodes: React.ReactNode[] = [];
  let runningLeafIndex = 0;

  for (const word of result.words) {
    if (word.start > cursor) {
      nodes.push(<span key={`gap-${String(cursor)}`}>{result.input.slice(cursor, word.start)}</span>);
    }
    nodes.push(<WordView key={`word-${String(word.start)}`} word={word} selectedKey={selectedKey} onSelectLeaf={onSelectLeaf} />);
    cursor = word.end;
    runningLeafIndex += word.leaves.length;
    if (interwordSwitchAfterWord.has(runningLeafIndex - 1)) {
      nodes.push(
        <span
          key={`switch-${String(word.end)}`}
          aria-hidden="true"
          className="mx-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-amber align-middle"
          title="switch point"
        />
      );
    }
  }
  if (cursor < result.input.length) {
    nodes.push(<span key="gap-end">{result.input.slice(cursor)}</span>);
  }

  return (
    <div className="whitespace-pre-wrap break-words text-lg leading-[2.1]" lang="en">
      {nodes}
    </div>
  );
}
