import Link from "next/link";

import { SITE } from "@/lib/site";

export function Header(): React.JSX.Element {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" prefetch={false} className="flex items-center gap-2 font-house-mono text-base tracking-tight">
          <img src="/brand/glyph.svg" alt="" width={28} height={28} aria-hidden="true" />
          <span>{SITE.name}</span>
        </Link>
        <nav aria-label="primary" className="flex flex-wrap items-center gap-x-5 font-house-mono text-sm">
          <Link href="/" prefetch={false} className="hover:text-amber">
            demo
          </Link>
          <Link href="/method" prefetch={false} className="hover:text-amber">
            method
          </Link>
          <Link href="/eval" prefetch={false} className="hover:text-amber">
            eval
          </Link>
          <Link href="/annotate" prefetch={false} className="hover:text-amber">
            annotate
          </Link>
          <Link href="/limitations" prefetch={false} className="hover:text-amber">
            limitations
          </Link>
          <a href={SITE.repoUrl} className="hover:text-amber">
            repo ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
