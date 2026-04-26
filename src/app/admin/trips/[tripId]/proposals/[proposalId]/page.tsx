import Link from "next/link";
import { notFound } from "next/navigation";
import { ItineraryRenderer } from "@/components/trip/itinerary/ItineraryRenderer";
import {
  parseProposalSchema,
  PROPOSAL_STATUS_COLOR,
  PROPOSAL_STATUS_LABEL,
} from "@/lib/proposal-schema";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Proposal = {
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

export default async function AdminProposalViewPage({
  params,
}: {
  params: Promise<{ tripId: string; proposalId: string }>;
}) {
  const { tripId, proposalId } = await params;
  const data = await serverFetchJson<{ proposal: Proposal }>(
    `/api/admin/trips/${tripId}/proposals/${proposalId}`,
  );
  if (!data?.proposal) notFound();
  const p = data.proposal;
  const snapshot = parseProposalSchema(p.schema);
  const badge =
    PROPOSAL_STATUS_COLOR[p.status] ?? "bg-stone-100 text-stone-800";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/trips" className="hover:text-ink">
          Trips
        </Link>
        <span>/</span>
        <Link href={`/admin/trips/${tripId}`} className="hover:text-ink">
          Trip
        </Link>
        <span>/</span>
        <span className="text-ink">Proposal v{p.version}</span>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Proposal v{p.version}
          </h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge}`}
          >
            {PROPOSAL_STATUS_LABEL[p.status] ?? p.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Sent {new Date(p.createdAt).toLocaleString()}
          {p.publishedByName ? ` by ${p.publishedByName}` : ""}
        </p>
        {p.message ? (
          <p className="mt-3 rounded-xl border border-line bg-canvas/50 px-4 py-3 text-sm text-ink">
            <span className="font-semibold">Message: </span>
            {p.message}
          </p>
        ) : null}
        {p.responseNote ? (
          <p className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">
            <span className="font-semibold">
              Client response{p.responderName ? ` — ${p.responderName}` : ""}:{" "}
            </span>
            {p.responseNote}
          </p>
        ) : null}
      </div>

      {snapshot ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <ItineraryRenderer
            schema={snapshot.itinerary}
            tripTitle={snapshot.trip.title}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          We can’t render this proposal’s snapshot.
        </p>
      )}
    </div>
  );
}
