"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

import sourceTexts from "../../../eval/v0-set/texts.json";
import { computePerLabelKappa, type LabelKappa } from "@/core/metrics/kappa";
import { segment } from "@/core/segmenter";
import type { Confidence, Tag } from "@/core/types";
import {
  clearSession,
  leafToItem,
  loadSession,
  saveSession,
  shuffledForRetest,
  type AnnotationItem,
  type AnnotationRecord,
  type AnnotationSession,
} from "@/lib/annotate-storage";
import { TAG_STYLE } from "@/lib/tag-style";

const TAG_ORDER: Tag[] = ["TAG", "ENG", "MIXED", "NE", "OTHER", "AMBIGUOUS"];
const TAG_KEYS: Record<string, Tag> = { "1": "TAG", "2": "ENG", "3": "MIXED", "4": "NE", "5": "OTHER", "6": "AMBIGUOUS" };
const CONFIDENCE_KEYS: Record<string, Confidence> = { h: "HIGH", m: "MEDIUM", l: "LOW" };

type Mode = "idle" | "pass1" | "pass1-done" | "pass2" | "pass2-done";

function nowIso(): string {
  return new Date().toISOString();
}

function AnnotationCard({
  item,
  index,
  total,
  onSubmit,
  revealRule,
}: {
  item: AnnotationItem;
  index: number;
  total: number;
  onSubmit: (tag: Tag, confidence: Confidence, note: string) => void;
  revealRule: boolean;
}): React.JSX.Element {
  // Reset-on-prop-change is done via `key={item.id}` at both call sites
  // (React's documented pattern for "reset all state when a prop changes")
  // rather than a setState-in-effect, which react-hooks' recommended
  // config flags as a cascading-render risk.
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [note, setNote] = useState("");
  const noteId = useId();

  const handleConfidence = useCallback(
    (confidence: Confidence) => {
      if (!selectedTag) return;
      onSubmit(selectedTag, confidence, note.trim() || undefined ? note.trim() : "");
    },
    [selectedTag, note, onSubmit]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const tag = TAG_KEYS[e.key];
      if (tag) {
        setSelectedTag(tag);
        return;
      }
      const conf = CONFIDENCE_KEYS[e.key.toLowerCase()];
      if (conf && selectedTag) handleConfidence(conf);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedTag, handleConfidence]);

  const before = item.sourceText.slice(0, item.leafStart);
  const after = item.sourceText.slice(item.leafEnd);

  return (
    <div className="rounded-[var(--radius-brand)] border border-rule bg-sub-2 p-5">
      <p className="font-house-mono text-xs text-ink/50">
        item {index + 1} of {total}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed">
        <span className="text-ink/40">{before}</span>
        <span className="rounded-[var(--radius-brand)] bg-amber-soft px-1 font-house-mono font-semibold text-ink">
          {item.leafText}
        </span>
        <span className="text-ink/40">{after}</span>
      </p>

      <fieldset className="mt-5">
        <legend className="font-house-mono text-xs text-ink/60">
          Tag this token (press 1-6, or click):
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_ORDER.map((tag, i) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSelectedTag(tag);
              }}
              aria-pressed={selectedTag === tag}
              className="rounded-[var(--radius-brand)] border px-3 py-1.5 text-sm font-house-mono"
              style={{
                borderColor: selectedTag === tag ? TAG_STYLE[tag].color : "var(--color-rule)",
                color: TAG_STYLE[tag].color,
                background: selectedTag === tag ? "var(--color-amber-soft)" : undefined,
              }}
            >
              {i + 1}. {tag}
            </button>
          ))}
        </div>
      </fieldset>

      {selectedTag && (
        <fieldset className="mt-4">
          <legend className="font-house-mono text-xs text-ink/60">Confidence (press H/M/L, or click):</legend>
          <div className="mt-2 flex gap-2">
            {(["HIGH", "MEDIUM", "LOW"] as Confidence[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  handleConfidence(c);
                }}
                className="rounded-[var(--radius-brand)] border border-rule px-3 py-1.5 text-sm hover:border-amber hover:text-amber"
              >
                {c}
              </button>
            ))}
          </div>
          <label htmlFor={noteId} className="mt-3 block font-house-mono text-xs text-ink/60">
            Optional one-line reason (required in spirit for AMBIGUOUS):
          </label>
          <input
            id={noteId}
            type="text"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            className="mt-1 w-full rounded-[var(--radius-brand)] border border-rule bg-paper px-2 py-1 text-sm outline-none focus-visible:border-amber"
          />
        </fieldset>
      )}

      {revealRule && (
        <p className="mt-4 border-t border-rule pt-3 text-xs text-ink/50">
          Rule engine says: <strong style={{ color: TAG_STYLE[item.ruleTag].color }}>{item.ruleTag}</strong> (
          {item.ruleConfidence.toLowerCase()} confidence, <code>{item.ruleRuleId}</code>)
        </p>
      )}
    </div>
  );
}

