import { getRule } from "@/core/rules";
import type { Leaf } from "@/core/types";
import { TAG_STYLE } from "@/lib/tag-style";

/**
 * docs/batch2-linguistic-spec.md constraint 7: "every label the demo
 * produces must be traceable, in the UI, to a specific rule or lexicon
 * entry a visitor can open and read." This panel IS that trace, and is the
 * one part of the page that changes on selection without the visitor
 * typing — announced via aria-live so a screen-reader user gets the trace
 * without having to go hunting for it.
 */
export function RuleTracePanel({ leaf }: { leaf: Leaf | null }): React.JSX.Element {
  if (!leaf) {
    return (
      <div aria-live="polite" className="panel p-4 text-sm text-ink-3">
        Click any token above (or press Enter/Space on it) to see exactly which rule
        produced its label.
      </div>
    );
  }

  const rule = getRule(leaf.ruleId);
  const style = TAG_STYLE[leaf.tag];

  return (
    <div aria-live="polite" className="panel p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-house-mono text-lg" style={{ color: style.color }}>
          &ldquo;{leaf.text}&rdquo;
        </span>
        <span className="font-house-mono text-sm text-ink-2">{style.label}</span>
        <span className="rounded-[var(--radius-brand)] border border-rule px-1.5 py-0.5 text-xs font-house-mono uppercase tracking-wide text-ink-3">
          {leaf.confidence} confidence
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">{rule.description}</p>
      {leaf.note && (
        <p className="mt-2 border-l-2 border-amber pl-3 text-sm leading-relaxed text-ink-2">{leaf.note}</p>
      )}
      <p className="mt-3 font-house-mono text-xs text-ink-3">
        rule id: <code>{rule.id}</code> — src/core/rules.ts
      </p>
    </div>
  );
}
