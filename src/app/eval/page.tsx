import type { Metadata } from "next";

import report from "../../../eval/results/v0-eval-report.json";
import { ALL_TAGS } from "@/core/metrics/token-accuracy";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "eval",
  description: "Per-label metrics, never pooled, each number carrying its provenance flag.",
};

function pct(n: number | null): string {
  if (n === null) return "n/a";
  return `${(n * 100).toFixed(1)}%`;
}

export default function EvalPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="docs-prose">
        <h1>Eval</h1>

        <p className="rounded-[var(--radius-brand)] border border-amber bg-amber-soft p-4 text-sm leading-relaxed text-ink">
          <strong>draft-automated, single-annotator v0.</strong> {report.provenance.honestyNote}
        </p>

        <h2>Source</h2>
        <table>
          <tbody>
            <tr><td>Texts</td><td>{report.source.textCount} (original compositions, no scraped content — <a href={`${SITE.repoUrl}/blob/main/eval/v0-set/texts.json`}>eval/v0-set/texts.json</a>)</td></tr>
            <tr><td>Tokens (leaves)</td><td>{report.source.leafCount}</td></tr>
            <tr><td>Reviewed overrides applied</td><td>{report.source.overridesApplied} (see <a href={`${SITE.repoUrl}/blob/main/eval/v0-set/reviewed-overrides.json`}>reviewed-overrides.json</a>)</td></tr>
          </tbody>
        </table>

        <h2>Boundary-F1 (primary metric)</h2>
        <p className="text-sm text-ink/70">{report.boundaryF1.classImbalanceCaveat}</p>
        <table>
          <thead>
            <tr>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1</th>
              <th>n (gold switch points)</th>
              <th>TP</th>
              <th>FP</th>
              <th>FN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{pct(report.boundaryF1.precision)}</td>
              <td>{pct(report.boundaryF1.recall)}</td>
              <td>{pct(report.boundaryF1.f1)}</td>
              <td>{report.boundaryF1.n}</td>
              <td>{report.boundaryF1.truePositive}</td>
              <td>{report.boundaryF1.falsePositive}</td>
              <td>{report.boundaryF1.falseNegative}</td>
            </tr>
          </tbody>
        </table>

        <h2>Per-label token accuracy (secondary — never pooled)</h2>
        <p className="text-sm text-ink/70">{report.perLabelAccuracyCaveat}</p>
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Support (n)</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {report.perLabelAccuracy.map((r) => (
              <tr key={r.tag}>
                <td className="font-house-mono">{r.tag}</td>
                <td>{r.support}</td>
                <td>{pct(r.accuracy)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Confusion matrix (rows = reviewed/gold, columns = predicted)</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>gold \ pred</th>
                {ALL_TAGS.map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_TAGS.map((gold) => (
                <tr key={gold}>
                  <td className="font-house-mono">{gold}</td>
                  {ALL_TAGS.map((pred) => {
                    const row = (report.confusionMatrix as Record<string, Record<string, number>>)[gold];
                    const count = row?.[pred] ?? 0;
                    return (
                      <td key={pred} className={gold === pred ? "font-semibold" : count > 0 ? "text-amber" : undefined}>
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Self-test-retest kappa</h2>
        <p>{report.kappaNote}</p>

        <h2>Reproduce this page</h2>
        <p>
          <code>pnpm gen:eval</code> regenerates <code>eval/results/v0-eval-report.json</code> from the live
          segmenter — deterministic, no timestamps, no randomness, verified byte-identical across repeated runs, so{" "}
          <code>pnpm ci:eval-check</code> (run in CI) fails on any drift between the committed file and what the
          current code actually produces.
        </p>
      </div>
    </div>
  );
}