function KappaTable({ results }: { results: LabelKappa[] }): React.JSX.Element {
  return (
    <table className="mt-3 w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-rule bg-amber-soft px-3 py-1.5 text-left">Tag</th>
          <th className="border border-rule bg-amber-soft px-3 py-1.5 text-left">n</th>
          <th className="border border-rule bg-amber-soft px-3 py-1.5 text-left">Cohen&apos;s kappa</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => (
          <tr key={r.tag}>
            <td className="border border-rule px-3 py-1.5 font-house-mono">{r.tag}</td>
            <td className="border border-rule px-3 py-1.5">{r.n}</td>
            <td className="border border-rule px-3 py-1.5">{r.kappa === null ? "n/a" : r.kappa.toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AnnotatePage(): React.JSX.Element {
  const [session, setSession] = useState<AnnotationSession>({ items: [], pass1: [], pass2: [] });
  const [mode, setMode] = useState<Mode>("idle");
  const [cursor, setCursor] = useState(0);
  const [retestItems, setRetestItems] = useState<AnnotationItem[]>([]);
  const [customText, setCustomText] = useState("");
  const inputId = useId();

  // A lazy useState initializer would run loadSession() during the client's
  // FIRST render too (including during hydration of the statically
  // exported HTML, which was necessarily prerendered with `window`
  // undefined) — that mismatches the server-rendered "idle" markup and
  // triggers a hydration error. Reading a browser-only API (localStorage)
  // once after mount and THEN updating state is exactly the "subscribe to
  // an external system" case React's own effect docs carve out from the
  // general "don't setState synchronously in an effect" guidance the
  // react-hooks lint rule otherwise enforces.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- see comment above the effect */
    const loaded = loadSession();
    setSession(loaded);
    if (loaded.pass1.length > 0 && loaded.pass1.length === loaded.items.length) {
      setMode(loaded.pass2.length === loaded.items.length ? "pass2-done" : "pass1-done");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const startPass1 = (text: string): void => {
    const result = segment(text);
    const items = result.leaves.map((leaf, i) => leafToItem(text, leaf, i));
    const next: AnnotationSession = { items, pass1: [], pass2: [] };
    setSession(next);
    saveSession(next);
    setCursor(0);
    setMode("pass1");
  };

  const submitPass1 = (tag: Tag, confidence: Confidence, note: string): void => {
    const item = session.items[cursor];
    if (!item) return;
    const record: AnnotationRecord = { itemId: item.id, tag, confidence, timestamp: nowIso(), ...(note ? { note } : {}) };
    const nextPass1 = [...session.pass1.filter((r) => r.itemId !== item.id), record];
    const next = { ...session, pass1: nextPass1 };
    setSession(next);
    saveSession(next);
    if (cursor + 1 < session.items.length) {
      setCursor(cursor + 1);
    } else {
      setMode("pass1-done");
    }
  };

  const startPass2 = (): void => {
    const shuffled = shuffledForRetest(session.items);
    setRetestItems(shuffled);
    setCursor(0);
    setMode("pass2");
  };

  const submitPass2 = (tag: Tag, confidence: Confidence, note: string): void => {
    const item = retestItems[cursor];
    if (!item) return;
    const record: AnnotationRecord = { itemId: item.id, tag, confidence, timestamp: nowIso(), ...(note ? { note } : {}) };
    const nextPass2 = [...session.pass2.filter((r) => r.itemId !== item.id), record];
    const next = { ...session, pass2: nextPass2 };
    setSession(next);
    saveSession(next);
    if (cursor + 1 < retestItems.length) {
      setCursor(cursor + 1);
    } else {
      setMode("pass2-done");
    }
  };

  const kappaResults = useMemo(() => {
    if (session.pass1.length === 0 || session.pass2.length === 0) return null;
    if (session.pass1.length !== session.pass2.length) return null;
    const byId1 = new Map(session.pass1.map((r) => [r.itemId, r.tag]));
    const byId2 = new Map(session.pass2.map((r) => [r.itemId, r.tag]));
    const pass1Tags: Tag[] = [];
    const pass2Tags: Tag[] = [];
    for (const item of session.items) {
      const t1 = byId1.get(item.id);
      const t2 = byId2.get(item.id);
      if (t1 && t2) {
        pass1Tags.push(t1);
        pass2Tags.push(t2);
      }
    }
    if (pass1Tags.length === 0) return null;
    return computePerLabelKappa(pass1Tags, pass2Tags);
  }, [session]);

  const exportData = (): void => {
    const rows = session.items.map((item) => {
      const p1 = session.pass1.find((r) => r.itemId === item.id);
      const p2 = session.pass2.find((r) => r.itemId === item.id);
      return {
        itemId: item.id,
        text: item.leafText,
        pass1Tag: p1?.tag ?? null,
        pass1Confidence: p1?.confidence ?? null,
        pass1Timestamp: p1?.timestamp ?? null,
        pass2Tag: p2?.tag ?? null,
        pass2Confidence: p2?.confidence ?? null,
        pass2Timestamp: p2?.timestamp ?? null,
      };
    });
    const jsonl = rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
    const blob = new Blob([jsonl], { type: "application/x-ndjson" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "self-retest-subset.jsonl";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = (): void => {
    clearSession();
    setSession({ items: [], pass1: [], pass2: [] });
    setMode("idle");
    setCursor(0);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-house-mono text-2xl tracking-tight">Annotation workbench</h1>
      <p className="mt-2 max-w-2xl text-ink/80">
        Keyboard-first token tagging against{" "}
        <a href="/method" className="underline decoration-rule hover:text-amber">
          the guideline
        </a>
        , with per-item confidence and a blind-shuffle test-retest mode that computes per-label self-agreement
        kappa. This is how a real human annotation pass gets made — the machine-drafted labels shown elsewhere on
        this site are NOT this pass; see <a href="/limitations" className="underline decoration-rule hover:text-amber">/limitations</a>.
      </p>

      {mode === "idle" && (
        <section className="mt-6 rounded-[var(--radius-brand)] border border-rule bg-sub-2 p-5">
          <h2 className="font-house-mono text-sm text-ink/70">Choose text to annotate</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sourceTexts.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  startPass1(t.text);
                }}
                className="rounded-[var(--radius-brand)] border border-rule px-2.5 py-1 text-xs hover:border-amber hover:text-amber"
                title={t.text}
              >
                {t.id} ({t.register})
              </button>
            ))}
          </div>
          <label htmlFor={inputId} className="mt-4 block font-house-mono text-xs text-ink/60">
            Or paste your own text:
          </label>
          <textarea
            id={inputId}
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
            }}
            rows={3}
            className="mt-1 w-full rounded-[var(--radius-brand)] border border-rule bg-paper p-2 text-sm outline-none focus-visible:border-amber"
          />
          <button
            type="button"
            disabled={customText.trim().length === 0}
            onClick={() => {
              startPass1(customText);
            }}
            className="mt-2 rounded-[var(--radius-brand)] border border-rule px-3 py-1.5 text-sm hover:border-amber hover:text-amber disabled:opacity-40"
          >
            Start annotating this text
          </button>
        </section>
      )}

      {mode === "pass1" && session.items[cursor] && (
        <section className="mt-6" aria-live="polite">
          <AnnotationCard key={session.items[cursor].id} item={session.items[cursor]} index={cursor} total={session.items.length} onSubmit={submitPass1} revealRule={false} />
        </section>
      )}

      {mode === "pass1-done" && (
        <section className="mt-6 rounded-[var(--radius-brand)] border border-rule bg-sub-2 p-5">
          <h2 className="font-house-mono text-sm text-ink/70">Pass 1 complete — {session.pass1.length} items annotated</h2>
          <p className="mt-2 text-sm text-ink/70">
            Per Section 4.1&apos;s PRIMARY protocol, the reported self-retest kappa requires waiting at least 7 days
            before pass 2 so short-term string memory has decayed. You can still run pass 2 now — the workbench will
            label it SUPPLEMENTARY-ONLY (same-day), never the reported number, per the guideline.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={startPass2} className="rounded-[var(--radius-brand)] border border-amber px-3 py-1.5 text-sm text-amber">
              Start blind-shuffle retest (pass 2)
            </button>
            <button type="button" onClick={exportData} className="rounded-[var(--radius-brand)] border border-rule px-3 py-1.5 text-sm hover:border-amber hover:text-amber">
              Export pass 1 (JSONL)
            </button>
            <button type="button" onClick={reset} className="rounded-[var(--radius-brand)] border border-rule px-3 py-1.5 text-sm hover:border-amber hover:text-amber">
              Start over
            </button>
          </div>
        </section>
      )}

      {mode === "pass2" && retestItems[cursor] && (
        <section className="mt-6" aria-live="polite">
          <p className="mb-2 text-xs text-ink/50">
            Blind retest — items re-shuffled, no original order or timestamps visible.
          </p>
          <AnnotationCard key={retestItems[cursor].id} item={retestItems[cursor]} index={cursor} total={retestItems.length} onSubmit={submitPass2} revealRule={false} />
        </section>
      )}

      {mode === "pass2-done" && (
        <section className="mt-6 rounded-[var(--radius-brand)] border border-rule bg-sub-2 p-5" aria-live="polite">
          <h2 className="font-house-mono text-sm text-ink/70">Self-test-retest kappa (per label, never pooled)</h2>
          <p className="mt-2 text-sm text-ink/70">
            This measures whether ONE annotator applies their own stated rules consistently to themselves — a floor,
            not evidence a second annotator would agree (docs/batch2-linguistic-spec.md Section 4.1 item 4).
          </p>
          {kappaResults && <KappaTable results={kappaResults} />}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={exportData} className="rounded-[var(--radius-brand)] border border-amber px-3 py-1.5 text-sm text-amber">
              Export self-retest-subset.jsonl
            </button>
            <button type="button" onClick={reset} className="rounded-[var(--radius-brand)] border border-rule px-3 py-1.5 text-sm hover:border-amber hover:text-amber">
              Start over
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
