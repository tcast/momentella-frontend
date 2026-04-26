import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";
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
  const tripsRes = await serverFetchJson<{ trips: Trip[] }>(
    "/api/client/trips",
  );

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
          <Link
            href="/connect"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
          >
            Plan a new trip
          </Link>
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
