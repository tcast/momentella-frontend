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

type TripRow = {
  id: string;
  title: string;
  status: string;
  kind: string;
  destination: string | null;
  destinations: unknown;
  startsOn: string | null;
  endsOn: string | null;
  partyAdults: number | null;
  partyChildren: number | null;
  partyChildAges: unknown;
  homeAirportIata: string | null;
  updatedAt: string;
  client: { id: string; name: string; email: string } | null;
  _count: { notes: number };
};

export default async function AdminTripsPage() {
  const data = await serverFetchJson<{ trips: TripRow[] }>(
    "/api/admin/trips?take=100",
  );
  const trips = data?.trips ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Overview
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Trips
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Each request becomes a Trip. From here you’ll plan the itinerary,
              send a proposal, track bookings, and stay in touch with the
              family. A client may have many trips over time — they all live
              under their account.
            </p>
          </div>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
          No trips yet. Open an{" "}
          <Link
            href="/admin/intake/submissions"
            className="font-semibold text-accent hover:underline"
          >
            intake submission
          </Link>{" "}
          and click <strong>Convert to trip</strong> to start one.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-canvas/60">
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Trip</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Travelers</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Kind</th>
                  <th className="px-4 py-3 text-right font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => {
                  const badge = tripStatusBadge(t.status);
                  const dest =
                    summarizeDestinations(t.destinations) ?? t.destination;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-line/70 align-top transition-colors last:border-b-0 hover:bg-canvas/40"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{t.title}</p>
                        {dest ? (
                          <p className="mt-0.5 text-xs text-ink-muted">{dest}</p>
                        ) : null}
                        {t.homeAirportIata ? (
                          <p className="mt-0.5 text-[11px] text-ink-muted">
                            ✈ {t.homeAirportIata}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        {t.client ? (
                          <Link
                            href={`/admin/users/${t.client.id}`}
                            className="block hover:opacity-80"
                          >
                            <p className="font-medium text-ink hover:underline">
                              {t.client.name || "—"}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {t.client.email}
                            </p>
                          </Link>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-ink">
                        {formatDateRange(t.startsOn, t.endsOn) ?? (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-ink">
                        {summarizeTravelers(
                          t.partyAdults,
                          t.partyChildren,
                          t.partyChildAges,
                        ) ?? <span className="text-ink-muted">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={badge.className}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-ink-muted">
                        {TRIP_KIND_LABEL[t.kind] ?? t.kind}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/trips/${t.id}/itinerary`}
                            className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas hover:bg-accent-deep"
                          >
                            Plan
                          </Link>
                          <Link
                            href={`/admin/trips/${t.id}`}
                            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
