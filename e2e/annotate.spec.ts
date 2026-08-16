import { expect, test } from "@playwright/test";

// @smoke — the workbench keyboard flow the verification plan names
// explicitly ("e2e (Playwright): ... workbench keyboard flow"). Uses a
// short pasted text (3 leaves: "Nag-", "book", "na") to keep the full
// pass-1 -> pass-2 -> kappa flow fast and deterministic.

test("@smoke annotate: full keyboard-driven pass1 -> pass2 -> kappa flow", async ({ page }) => {
  await page.goto("/annotate");
  await expect(page.locator("h1")).toContainText("Annotation workbench");

  await page.getByLabel("Or paste your own text:").fill("Nag-book na");
  await page.getByRole("button", { name: "Start annotating this text" }).click();

  await expect(page.getByText("item 1 of 3")).toBeVisible();

  // Item 1: keyboard-only, tag "1" (TAG) then confidence "h" (HIGH).
  await page.keyboard.press("1");
  await page.keyboard.press("h");
  await expect(page.getByText("item 2 of 3")).toBeVisible();

  // Item 2: tag "2" (ENG) then confidence "h".
  await page.keyboard.press("2");
  await page.keyboard.press("h");
  await expect(page.getByText("item 3 of 3")).toBeVisible();

  // Item 3: tag "1" (TAG) then confidence "m".
  await page.keyboard.press("1");
  await page.keyboard.press("m");

  await expect(page.getByText("Pass 1 complete")).toBeVisible();
  await expect(page.getByText("3 items annotated")).toBeVisible();

  await page.getByRole("button", { name: "Start blind-shuffle retest (pass 2)" }).click();
  await expect(page.getByText(/item 1 of 3/)).toBeVisible();
  await expect(page.getByText("re-shuffled")).toBeVisible();

  // The blind shuffle means this run doesn't know which original item is
  // shown in which order, so this exercises the flow (three full
  // tag+confidence submissions) rather than asserting specific kappa
  // values — the kappa MATH itself is covered by
  // src/core/metrics/kappa.test.ts's hand-computed synthetic cases.
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press("1");
    await page.keyboard.press("h");
    await expect(page.getByText(`item ${String(i + 2)} of 3`)).toBeVisible();
  }
  await page.keyboard.press("1");
  await page.keyboard.press("h");

  await expect(page.getByText("Self-test-retest kappa")).toBeVisible();
  await expect(page.getByText("Cohen's kappa")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export self-retest-subset.jsonl" })).toBeVisible();
});
