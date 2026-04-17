import Link from "next/link";
import { AuthNav } from "@/components/auth/AuthNav";

// Anchor links use absolute /#foo so they route to the homepage and scroll
// from anywhere (/admin, /p/about, /intake/...). /connect is a real page.
const nav = [
  { href: "/#approach", label: "Approach" },
  { href: "/#journeys", label: "Journeys" },
  { href: "/#process", label: "How we plan" },
  { href: "/connect", label: "Connect" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-[0.02em] text-ink"
          >
            Momentella
          </Link>
          <nav
            className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <AuthNav />
            <Link
              href="/connect"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas transition hover:bg-accent-deep sm:px-5"
            >
              Plan a trip
            </Link>
          </div>
        </div>
        <nav
          className="-mx-5 flex gap-6 overflow-x-auto border-t border-line/60 px-5 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted md:hidden"
          aria-label="Sections"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
