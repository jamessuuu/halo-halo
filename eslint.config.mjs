// @ts-check
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat["recommended-latest"],
  {
    // BATCH-2-STANDARDS.md: accessibility as engineering, not an
    // afterthought. jsx-a11y catches the mechanical subset at lint time;
    // the a11y-audit skill covers what only a live interface reveals.
    files: ["src/**/*.tsx"],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // docs/batch2-linguistic-spec.md Section 6: the segmenter is a
    // transparent rule/lexicon system. src/core is the one implementation
    // the fixture-driven tests and the eval harness both run against, and
    // it must stay pure and isomorphic (no DOM, no fetch, no I/O) so the
    // same code runs identically in the browser demo, the Node test runner,
    // and the build-time eval-report script.
    files: ["src/core/**/*.ts"],
    ignores: ["src/core/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:*", "react", "react-dom", "next", "next/*"],
              message:
                "src/core must stay pure and isomorphic (no DOM, no I/O). Put UI/browser code in src/components or src/app.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "window", message: "src/core must be DOM-free." },
        { name: "document", message: "src/core must be DOM-free." },
        { name: "fetch", message: "src/core must not perform network I/O." },
      ],
    },
  },
  {
    files: ["**/*.mjs", "scripts/**", "*.config.ts", "playwright.config.ts", "vitest.config.ts"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        fetch: "readonly",
      },
    },
  },
  {
    files: ["e2e/**"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
      },
    },
  }
);
