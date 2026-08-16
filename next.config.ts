import type { NextConfig } from "next";

/**
 * docs/halo-halo-SPEC.md's demo is "Fully client-side" and the verification
 * plan requires a "client-side-only network assertion" e2e test.
 * `output: "export"` is the guarantee, not a claim: Next.js refuses to emit
 * anything that would require a server (route handlers, middleware, the
 * image-optimization API) and instead writes a plain static `out/`
 * directory. scripts/assert-zero-functions.mjs re-verifies this from the
 * build artifact rather than trusting this file alone.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
