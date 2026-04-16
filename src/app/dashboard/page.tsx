import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Trip = {
  id: string;
  title: string;
  destination: string | null;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  updatedAt: string;
};

type BookingRequest = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  notes: string | null;
};

export default async function DashboardPage() {
  const [tripsRes, requestsRes] = await Promise.all([
    serverFetchJson<{ trips: Trip[] }>("/api/client/trips"),
    serverFetchJson<{ bookingRequests: BookingRequest[] }>(
      "/api/client/booking-requests",
    ),
  ]);

  if (!tripsRes || !requestsRes) {
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

  const { trips } = tripsRes;
  const { bookingRequests } = requestsRes;

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-xl font-semibold text-ink">Trips</h2>
        {trips.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            No trips yet. When Momentella plans a journey for you, it will show up here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {trips.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-line bg-white/60 px-4 py-3 shadow-sm"
              >
                <p className="font-semibold text-ink">{t.title}</p>
                <p className="text-xs uppercase tracking-wider text-ink-muted">
                  {t.status.replaceAll("_", " ")}
                  {t.destination ? ` · ${t.destination}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold text-ink">Booking requests</h2>
        {bookingRequests.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            No requests on file. Use{" "}
            <Link href="/#contact" className="font-semibold text-accent hover:underline">
              Connect
            </Link>{" "}
            on the homepage to reach the team.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookingRequests.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-line bg-white/60 px-4 py-3 shadow-sm"
              >
                <p className="text-sm font-semibold text-ink">{r.email}</p>
                <p className="text-xs uppercase tracking-wider text-ink-muted">
                  {r.status.replaceAll("_", " ")} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
