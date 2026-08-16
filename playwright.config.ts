import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the REAL `output: "export"` static build, same pattern as
 * the sibling showcase projects: CI runs `pnpm build` first so the
 * zero-functions gate and these tests share one build, and this config only
 * serves the committed `out/` directory (scripts/serve-out.mjs, a plain
 * static file server) so nothing here ever exercises a Next dev server or a
 * server function — matching docs/halo-halo-SPEC.md's "client-side-only
 * network assertion" requirement.
 *
 * Port 4197 (not the sibling-project-shared default 4173): this machine
 * runs several unrelated local projects concurrently, all defaulting to
 * 4173 — verified live (M3) via `netstat -ano | grep 4173`, which showed a
 * pre-existing node process LISTENING on it. With
 * `reuseExistingServer: true` locally, that made Playwright silently drive
 * a DIFFERENT project's page (its h1 read "See exactly what the model
 * heard," not halo-halo's), the exact failure mode clarifier's own
 * e2e/smoke.spec.ts already documents. A project-specific port avoids the
 * collision instead of assuming ownership of another session's process.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:4197",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-out.mjs",
    url: "http://localhost:4197/",
    env: { PORT: "4197" },
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile-320",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 } },
    },
  ],
});
