import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";
import { formatPrice, orderStatusBadge } from "@/lib/commerce-display";
import {
  formatDateRange,
  summarizeDestinations,
  summarizeTravelers,
  TRIP_KIND_LABEL,
  tripStatusBadge,
} from "@/lib/trip-display";

export const dynamic = "force-dynamic";

type Trip = {
  id: string;
  title: string;
  destination: string | null;
  destinations: unknown;
  status: string;
  kind: string;
  startsOn: string | null;
  endsOn: string | null;
  partyAdults: number | null;
  partyChildren: number | null;
  partyChildAges: unknown;
  homeAirportIata: string | null;
  updatedAt: string;
};

type ClientOrder = {
  id: string;
  totalCents: number;
  status: string;
  isGift: boolean;
  createdAt: string;
  product: { name: string; slug: string; itineraryDays: number | null };
  giftCertificate: {
    id: string;
    code: string;
    recipientEmail: string;
    recipientName: string | null;
    redeemedAt: string | null;
  } | null;
  trips: { id: string; title: string; status: string }[];
};

type GiftReceived = {
  id: string;
  redeemedAt: string | null;
  order: {
    product: { name: string; slug: string };
    buyer: { name: string; email: string } | null;
  };
  redeemedTrip: { id: string; title: string; status: string } | null;
};

const ACTIVE_STATUSES = new Set([
  "LEAD",
  "PLANNING",
  "PROPOSED",
  "BOOKED",
  "IN_PROGRESS",
  "DRAFT",
  "CONFIRMED",
]);

export default async function DashboardPage() {
  const [tripsRes, ordersRes, giftsRes] = await Promise.all([
    serverFetchJson<{ trips: Trip[] }>("/api/client/trips"),
    serverFetchJson<{ orders: ClientOrder[] }>("/api/client/orders"),
    serverFetchJson<{ gifts: GiftReceived[] }>("/api/client/gifts-received"),
  ]);

  if (!tripsRes) {
    return (
      <p className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
        We could not load your portal data. Try refreshing the page, or{" "}
        <Link className="font-semibold text-accent hover:underline" href="/login">
          sign in again
        </Link>
        .
      </p>
    );
  }

  const trips = tripsRes.trips ?? [];
  const active = trips.filter((t) => ACTIVE_STATUSES.has(t.status));
  const past = trips.filter((t) => !ACTIVE_STATUSES.has(t.status));
  const orders = ordersRes?.orders ?? [];
  const giftsSent = orders.filter((o) => o.isGift);
  const giftsReceived = giftsRes?.gifts ?? [];

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Your trips
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Active and upcoming journeys with Momentella.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/services"
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
            >
              Order itinerary planning
            </Link>
            <Link
              href="/connect"
              className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas"
            >
              Plan a custom trip
            </Link>
          </div>
        </div>
        {active.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-8 text-center text-sm text-ink-muted">
            No trips in motion yet. Tell us about a trip you’re dreaming up
            using <strong>Plan a new trip</strong> — we’ll be in touch.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {active.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </ul>
        )}
      </section>

      {giftsReceived.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            Gifts you've received
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {giftsReceived.map((g) => (
              <li
                key={g.id}
                className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Gift from{" "}
                  {g.order.buyer?.name ?? g.order.buyer?.email ?? "a friend"}
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-ink">
                  {g.order.product.name}
                </p>
                {g.redeemedTrip ? (
                  <Link
                    href={`/dashboard/trips/${g.redeemedTrip.id}`}
                    className="mt-3 inline-flex text-xs font-semibold text-accent hover:underline"
                  >
                    Open the trip →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            Past trips
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {past.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </ul>
        </section>
      ) : null}

      {orders.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            Your orders
          </h2>
          <ul className="mt-4 space-y-2">
            {orders.map((o) => {
              const sb = orderStatusBadge(o.status);
              return (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {o.product.name}
                      <span className={`ml-2 ${sb.className}`}>{sb.label}</span>
                      {o.isGift ? (
                        <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-900">
                          Gift
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                      {formatPrice(o.totalCents)}
                      {o.isGift && o.giftCertificate
                        ? ` · for ${o.giftCertificate.recipientName ?? o.giftCertificate.recipientEmail}${
                            o.giftCertificate.redeemedAt ? " (redeemed)" : ""
                          }`
                        : ""}
                    </p>
                  </div>
                  {o.trips[0] ? (
                    <Link
                      href={`/dashboard/trips/${o.trips[0].id}`}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
                    >
                      Open trip
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {giftsSent.length > 0 ? (
            <p className="mt-2 text-[11px] text-ink-muted">
              You've sent {giftsSent.length} gift
              {giftsSent.length === 1 ? "" : "s"} —{" "}
              {giftsSent.filter((g) => g.giftCertificate?.redeemedAt).length}{" "}
              redeemed.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const badge = tripStatusBadge(trip.status);
  const dest = summarizeDestinations(trip.destinations) ?? trip.destination;
  const dates = formatDateRange(trip.startsOn, trip.endsOn);
  const travelers = summarizeTravelers(
    trip.partyAdults,
    trip.partyChildren,
    trip.partyChildAges,
  );
  return (
    <li className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm transition hover:border-accent/50 hover:shadow-md">
      <Link href={`/dashboard/trips/${trip.id}`} className="block">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-display text-lg font-semibold text-ink">
          {trip.title}
        </p>
        <span className={badge.className}>{badge.label}</span>
      </div>
      {dest ? (
        <p className="mt-1 text-sm text-ink-muted">{dest}</p>
      ) : null}
      <dl className="mt-3 space-y-1 text-xs text-ink-muted">
        {dates ? (
          <div>
            <dt className="inline font-semibold text-ink">Dates: </dt>
            <dd className="inline">{dates}</dd>
          </div>
        ) : null}
        {travelers ? (
          <div>
            <dt className="inline font-semibold text-ink">Travelers: </dt>
            <dd className="inline">{travelers}</dd>
          </div>
        ) : null}
        {trip.homeAirportIata ? (
          <div>
            <dt className="inline font-semibold text-ink">From: </dt>
            <dd className="inline">{trip.homeAirportIata}</dd>
          </div>
        ) : null}
        <div>
          <dt className="inline font-semibold text-ink">Service: </dt>
          <dd className="inline">{TRIP_KIND_LABEL[trip.kind] ?? trip.kind}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs font-semibold text-accent">View itinerary →</p>
      </Link>
    </li>
  );
}
