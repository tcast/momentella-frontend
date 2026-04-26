import Link from "next/link";
import {
  PROPOSAL_STATUS_COLOR,
  PROPOSAL_STATUS_LABEL,
} from "@/lib/proposal-schema";

export type ProposalSummary = {
  id: string;
  version: number;
  status: string;
  message: string | null;
  publishedByName: string | null;
  respondedAt: string | null;
  responderName: string | null;
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export function ProposalHistory({
  tripId,
  proposals,
}: {
  tripId: string;
  proposals: ProposalSummary[];
}) {
  return (
    <section className="space-y-3">
      <header>
        <h3 className="font-display text-lg font-semibold text-ink">
          Proposals
        </h3>
        <p className="text-xs text-ink-muted">
          Each version is a frozen snapshot of the trip + itinerary at that
          moment.
        </p>
      </header>
      {proposals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-6 text-center text-sm text-ink-muted">
          No proposals published yet. Build the itinerary and click{" "}
          <strong>Publish to client</strong>.
        </p>
      ) : (
        <ol className="space-y-2">
          {proposals.map((p) => {
            const badge =
              PROPOSAL_STATUS_COLOR[p.status] ?? "bg-stone-100 text-stone-800";
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">
                      Version {p.version}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}
                      >
                        {PROPOSAL_STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Sent {new Date(p.createdAt).toLocaleString()}
                      {p.publishedByName ? ` by ${p.publishedByName}` : ""}
                    </p>
                    {p.respondedAt ? (
                      <p className="text-[11px] text-ink-muted">
                        Client responded{" "}
                        {new Date(p.respondedAt).toLocaleString()}
                        {p.responderName ? ` (${p.responderName})` : ""}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`/admin/trips/${tripId}/proposals/${p.id}`}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
                  >
                    View
                  </Link>
                </div>
                {p.message ? (
                  <p className="mt-3 rounded-xl border border-line bg-canvas/50 px-3 py-2 text-xs leading-relaxed text-ink">
                    <span className="font-semibold">Your message: </span>
                    {p.message}
                  </p>
                ) : null}
                {p.responseNote ? (
                  <p className="mt-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs leading-relaxed text-violet-950">
                    <span className="font-semibold">Client response: </span>
                    {p.responseNote}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
