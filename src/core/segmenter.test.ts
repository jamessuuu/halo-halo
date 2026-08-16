/**
 * D1 gate (docs/halo-halo-SPEC.md's Death conditions): the two-tier
 * tokenizer must reproduce docs/batch2-linguistic-spec.md Section 2.3's
 * worked-example rulings as passing fixtures. All 20 rows of Section 2.3
 * are covered here (a strict superset of the SPEC.md milestone's stated
 * "15"), plus the two prose-only hazard/precedent cases the Linguistic
 * Spec names but does not number: "pinagbutihan" (Section 1's
 * implementation-order hazard) and "pinost" (docs/PRIOR-ART.md's citation
 * of the row-7 CalamanCy-adjacent paper's own example, added to
 * src/core/lexicon/mixed-intraword.ts alongside "dinownload").
 */
import { describe, expect, it } from "vitest";

import { graphemeLength } from "./graphemes";
import { getRule } from "./rules";
import { segment } from "./segmenter";
import type { Tag } from "./types";

function leafTags(input: string): { text: string; tag: Tag }[] {
  return segment(input).leaves.map((l) => ({ text: l.text, tag: l.tag }));
}

describe("Section 2.3 worked examples (D1 gate)", () => {
  it("row 1 — nag-book: nag- = TAG, book = ENG", () => {
    expect(leafTags("nag-book")).toEqual([
      { text: "nag-", tag: "TAG" },
      { text: "book", tag: "ENG" },
    ]);
  });

  it("row 2 — i-explain: i- = TAG, explain = ENG", () => {
    expect(leafTags("i-explain")).toEqual([
      { text: "i-", tag: "TAG" },
      { text: "explain", tag: "ENG" },
    ]);
  });

  it("row 2 (unhyphenated must resolve identically) — iexplain", () => {
    expect(leafTags("iexplain")).toEqual([
      { text: "i", tag: "TAG" },
      { text: "explain", tag: "ENG" },
    ]);
  });

  it("row 3 — pinag-research-an: pinag- = TAG, research = ENG, -an = TAG", () => {
    expect(leafTags("pinag-research-an")).toEqual([
      { text: "pinag-", tag: "TAG" },
      { text: "research", tag: "ENG" },
      { text: "-an", tag: "TAG" },
    ]);
  });

  it("row 4 — dyan: TAG (respelling of diyan)", () => {
    const [l] = segment("dyan").leaves;
    expect(l?.tag).toBe("TAG");
    expect(l?.ruleId).toBe("tag-respelling-normalized");
  });

  it("row 5 — jan (lowercase, particle position): TAG, LOW confidence", () => {
    const [l] = segment("jan").leaves;
    expect(l?.tag).toBe("TAG");
    expect(l?.confidence).toBe("LOW");
  });

  it("row 5 contrast — Jan (capitalized, name slot): NE", () => {
    const [l] = segment("Jan").leaves;
    expect(l?.tag).toBe("NE");
  });

  it("row 6 — Jollibee: NE", () => {
    expect(leafTags("Jollibee")).toEqual([{ text: "Jollibee", tag: "NE" }]);
  });

  it("row 7 — GCash: NE (Tier 2 never attempts an affix split on it)", () => {
    expect(leafTags("GCash")).toEqual([{ text: "GCash", tag: "NE" }]);
  });

  it("row 8 — 365 (bare numeral): OTHER", () => {
    expect(leafTags("365")).toEqual([{ text: "365", tag: "OTHER" }]);
  });

  it("row 9 — i-2x: i- = TAG, 2x = OTHER (a Tier-2 root slot is not always TAG/ENG)", () => {
    expect(leafTags("i-2x")).toEqual([
      { text: "i-", tag: "TAG" },
      { text: "2x", tag: "OTHER" },
    ]);
  });

  it("row 10 — heart base + variation selector: OTHER, one grapheme cluster", () => {
    const heartVS16 = "❤️";
    expect(graphemeLength(heartVS16)).toBe(1); // two code points, one visible unit
    const result = segment(heartVS16);
    expect(result.leaves).toHaveLength(1);
    expect(result.leaves[0]).toMatchObject({ tag: "OTHER", ruleId: "tier0-emoji" });
  });

  it("row 11 — bit.ly/abc123 (URL): OTHER, one Tier-0 atomic span", () => {
    const result = segment("bit.ly/abc123");
    expect(result.leaves).toHaveLength(1);
    expect(result.leaves[0]).toMatchObject({ text: "bit.ly/abc123", tag: "OTHER", ruleId: "tier0-url" });
  });

  it("row 12 — gets: AMBIGUOUS, LOW confidence, nativized-root note", () => {
    const [l] = segment("gets").leaves;
    expect(l?.tag).toBe("AMBIGUOUS");
    expect(l?.confidence).toBe("LOW");
    expect(l?.note).toMatch(/nativized/i);
  });

  it("row 13 — grabe: TAG (contrast against row 14)", () => {
    expect(leafTags("grabe")).toEqual([{ text: "grabe", tag: "TAG" }]);
  });

  it("row 14 — hahaha: OTHER (paralinguistic, no fact of the matter about its language)", () => {
    expect(leafTags("hahaha")).toEqual([{ text: "hahaha", tag: "OTHER" }]);
  });

  it("row 15 — dinownload: MIXED-intraword, one token (flagship hard case)", () => {
    const result = segment("dinownload");
    expect(result.leaves).toHaveLength(1);
    expect(result.leaves[0]?.tag).toBe("MIXED");
    expect(result.words[0]?.split).toBe(false);
  });

  it("row 16 — pag-order ng food: mixes intra-word and inter-word switching", () => {
    expect(leafTags("pag-order ng food")).toEqual([
      { text: "pag-", tag: "TAG" },
      { text: "order", tag: "ENG" },
      { text: "ng", tag: "TAG" },
      { text: "food", tag: "ENG" },
    ]);
  });

  it("row 17 — magandang bahay: pure-Tagalog sanity check, all TAG, MWT-split linker", () => {
    expect(leafTags("magandang bahay")).toEqual([
      { text: "maganda", tag: "TAG" },
      { text: "ng", tag: "TAG" },
      { text: "bahay", tag: "TAG" },
    ]);
    const result = segment("magandang bahay");
    expect(result.words[0]?.split).toBe(true); // "magandang" MWT-split into maganda + -ng
    expect(result.switchPoints).toHaveLength(0); // pure Tagalog: nothing switches
  });

  it("row 18 — #OOTD (hashtag): OTHER, one Tier-0 span, not internally segmented", () => {
    const result = segment("#OOTD");
    expect(result.leaves).toHaveLength(1);
    expect(result.leaves[0]).toMatchObject({ text: "#OOTD", tag: "OTHER", ruleId: "tier0-hashtag" });
  });

  it("row 19 — ATM: ENG, not NE (referent type, not capitalization/shape)", () => {
    expect(leafTags("ATM")).toEqual([{ text: "ATM", tag: "ENG" }]);
  });

  it("row 20 — na: TAG, already its own space-delimited token", () => {
    expect(leafTags("na")).toEqual([{ text: "na", tag: "TAG" }]);
  });
});

