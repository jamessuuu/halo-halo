import type { Metadata } from "next";

// annotate/page.tsx is a Client Component ("use client" — it reads
// localStorage and handles keyboard input), and Client Components cannot
// export `metadata` directly. This server-component layout carries the
// route's title/description instead.
export const metadata: Metadata = {
  title: "annotate",
  description: "The keyboard-first annotation workbench: per-item confidence, blind-shuffle test-retest, per-label self-agreement kappa.",
};

export default function AnnotateLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
