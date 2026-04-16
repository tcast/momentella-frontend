export function Testimonial() {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <figure className="relative overflow-hidden rounded-3xl border border-line bg-canvas-muted/40 px-8 py-14 sm:px-16 sm:py-20">
          <div
            className="pointer-events-none absolute -left-6 top-6 font-display text-[8rem] leading-none text-gold/25 sm:text-[10rem]"
            aria-hidden
          >
            “
          </div>
          <blockquote className="relative font-display text-2xl font-medium leading-snug text-ink sm:text-3xl md:max-w-4xl md:text-[2.1rem] md:leading-snug">
            We used to return from “vacation” needing another vacation.
            Momentella gave us spacious days, kid-level wonder, and the kind of
            hotels that remember your name—without ever feeling precious about
            having children along.
          </blockquote>
          <figcaption className="relative mt-8 text-sm font-semibold text-ink-muted">
            — A Momentella family,{" "}
            <span className="font-normal text-ink-muted/80">
              Southern Europe & the islands
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