describe("named prose hazard/precedent cases (not numbered rows, still binding)", () => {
  it("pinagbutihan (Section 1 implementation-order hazard): stays ONE token, TAG — not torn into three pieces", () => {
    const result = segment("pinagbutihan");
    expect(result.leaves).toHaveLength(1);
    expect(result.leaves[0]).toMatchObject({ text: "pinagbutihan", tag: "TAG", ruleId: "tag-native-whole-word" });
  });

  it("pinost (docs/PRIOR-ART.md's citation of the row-7 paper's own example): MIXED-intraword, one token", () => {
    const result = segment("pinost");
    expect(result.leaves).toHaveLength(1);
    expect(result.leaves[0]?.tag).toBe("MIXED");
  });
});

describe("switch-point definition (Section 3)", () => {
  it("counts only {TAG,ENG} adjacency, including a Tier-2-internal boundary", () => {
    const result = segment("nag-book");
    expect(result.switchPoints).toHaveLength(1);
    expect(result.switchPoints[0]).toMatchObject({ leafIndex: 0, interword: false });
  });

  it("does not count a boundary touching NE, OTHER, AMBIGUOUS, or MIXED", () => {
    expect(segment("Jollibee food").switchPoints).toHaveLength(0); // NE|ENG boundary
    expect(segment("nag-book 365").switchPoints).toHaveLength(1); // only the intraword one counts
  });

  it("row 16 sentence: three switch points (intraword + two interword)", () => {
    const result = segment("pag-order ng food");
    expect(result.switchPoints).toHaveLength(3);
    expect(result.switchPoints.map((s) => s.interword)).toEqual([false, true, true]);
  });
});

describe("rule-trace traceability (constraint 7)", () => {
  const battery = [
    "nag-book",
    "i-explain",
    "iexplain",
    "pinag-research-an",
    "dyan",
    "jan",
    "Jan",
    "Jollibee",
    "GCash",
    "365",
    "i-2x",
    "❤️",
    "bit.ly/abc123",
    "gets",
    "grabe",
    "hahaha",
    "dinownload",
    "pinost",
    "pag-order ng food",
    "magandang bahay",
    "#OOTD",
    "ATM",
    "na",
    "pinagbutihan",
    "@someone said #OOTD check https://example.com/x na grabe talaga 365 gets ba",
  ];

  it("every ruleId the segmenter emits across the full battery resolves to a registered rule", () => {
    const seen = new Set<string>();
    for (const text of battery) {
      for (const l of segment(text).leaves) seen.add(l.ruleId);
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const id of seen) {
      expect(() => getRule(id)).not.toThrow();
    }
  });
});
