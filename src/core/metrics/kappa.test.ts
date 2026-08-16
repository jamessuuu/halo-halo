import { describe, expect, it } from "vitest";

import type { Tag } from "../types";
import { computePerLabelKappa } from "./kappa";

function repeat<T>(value: T, times: number): T[] {
  return Array.from({ length: times }, () => value);
}

describe("computePerLabelKappa — synthetic agreement matrices with known answers", () => {
  it("perfect balanced agreement: kappa = 1", () => {
    const pass1: Tag[] = ["TAG", "ENG", "TAG", "ENG"];
    const pass2: Tag[] = ["TAG", "ENG", "TAG", "ENG"];
    const r = computePerLabelKappa(pass1, pass2);
    const tag = r.find((x) => x.tag === "TAG");
    expect(tag?.n).toBe(4);
    expect(tag?.kappa).toBe(1);
  });

  it("hand-computed textbook-style 2x2: a=20,b=5,c=10,d=65 -> kappa = 0.625", () => {
    // po = (20+65)/100 = 0.85
    // p1(TAG) = (20+5)/100 = 0.25, p2(TAG) = (20+10)/100 = 0.30
    // pe = 0.25*0.30 + 0.75*0.70 = 0.075 + 0.525 = 0.6
    // kappa = (0.85-0.6)/(1-0.6) = 0.25/0.4 = 0.625
    const pass1: Tag[] = [...repeat<Tag>("TAG", 20 + 5), ...repeat<Tag>("ENG", 10 + 65)];
    const pass2: Tag[] = [...repeat<Tag>("TAG", 20), ...repeat<Tag>("ENG", 5), ...repeat<Tag>("TAG", 10), ...repeat<Tag>("ENG", 65)];
    const r = computePerLabelKappa(pass1, pass2);
    const tag = r.find((x) => x.tag === "TAG");
    expect(tag?.n).toBe(100);
    expect(tag?.kappa).toBeCloseTo(0.625, 10);
  });

  it("chance-level agreement: independent 50/50 marginals with matching observed rate gives kappa ~= 0", () => {
    // a=25,b=25,c=25,d=25: po=0.5, p1=0.5,p2=0.5, pe=0.5*0.5+0.5*0.5=0.5, kappa=0
    const pass1: Tag[] = [...repeat<Tag>("TAG", 50), ...repeat<Tag>("ENG", 50)];
    const pass2: Tag[] = [...repeat<Tag>("TAG", 25), ...repeat<Tag>("ENG", 25), ...repeat<Tag>("TAG", 25), ...repeat<Tag>("ENG", 25)];
    const r = computePerLabelKappa(pass1, pass2);
    const tag = r.find((x) => x.tag === "TAG");
    expect(tag?.kappa).toBeCloseTo(0, 10);
  });

  it("perfect disagreement on a balanced label: kappa = -1", () => {
    const pass1: Tag[] = repeat<Tag>("TAG", 10).concat(repeat<Tag>("ENG", 10));
    const pass2: Tag[] = repeat<Tag>("ENG", 10).concat(repeat<Tag>("TAG", 10));
    const r = computePerLabelKappa(pass1, pass2);
    const tag = r.find((x) => x.tag === "TAG");
    expect(tag?.kappa).toBeCloseTo(-1, 10);
  });

  it("pe = 1 (both raters constant and identical) is reported as null, never fabricated 0/1", () => {
    const pass1: Tag[] = repeat<Tag>("TAG", 5);
    const pass2: Tag[] = repeat<Tag>("TAG", 5);
    const r = computePerLabelKappa(pass1, pass2);
    const tag = r.find((x) => x.tag === "TAG");
    // po=1, p1=1,p2=1, pe = 1*1 + 0*0 = 1 -> kappa undefined
    expect(tag?.kappa).toBeNull();
  });

  it("the Section 4.1-item-3 warning made concrete: rare classes can sit at chance-level agreement while a POOLED number would hide it", () => {
    // 90 items agree perfectly on TAG/ENG; the 10 MIXED items are pass1's
    // real labels but pass2 mislabels every single one as AMBIGUOUS. A
    // pooled percent-agreement would read 90% ("healthy"); per-label kappa
    // must show MIXED and AMBIGUOUS both at exactly chance level (0), not
    // "mostly fine" — hand-computable: for MIXED, a=0 (pass2 never says
    // MIXED), b=10, c=0, d=90 -> po=0.9, p1(MIXED)=0.1, p2(MIXED)=0,
    // pe = 0.1*0 + 0.9*1 = 0.9 -> kappa = (0.9-0.9)/(1-0.9) = 0 exactly.
    const agreeing: Tag[] = [...repeat<Tag>("TAG", 45), ...repeat<Tag>("ENG", 45)];
    const pass1: Tag[] = [...agreeing, ...repeat<Tag>("MIXED", 10)];
    const pass2: Tag[] = [...agreeing, ...repeat<Tag>("AMBIGUOUS", 10)];
    const r = computePerLabelKappa(pass1, pass2);
    const mixed = r.find((x) => x.tag === "MIXED");
    const ambiguous = r.find((x) => x.tag === "AMBIGUOUS");
    expect(mixed?.kappa).toBeCloseTo(0, 10);
    expect(ambiguous?.kappa).toBeCloseTo(0, 10);
  });

  it("throws on mismatched lengths", () => {
    expect(() => computePerLabelKappa(["TAG"], ["TAG", "ENG"])).toThrow();
  });
});
