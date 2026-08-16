import type { Confidence, Leaf, Tag } from "@/core/types";

/**
 * Client-side (localStorage) persistence for the annotation workbench
 * (src/app/annotate/page.tsx). Deliberately NOT in src/core — this touches
 * `window`, which src/core's eslint restriction forbids by design (the
 * segmenter must stay isomorphic; the workbench's storage layer does not
 * need to be).
 */

export interface AnnotationItem {
  id: string;
  /** The full source sentence, for context. */
  sourceText: string;
  /** This item's leaf, from segment(sourceText) — fixed tokenization; only
   * the TAG is what the human annotates. */
  leafText: string;
  leafStart: number;
  leafEnd: number;
  ruleTag: Tag;
  ruleConfidence: Confidence;
  ruleRuleId: string;
}

export interface AnnotationRecord {
  itemId: string;
  tag: Tag;
  confidence: Confidence;
  note?: string;
  /** ISO timestamp — the PRIMARY self-retest protocol requires knowing
   * whether pass 2 happened at least 7 days after pass 1
   * (docs/batch2-linguistic-spec.md Section 4.1 item 2). */
  timestamp: string;
}

export interface AnnotationSession {
  items: AnnotationItem[];
  pass1: AnnotationRecord[];
  pass2: AnnotationRecord[];
}

const STORAGE_KEY = "halo-halo:annotate:session:v1";

const EMPTY_SESSION: AnnotationSession = { items: [], pass1: [], pass2: [] };

export function loadSession(): AnnotationSession {
  if (typeof window === "undefined") return EMPTY_SESSION;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_SESSION;
    const parsed = JSON.parse(raw) as AnnotationSession;
    return { items: parsed.items ?? [], pass1: parsed.pass1 ?? [], pass2: parsed.pass2 ?? [] };
  } catch {
    return EMPTY_SESSION;
  }
}

export function saveSession(session: AnnotationSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function leafToItem(sourceText: string, leaf: Leaf, index: number): AnnotationItem {
  return {
    id: `${String(index)}-${String(leaf.start)}-${String(leaf.end)}`,
    sourceText,
    leafText: leaf.text,
    leafStart: leaf.start,
    leafEnd: leaf.end,
    ruleTag: leaf.tag,
    ruleConfidence: leaf.confidence,
    ruleRuleId: leaf.ruleId,
  };
}

/** Fisher-Yates, seeded by a simple deterministic hash of the item ids so
 * "blind-shuffle" is reproducible per session rather than re-randomizing
 * on every render — still opaque to the annotator (Section 4.1 item 2:
 * "re-shuffled and re-anonymized with no visible timestamps or original
 * order"). */
export function shuffledForRetest(items: AnnotationItem[]): AnnotationItem[] {
  const arr = [...items];
  let seed = arr.reduce((acc, it) => acc + [...it.id].reduce((a, c) => a + c.charCodeAt(0), 0), 7);
  const rand = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    const swap = arr[j];
    if (tmp !== undefined && swap !== undefined) {
      arr[i] = swap;
      arr[j] = tmp;
    }
  }
  return arr;
}
