import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const alias = { "@": path.join(rootDir, "src") };

export default defineConfig({
  resolve: { alias },
  test: {
    resolve: { alias },
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
