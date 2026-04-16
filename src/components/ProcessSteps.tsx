const steps = [
  {
    step: "01",
    title: "Listen deeply",
    body: "We start with how your family moves through a day—energy, nap windows, food quirks, and the memories you want more of.",
  },
  {
    step: "02",
    title: "Design the arc",
    body: "Routing, pacing, and backups that respect both ambition and reality. You’ll see the story of the trip before a single booking is made.",
  },
  {
    step: "03",
    title: "Handle the invisible",
    body: "Transfers, seats, early check-ins, trusted sitters, and on-trip support—so you’re never hunting confirmations in a lobby.",
  },
  {
    step: "04",
    title: "Stay close",
    body: "We remain a text away while you travel, ready to adjust when weather, moods, or magic demands a new plan.",
  },
] as const;

export function ProcessSteps() {
  return (
    <section
      id="process"
      className="border-y border-line bg-canvas-muted/50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
              How we plan
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
              Calm, start to finish
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink-muted">
            No dashboards to decode—just clear proposals, human check-ins, and
            planning that feels as considered as the trip itself.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((s) => (
            <li key={s.step} className="relative pl-14 sm:pl-0">
              <span
                className="absolute left-0 top-0 font-display text-3xl font-semibold text-gold/90 sm:static sm:mb-4 sm:block"
                aria-hidden
              >
                {s.step}
              </span>
              <h3 className="font-display text-xl font-medium text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
