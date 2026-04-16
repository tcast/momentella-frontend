import Image from "next/image";

const tiles = [
  {
    title: "Coast & islands",
    copy: "Shallow water mornings, shaded afternoons, and dinners where strollers disappear discreetly.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    alt: "Calm turquoise shoreline from above",
  },
  {
    title: "Cities made gentle",
    copy: "Museums in small doses, secret gardens, and routes that respect little legs.",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
    alt: "Parisian architecture along a quiet street",
  },
  {
    title: "Safari & nature",
    copy: "Family-ready camps, age-appropriate drives, and guides who nurture curiosity safely.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    alt: "Golden savanna at sunset with acacia trees",
  },
  {
    title: "Multi-gen gatherings",
    copy: "Villas with room to spread out, shared meals that feel special, and logistics that honor every generation.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Spacious modern villa with pool at golden hour, ideal for extended family stays",
  },
] as const;

export function JourneyTiles() {
  return (
    <section id="journeys" className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
            Where we shine
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            Journeys shaped around your crew
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Every trip is built from scratch—never a template. Here are a few
            rhythms families ask us for again and again.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {tiles.map((tile) => (
            <article
              key={tile.title}
              className="group relative overflow-hidden rounded-2xl border border-line bg-canvas-muted shadow-[0_2px_0_rgba(28,25,23,0.04)]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent"
                  aria-hidden
                />
                <h3 className="absolute bottom-4 left-4 right-4 font-display text-2xl font-medium text-white drop-shadow-sm sm:text-[1.65rem]">
                  {tile.title}
                </h3>
              </div>
              <p className="p-6 text-sm leading-relaxed text-ink-muted sm:text-base">
                {tile.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
