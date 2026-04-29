"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/commerce-display";
import { CheckoutForm } from "./CheckoutForm";

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  itineraryDays: number | null;
  priceCents: number;
}

export function ProductGrid({
  products,
  eyebrow = "Itinerary planning",
  title = "Choose your itinerary",
  intro = "We design beautiful, calm, family-aware days. Pick the length that fits your trip — give it as a gift, or get one for yourself.",
}: {
  products: PublicProduct[];
  eyebrow?: string;
  title?: string;
  intro?: string;
}) {
  const [picked, setPicked] = useState<PublicProduct | null>(null);

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
        Itinerary planning coming soon — check back shortly.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <header className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            {intro}
          </p>
        ) : null}
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {products.map((p) => (
          <article
            key={p.id}
            className="flex flex-col rounded-2xl border border-line bg-white/70 p-6 shadow-sm transition hover:border-accent/50 hover:shadow-md"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {p.itineraryDays
                ? p.itineraryDays === 1
                  ? "One full day"
                  : `${p.itineraryDays} full days`
                : null}
            </p>
            <h3 className="mt-1 font-display text-2xl font-medium text-ink">
              {p.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {p.description}
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-3xl font-semibold text-ink">
                {formatPrice(p.priceCents)}
              </span>
              <span className="text-xs text-ink-muted">USD · one-time</span>
            </div>
            <button
              type="button"
              onClick={() => setPicked(p)}
              className="mt-6 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-canvas transition hover:bg-accent-deep"
            >
              {p.itineraryDays === 1
                ? "Get a 1-day itinerary"
                : `Get a ${p.itineraryDays}-day itinerary`}
            </button>
            <button
              type="button"
              onClick={() => setPicked({ ...p, name: `Gift: ${p.name}` })}
              className="mt-2 w-full rounded-full border border-line bg-white py-2 text-xs font-semibold text-ink transition hover:bg-canvas"
            >
              Send as a gift →
            </button>
          </article>
        ))}
      </div>

      {picked ? (
        <CheckoutForm
          product={picked}
          asGiftDefault={picked.name.startsWith("Gift:")}
          onClose={() => setPicked(null)}
        />
      ) : null}
    </section>
  );
}
