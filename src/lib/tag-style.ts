import type { Tag } from "@/core/types";

/**
 * One visual treatment per tag. Color is never the only signal (WCAG
 * 1.4.1) — each tag also gets its own underline style, and every token's
 * accessible name always states the tag in words (TokenView.tsx).
 * Contrast values are computed and cited in globals.css.
 */
export interface TagStyle {
  color: string;
  decorationStyle: "solid" | "double" | "dotted" | "dashed" | "wavy" | "none";
  label: string;
}

export const TAG_STYLE: Record<Tag, TagStyle> = {
  TAG: { color: "var(--color-tag-tag)", decorationStyle: "solid", label: "TAG (Tagalog)" },
  ENG: { color: "var(--color-tag-eng)", decorationStyle: "double", label: "ENG (English)" },
  MIXED: { color: "var(--color-tag-mixed)", decorationStyle: "wavy", label: "MIXED (intra-word)" },
  NE: { color: "var(--color-tag-ne)", decorationStyle: "dotted", label: "NE (named entity)" },
  OTHER: { color: "var(--color-tag-other)", decorationStyle: "none", label: "OTHER" },
  AMBIGUOUS: { color: "var(--color-tag-ambiguous)", decorationStyle: "dashed", label: "AMBIGUOUS" },
};
