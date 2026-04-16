import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Overview = {
  users: number;
  trips: number;
  bookingRequests: number;
};

type BookingRequest = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  clientId: string | null;
};

export default async function AdminPage() {
  const [overview, bookingRes] = await Promise.all([
    serverFetchJson<Overview>("/api/admin/overview"),
    serverFetchJson<{ bookingRequests: BookingRequest[] }>(
      "/api/admin/booking-requests",
    ),
  ]);

  if (!overview || !bookingRes) {
    return (
      <p className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
        Could not load admin data.{" "}
        <Link className="font-semibold text-accent hover:underline" href="/login">
          Sign in
        </Link>{" "}
        with an admin account.
      </p>
    );
  }

  const { bookingRequests } = bookingRes;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-xl font-semibold text-ink">Overview</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Users", overview.users],
            ["Trips", overview.trips],
            ["Booking requests", overview.bookingRequests],
          ].map(([label, n]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-line bg-white/60 px-5 py-4 shadow-sm"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {label}
              </dt>
              <dd className="mt-1 font-display text-3xl font-semibold text-ink">{n}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold text-ink">
          Recent booking requests
        </h2>
        {bookingRequests.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">None yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white/60">
            {bookingRequests.slice(0, 15).map((r) => (
              <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
                <span className="text-sm font-semibold text-ink">{r.email}</span>
                <span className="text-xs uppercase tracking-wider text-ink-muted">
                  {r.status.replaceAll("_", " ")} ·{" "}
                  {new Date(r.createdAt).toLocaleString()}
                  {r.clientId ? " · linked client" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
