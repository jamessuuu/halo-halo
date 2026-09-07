import Link from "next/link";

import { SITE } from "@/lib/site";
import { Attribution } from "./Attribution";

/**
 * BRAND-KIT requirement #3: on EVERY page — chip mark + "Built by James
 * Lorenz Santos" + link to the portfolio + link to the repo. No hire-me CTA
 * (PROGRAM.md D1) — this is identity, not advertising.
 *
 * The maker line is the shared attribution kit (attribution-kit v1): the chip mark
 * inline in currentColor, the portfolio and LinkedIn links with rel="me".
 * One system across every project, so it is verified rather than remembered.
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto max-w-5xl flex flex-col gap-4 px-6 py-8 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between">
        <Attribution linkClassName="text-ink underline decoration-rule hover:text-amber" />
        <nav aria-label="halo-halo site links" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-house-mono">
          <Link href="/" prefetch={false} className="inline-flex min-h-6 items-center hover:text-amber">
            demo
          </Link>
          <Link href="/method" prefetch={false} className="inline-flex min-h-6 items-center hover:text-amber">
            method
          </Link>
          <Link href="/eval" prefetch={false} className="inline-flex min-h-6 items-center hover:text-amber">
            eval
          </Link>
          <Link href="/annotate" prefetch={false} className="inline-flex min-h-6 items-center hover:text-amber">
            annotate
          </Link>
          <Link href="/limitations" prefetch={false} className="inline-flex min-h-6 items-center hover:text-amber">
            limitations
          </Link>
          <a href={SITE.repoUrl} className="inline-flex min-h-6 items-center hover:text-amber">
            repo ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
