import Link from "next/link";
import { notFound } from "next/navigation";
import { ItineraryBuilderClient } from "@/components/trip/itinerary/ItineraryBuilderClient";
import { parseItinerarySchema } from "@/lib/itinerary-schema";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Trip = {
  id: string;
  title: string;
  startsOn: string | null;
  itinerarySchema: unknown;
  proposals: { version: number }[];
  productSlug: string | null;
  itineraryDaysAllowed: number | null;
  fulfilledByOrderId: string | null;
};

export default async function AdminTripItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const data = await serverFetchJson<{ trip: Trip }>(
    `/api/admin/trips/${tripId}`,
  );
  if (!data?.trip) notFound();
  const trip = data.trip;
  const schema = parseItinerarySchema(trip.itinerarySchema);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/trips" className="hover:text-ink">
          Trips
        </Link>
        <span>/</span>
        <Link
          href={`/admin/trips/${tripId}`}
          className="hover:text-ink"
        >
          {trip.title}
        </Link>
        <span>/</span>
        <span className="text-ink">Itinerary</span>
      </div>
      <h2 className="font-display text-2xl font-semibold text-ink">
        Itinerary builder
      </h2>
      {trip.itineraryDaysAllowed ? (
        <p className="rounded-xl border border-line bg-canvas/40 px-4 py-3 text-sm text-ink-muted">
          <span className="font-semibold text-ink">
            Purchased: {trip.itineraryDaysAllowed}-day itinerary
          </span>{" "}
          ({trip.productSlug ?? "—"}). Build the days the client paid for; if
          you go beyond, the builder will warn you so the math stays honest.
        </p>
      ) : null}
      <ItineraryBuilderClient
        tripId={trip.id}
        tripTitle={trip.title}
        startsOn={trip.startsOn}
        initialSchema={schema}
        latestProposalVersion={trip.proposals[0]?.version ?? null}
        itineraryDaysAllowed={trip.itineraryDaysAllowed}
      />
    </div>
  );
}
