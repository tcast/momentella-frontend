import Link from "next/link";

export function InstagramCta() {
  return (
    <section className="border-t border-line bg-canvas-muted/35 py-16 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
            Follow along
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">
            Daydreams, departures, and slow mornings abroad
          </h2>
        </div>
        <Link
          href="https://www.instagram.com/momentella.travel/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-line bg-canvas px-7 text-sm font-semibold text-ink transition hover:border-accent/40 hover:bg-white"
        >
          @momentella.travel
        </Link>
      </div>
    </section>
  );
}
