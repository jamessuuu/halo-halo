import Link from "next/link";

import { SITE } from "@/lib/site";

export function Header(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur">
      {/* Below 480px this stacks: wordmark alone on row one, nav as a
          single-line horizontally-scrolling strip on row two. flex-wrap on
          one row used to let the two collide — the wordmark's own hyphen
          break and the nav's wrapped second line landed on top of each
          other (ui-audit.md 2026-08-28). At 480px and up it is the original
          single row. */}
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-4">
        <Link href="/" prefetch={false} className="flex items-center gap-2 font-house-mono text-base tracking-tight">
          <img src="/brand/glyph-inv.svg" alt="" width={28} height={28} aria-hidden="true" />
          {/* whitespace-nowrap: "halo-halo" is short enough to always fit on
              one line, but the browser's default line-break-at-hyphen rule
              was splitting it into "halo-" / "halo" the moment the header
              got tight, reading as two words stacked on the nav below it. */}
          <span className="whitespace-nowrap">{SITE.name}</span>
        </Link>
        <nav
          aria-label="primary"
          // px-1 + -mx-1: breathing room for the focus ring at the scroll
          // container's own edges (verified: without it, the first link's
          // ring was clipped flush against the nav's left boundary), offset
          // by a matching negative margin so the links still line up with
          // the wordmark/border above at 480px and up.
          className="rail-nav mx-[-4px] flex flex-nowrap items-center gap-x-5 overflow-x-auto whitespace-nowrap px-1 font-house-mono text-sm"
        >
          <Link href="/" prefetch={false} className="inline-flex min-h-6 items-center text-ink-2 transition-colors hover:text-amber">
            demo
          </Link>
          <Link href="/method" prefetch={false} className="inline-flex min-h-6 items-center text-ink-2 transition-colors hover:text-amber">
            method
          </Link>
          <Link href="/eval" prefetch={false} className="inline-flex min-h-6 items-center text-ink-2 transition-colors hover:text-amber">
            eval
          </Link>
          <Link href="/annotate" prefetch={false} className="inline-flex min-h-6 items-center text-ink-2 transition-colors hover:text-amber">
            annotate
          </Link>
          <Link href="/limitations" prefetch={false} className="inline-flex min-h-6 items-center text-ink-2 transition-colors hover:text-amber">
            limitations
          </Link>
          <a href={SITE.repoUrl} className="inline-flex min-h-6 items-center text-ink-2 transition-colors hover:text-amber">
            repo ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
