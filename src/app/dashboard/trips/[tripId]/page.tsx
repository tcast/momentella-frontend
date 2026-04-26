import Link from "next/link";
import { notFound } from "next/navigation";
import { ItineraryRenderer } from "@/components/trip/itinerary/ItineraryRenderer";
import { parseItinerarySchema } from "@/lib/itinerary-schema";
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
  itinerarySchema: unknown;
};

export default async function ClientTripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const data = await serverFetchJson<{ trip: Trip }>(
    `/api/client/trips/${tripId}`,
  );
  if (!data?.trip) notFound();
  const trip = data.trip;
  const itin = parseItinerarySchema(trip.itinerarySchema);
  const badge = tripStatusBadge(trip.status);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← My trips
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {trip.title}
          </h2>
          <span className={badge.className}>{badge.label}</span>
        </div>
        <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-ink-muted sm:grid-cols-2">
          {summarizeDestinations(trip.destinations) ?? trip.destination ? (
            <Row label="Destinations">
              {summarizeDestinations(trip.destinations) ?? trip.destination}
            </Row>
          ) : null}
          {formatDateRange(trip.startsOn, trip.endsOn) ? (
            <Row label="Dates">
              {formatDateRange(trip.startsOn, trip.endsOn)}
            </Row>
          ) : null}
          {summarizeTravelers(
            trip.partyAdults,
            trip.partyChildren,
            trip.partyChildAges,
          ) ? (
            <Row label="Travelers">
              {summarizeTravelers(
                trip.partyAdults,
                trip.partyChildren,
                trip.partyChildAges,
              )}
            </Row>
          ) : null}
          {trip.homeAirportIata ? (
            <Row label="From">{trip.homeAirportIata}</Row>
          ) : null}
          <Row label="Service">
            {TRIP_KIND_LABEL[trip.kind] ?? trip.kind}
          </Row>
        </dl>
      </div>

      <section>
        {itin ? (
          <ItineraryRenderer schema={itin} tripTitle={trip.title} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-12 text-center text-sm text-ink-muted">
            <p>Your trip designer is putting the days together.</p>
            <p className="mt-1">
              You’ll see the day-by-day itinerary right here once it’s ready.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="inline font-semibold text-ink">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}
