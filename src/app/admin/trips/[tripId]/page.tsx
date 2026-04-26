import Link from "next/link";
import { notFound } from "next/navigation";
import { TripDetailClient } from "@/components/trip/TripDetailClient";
import {
  type NoteEntry,
  SubmissionNotesThread,
} from "@/components/intake/SubmissionNotesThread";
import {
  MessageThread,
  type MessageEntry,
} from "@/components/trip/MessageThread";
import {
  BookingsSection,
  type AdminBooking,
} from "@/components/trip/BookingsSection";
import {
  DocumentsSection,
  type AdminDocument,
} from "@/components/trip/DocumentsSection";
import {
  ProposalHistory,
  type ProposalSummary,
} from "@/components/trip/ProposalHistory";
import { PublishProposalButton } from "@/components/trip/PublishProposalButton";
import { parseItinerarySchema } from "@/lib/itinerary-schema";
import { serverFetchJson } from "@/lib/server-fetch";
import { tripStatusBadge, TRIP_KIND_LABEL } from "@/lib/trip-display";

export const dynamic = "force-dynamic";

export type AdminTrip = {
  id: string;
  title: string;
  destination: string | null;
  summary: string | null;
  kind: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  homeAirportIata: string | null;
  partyAdults: number | null;
  partyChildren: number | null;
  partyChildAges: unknown;
  budgetTier: string | null;
  destinations: unknown;
  itinerarySchema: unknown;
  client: { id: string; name: string; email: string } | null;
  originIntakeSubmission: {
    id: string;
    formId: string;
    createdAt: string;
    email: string;
  } | null;
  notes: NoteEntry[];
  proposals: ProposalSummary[];
  messages: MessageEntry[];
  bookings: AdminBooking[];
  documents: AdminDocument[];
  createdAt: string;
  updatedAt: string;
};

export default async function AdminTripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const data = await serverFetchJson<{ trip: AdminTrip }>(
    `/api/admin/trips/${tripId}`,
  );
  if (!data?.trip) notFound();
  const trip = data.trip;
  const badge = tripStatusBadge(trip.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/trips" className="hover:text-ink">
          Trips
        </Link>
        <span>/</span>
        <span className="text-ink">{trip.title}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {trip.title}
            </h2>
            <span className={badge.className}>{badge.label}</span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
              {TRIP_KIND_LABEL[trip.kind] ?? trip.kind}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/trips/${trip.id}/itinerary`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas"
            >
              Open itinerary builder →
            </Link>
            <PublishProposalButton
              tripId={trip.id}
              hasItinerary={
                !!parseItinerarySchema(trip.itinerarySchema) &&
                (parseItinerarySchema(trip.itinerarySchema)?.days.length ?? 0) > 0
              }
              latestVersion={trip.proposals[0]?.version ?? null}
            />
          </div>
          {trip.client ? (
            <p className="mt-2 text-sm text-ink-muted">
              For{" "}
              <Link
                href={`/admin/users/${trip.client.id}`}
                className="font-semibold text-accent hover:underline"
              >
                {trip.client.name || trip.client.email}
              </Link>{" "}
              · {trip.client.email}
            </p>
          ) : null}
          {trip.originIntakeSubmission ? (
            <p className="mt-1 text-xs text-ink-muted">
              From intake submitted{" "}
              {new Date(trip.originIntakeSubmission.createdAt).toLocaleDateString()}
              {" — "}
              <Link
                href={`/admin/intake/submissions/${trip.originIntakeSubmission.id}`}
                className="font-semibold text-accent hover:underline"
              >
                view original →
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <TripDetailClient trip={trip} />

      <BookingsSection tripId={trip.id} bookings={trip.bookings} />

      <DocumentsSection
        tripId={trip.id}
        documents={trip.documents}
        bookings={trip.bookings.map((b) => ({
          id: b.id,
          title: b.title,
          kind: b.kind,
        }))}
      />

      <ProposalHistory tripId={trip.id} proposals={trip.proposals} />

      <MessageThread
        tripId={trip.id}
        messages={trip.messages}
        endpointBase={`/api/admin/trips/${trip.id}/messages`}
        meRole="admin"
      />

      <SubmissionNotesThread
        submissionId={trip.id}
        notes={trip.notes}
        endpointBase={`/api/admin/trips/${trip.id}/notes`}
        title="Internal trip notes"
      />
    </div>
  );
}
