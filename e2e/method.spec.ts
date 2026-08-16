import { expect, test } from "@playwright/test";

test("@smoke method page loads and states the claims ceiling", async ({ page }) => {
  const response = await page.goto("/method");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Method");
  await expect(page.getByText("Claims ceiling")).toBeVisible();
  await expect(page.getByText("seeking co-annotators", { exact: false }).first()).toBeVisible();
});
