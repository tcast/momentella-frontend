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
          {/* itinerary CTA + publish moved to the prominent action card below */}
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

      {/* Big, hard-to-miss "Plan the trip" card — the most common admin
          action belongs front and center, not buried in a chip. */}
      {(() => {
        const itin = parseItinerarySchema(trip.itinerarySchema);
        const dayCount = itin?.days.length ?? 0;
        const itemCount =
          itin?.days.reduce((acc, d) => acc + d.items.length, 0) ?? 0;
        const latestVersion = trip.proposals[0]?.version ?? null;
        return (
          <section className="rounded-2xl border border-line bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/80 bg-canvas/40 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Plan the trip
                </p>
                <h3 className="mt-0.5 font-display text-xl font-semibold text-ink">
                  Itinerary
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Day-by-day plan: lodging, transit, activities, meals, notes.
                  This is where you actually design the trip.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/trips/${trip.id}/itinerary`}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
                >
                  {dayCount === 0
                    ? "Start the itinerary →"
                    : "Open the itinerary builder →"}
                </Link>
                <PublishProposalButton
                  tripId={trip.id}
                  hasItinerary={dayCount > 0}
                  latestVersion={latestVersion}
                />
              </div>
            </div>
            <div className="px-5 py-4">
              {dayCount === 0 ? (
                <p className="text-sm text-ink-muted">
                  No days yet — click <strong>Start the itinerary</strong> to
                  add your first day.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink">
                  <span>
                    <strong>{dayCount}</strong> day
                    {dayCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-ink-muted">·</span>
                  <span>
                    <strong>{itemCount}</strong> item
                    {itemCount === 1 ? "" : "s"}
                  </span>
                  {latestVersion ? (
                    <>
                      <span className="text-ink-muted">·</span>
                      <span>
                        Latest published:{" "}
                        <strong>v{latestVersion}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-ink-muted">·</span>
                      <span className="text-ink-muted">
                        Not yet sent to client
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })()}

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
