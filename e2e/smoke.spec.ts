import { expect, test } from "@playwright/test";

// @smoke — runs against the real `out/` static export via
// scripts/serve-out.mjs (see playwright.config.ts), never a Next dev
// server, so a pass here means the actual shipped artifact works.
// Only "/" is covered here (M3 scope) — method/eval/annotate/limitations
// get their own smoke coverage as those routes are built (M4/M5).

test("@smoke home page loads with zero server functions and no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("halo-halo");
  expect(consoleErrors, `console errors: ${consoleErrors.join(" | ")}`).toEqual([]);
});

test("@smoke favicon is wired", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const iconHref = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href");
  expect(iconHref).toBe("/brand/favicon.svg");
});

test("@smoke segments a sample text to the expected tokens, and the rule trace opens on click", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Intra-word switch (the whole point)" }).click();

  // "Nag-book" is a split word (Tier-2 MWT split), so it renders collapsed
  // first — this expands it, then clicks the ENG leaf.
  await page.locator("button", { hasText: "Nag-book" }).click();
  const bookLeaf = page.locator("button", { hasText: /^book$/ });
  await expect(bookLeaf).toBeVisible();
  await bookLeaf.click();

  await expect(page.locator('[aria-live="polite"]')).toContainText("book");
  await expect(page.locator('[aria-live="polite"]')).toContainText("ENG (English)");
  await expect(page.locator('[aria-live="polite"]')).toContainText("eng-root");
});

test("@smoke renders at 320px without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("halo-halo");

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth, "page should not overflow horizontally at 320px").toBeLessThanOrEqual(clientWidth + 1);
});

test("@smoke client-side-only: typing triggers zero network requests", async ({ page }) => {
  await page.goto("/");
  const requestsDuringTyping: string[] = [];
  page.on("request", (req) => requestsDuringTyping.push(req.url()));

  const textarea = page.getByLabel("Taglish text");
  await textarea.fill("");
  await textarea.type("nag-book pa more");

  expect(requestsDuringTyping, `unexpected network requests while typing: ${requestsDuringTyping.join(", ")}`).toEqual([]);
});

test("@smoke keyboard-only: a token can be reached and activated with Tab + Enter", async ({ page }) => {
  await page.goto("/");
  const textarea = page.getByLabel("Taglish text");
  await textarea.fill("");
  await textarea.type("grabe");
  await textarea.press("Tab"); // move focus off the textarea into the rendered output

  // Tab through until a token button with "grabe" in its accessible name is
  // focused, then activate it with the keyboard alone.
  let found = false;
  for (let i = 0; i < 15 && !found; i++) {
    const active = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
    if (active.includes("grabe")) {
      found = true;
      break;
    }
    await page.keyboard.press("Tab");
  }
  expect(found, "should be able to Tab to the \"grabe\" token").toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.locator('[aria-live="polite"]')).toContainText("TAG (Tagalog)");
});
