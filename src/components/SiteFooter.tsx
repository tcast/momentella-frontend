import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-line bg-canvas-muted/60"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div>
          <p className="font-display text-3xl font-medium text-ink sm:text-4xl">
            Ready when you are.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Tell us the ages of your travelers, the pace you love, and the
            feeling you want when you unpack. We&apos;ll take it from there.
          </p>
          <a
            href="mailto:hello@momentella.travel"
            className="mt-6 inline-flex text-base font-semibold text-accent underline decoration-gold/50 decoration-1 underline-offset-4 transition hover:text-accent-deep"
          >
            hello@momentella.travel
          </a>
        </div>
        <div className="flex flex-col gap-4 md:items-end md:text-right">
          <Link
            href="https://www.instagram.com/momentella.travel/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-accent-deep"
          >
            <span aria-hidden>↗</span>
            Instagram — @momentella.travel
          </Link>
          <p className="text-xs tracking-wide text-ink-muted">
            Boutique family travel design · Based wherever you roam
          </p>
        </div>
      </div>
      <div className="border-t border-line/80 py-6 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} Momentella. All rights reserved.
      </div>
    </footer>
  );
}
