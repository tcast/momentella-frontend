import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-[6.25rem] md:pt-[4.25rem]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=80"
          alt="A parent and child walking together on a sunlit path by the water"
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/45 to-stone-900/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-stone-950/50 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(92vh-7.25rem)] max-w-6xl flex-col justify-end px-5 pb-16 pt-16 sm:px-8 sm:pb-20 md:min-h-[calc(92vh-4.25rem)] md:justify-center md:pb-24 md:pt-24">
        <p className="mb-4 max-w-xl text-xs font-semibold uppercase tracking-[0.28em] text-stone-200/90">
          Boutique travel for families
        </p>
        <h1 className="font-display text-balance text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:max-w-3xl md:text-6xl lg:text-[4.25rem]">
          The world, beautifully planned—
          <span className="text-stone-200">with little travelers in mind.</span>
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-200/95 sm:text-xl">
          Higher-end itineraries, calmer logistics, and room for wonder. We
          design trips that feel elevated for parents and magical for kids.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="#contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-canvas px-8 text-sm font-semibold text-ink shadow-hero transition hover:bg-white"
          >
            Start a conversation
          </Link>
          <Link
            href="#approach"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            Our philosophy
          </Link>
        </div>
      </div>
    </section>
  );
}
