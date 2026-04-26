import Link from "next/link";
import { notFound } from "next/navigation";
import { ItineraryRenderer } from "@/components/trip/itinerary/ItineraryRenderer";
import {
  MessageThread,
  type MessageEntry,
} from "@/components/trip/MessageThread";
import {
  ClientBookingsCard,
  type ClientBooking,
} from "@/components/trip/ClientBookingsCard";
import {
  ClientDocumentsCard,
  type ClientDocument,
} from "@/components/trip/ClientDocumentsCard";
import { ProposalRespondActions } from "@/components/trip/ProposalRespondActions";
import {
  parseProposalSchema,
  PROPOSAL_STATUS_COLOR,
  PROPOSAL_STATUS_LABEL,
} from "@/lib/proposal-schema";
import { serverFetchJson } from "@/lib/server-fetch";
import {
  formatDateRange,
  summarizeDestinations,
  summarizeTravelers,
  TRIP_KIND_LABEL,
  tripStatusBadge,
} from "@/lib/trip-display";

export const dynamic = "force-dynamic";

type ClientProposal = {
  id: string;
  version: number;
  status: string;
  message: string | null;
  schema: unknown;
  publishedByName: string | null;
  respondedAt: string | null;
  responderName: string | null;
  responseNote: string | null;
  createdAt: string;
};

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
  proposals: ClientProposal[];
  messages: MessageEntry[];
  bookings: ClientBooking[];
  documents: ClientDocument[];
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
  const latest = trip.proposals[0];
  const snapshot = latest ? parseProposalSchema(latest.schema) : null;
  const badge = tripStatusBadge(trip.status);
  const proposalBadge = latest
    ? PROPOSAL_STATUS_COLOR[latest.status] ?? "bg-stone-100 text-stone-800"
    : "";

  return (
    <div className="space-y-10">
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

      {latest ? (
        <section className="space-y-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                Proposal v{latest.version}
              </p>
              <h3 className="mt-1 font-display text-xl font-medium text-ink">
                {latest.status === "SENT"
                  ? "Take a look — your designer just sent this"
                  : "Latest version of your trip"}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${proposalBadge}`}
                >
                  {PROPOSAL_STATUS_LABEL[latest.status] ?? latest.status}
                </span>
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                Sent {new Date(latest.createdAt).toLocaleString()}
                {latest.publishedByName ? ` by ${latest.publishedByName}` : ""}
              </p>
            </div>
          </header>

          {latest.message ? (
            <p className="rounded-2xl border border-line bg-canvas/50 px-5 py-4 text-sm leading-relaxed text-ink">
              <span className="font-display text-base font-semibold text-ink">
                A note from your designer:
              </span>
              <br />
              {latest.message}
            </p>
          ) : null}

          <ProposalRespondActions
            tripId={trip.id}
            proposalId={latest.id}
            status={latest.status}
          />

          {snapshot ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <ItineraryRenderer
                schema={snapshot.itinerary}
                tripTitle={snapshot.trip.title}
              />
            </div>
          ) : null}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-12 text-center text-sm text-ink-muted">
          <p>Your trip designer is putting the days together.</p>
          <p className="mt-1">
            You’ll see the day-by-day proposal right here once it’s ready —
            we’ll also send a note in the messages below.
          </p>
        </div>
      )}

      <ClientBookingsCard bookings={trip.bookings} />

      <ClientDocumentsCard documents={trip.documents} />

      <MessageThread
        tripId={trip.id}
        messages={trip.messages}
        endpointBase={`/api/client/trips/${trip.id}/messages`}
        meRole="client"
      />
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
