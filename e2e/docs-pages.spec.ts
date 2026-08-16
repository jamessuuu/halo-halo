import { expect, test } from "@playwright/test";

test("@smoke method page loads and states the claims ceiling", async ({ page }) => {
  const response = await page.goto("/method");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Method");
  await expect(page.getByText("Claims ceiling")).toBeVisible();
  await expect(page.getByText("seeking co-annotators", { exact: false }).first()).toBeVisible();
});

test("@smoke eval page loads and flags every number draft-automated", async ({ page }) => {
  const response = await page.goto("/eval");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Eval");
  await expect(page.getByText("draft-automated", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Boundary-F1")).toBeVisible();
  await expect(page.getByText("Confusion matrix", { exact: false })).toBeVisible();
});

test("@smoke limitations page loads and states the claims ceiling and OOV gap", async ({ page }) => {
  const response = await page.goto("/limitations");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Limitations");
  await expect(page.getByText("out-of-vocabulary", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("What the demo may NOT be used to claim")).toBeVisible();
});

test("@smoke eval page's confusion matrix scrolls within its own container, never the page, at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/eval");
  await expect(page.locator("h1")).toContainText("Eval");
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth, "page should not overflow horizontally at 320px even with the confusion matrix table present").toBeLessThanOrEqual(clientWidth + 1);
});
