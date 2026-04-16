export function EditorialIntro() {
  return (
    <section
      id="approach"
      className="border-b border-line bg-canvas py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 lg:items-start">
          <blockquote className="font-display text-balance text-3xl font-medium leading-snug text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
            Luxury, for us, is presence:{" "}
            <span className="text-ink-muted">fewer tabs open, more sunsets
            shared.</span>
          </blockquote>
          <div className="space-y-6 text-base leading-relaxed text-ink-muted sm:text-lg">
            <p>
              Momentella is a travel studio for families who want depth
              without chaos—private drivers when jet lag hits, kid-friendly
              guides who actually like children, and hotels that understand
              early bedtimes.
            </p>
            <p>
              We borrow the editorial calm of a quiet magazine and the clarity
              of a well-run home: honest pacing, thoughtful defaults, and
              itineraries that leave space for ice cream stops and spontaneous
              detours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
