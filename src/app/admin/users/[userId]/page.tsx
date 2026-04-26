import Link from "next/link";
import { notFound } from "next/navigation";
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
  createdAt: string;
  _count: { proposals: number; bookings: number };
};

type Submission = {
  id: string;
  status: string;
  createdAt: string;
  form: { id: string; name: string; slug: string };
  formVersion: { version: number };
  convertedTrip: { id: string; title: string } | null;
};

type ProfileResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string | null;
    emailVerified: boolean;
    banned: boolean | null;
    banReason: string | null;
    createdAt: string;
  };
  trips: Trip[];
  submissions: Submission[];
};

const ACTIVE = new Set([
  "LEAD",
  "PLANNING",
  "PROPOSED",
  "BOOKED",
  "IN_PROGRESS",
  "DRAFT",
  "CONFIRMED",
]);

function initials(name: string, email: string): string {
  const base = (name || email || "?").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await serverFetchJson<ProfileResponse>(
    `/api/admin/users/${userId}`,
  );
  if (!data?.user) notFound();

  const { user, trips, submissions } = data;
  const active = trips.filter((t) => ACTIVE.has(t.status));
  const past = trips.filter((t) => !ACTIVE.has(t.status));

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/users"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Users
        </Link>
        <header className="mt-4 flex flex-wrap items-start gap-5">
          <div
            aria-hidden
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent/10 text-xl font-semibold text-accent-deep"
          >
            {initials(user.name, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {user.name || "—"}
            </h2>
            <p className="text-sm text-ink-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-canvas px-2 py-0.5 font-semibold text-ink-muted">
                {user.role ?? "client"}
              </span>
              {user.banned ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-900">
                  Banned
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-900">
                  Active
                </span>
              )}
              {user.emailVerified ? (
                <span className="text-ink-muted">Email verified</span>
              ) : (
                <span className="text-amber-700">Email unverified</span>
              )}
              <span className="text-ink-muted">
                · Joined{" "}
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {user.banned && user.banReason ? (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
                <span className="font-semibold">Reason: </span>
                {user.banReason}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-line bg-white/70 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Lifetime
            </p>
            <p className="mt-1 text-sm text-ink">
              <span className="font-semibold">{trips.length}</span> trip
              {trips.length === 1 ? "" : "s"}
              {" · "}
              <span className="font-semibold">{submissions.length}</span> form
              submission{submissions.length === 1 ? "" : "s"}
            </p>
          </div>
        </header>
      </div>

      <section>
        <h3 className="font-display text-lg font-semibold text-ink">
          Active &amp; upcoming trips ({active.length})
        </h3>
        {active.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-6 text-center text-sm text-ink-muted">
            None right now.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {active.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h3 className="font-display text-lg font-semibold text-ink">
            Past trips ({past.length})
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {past.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h3 className="font-display text-lg font-semibold text-ink">
          Form submissions ({submissions.length})
        </h3>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            No form submissions on file.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/70 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {s.form.name}
                    <span className="ml-2 text-[11px] font-normal text-ink-muted">
                      v{s.formVersion.version} ·{" "}
                      {new Date(s.createdAt).toLocaleDateString()} ·{" "}
                      {s.status}
                    </span>
                  </p>
                  {s.convertedTrip ? (
                    <p className="text-[11px] text-emerald-800">
                      Converted to{" "}
                      <Link
                        href={`/admin/trips/${s.convertedTrip.id}`}
                        className="font-semibold hover:underline"
                      >
                        {s.convertedTrip.title}
                      </Link>
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/admin/intake/submissions/${s.id}`}
                  className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink hover:bg-canvas"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const badge = tripStatusBadge(trip.status);
  const dest = summarizeDestinations(trip.destinations) ?? trip.destination;
  const dates = formatDateRange(trip.startsOn, trip.endsOn);
  const travelers = summarizeTravelers(
    trip.partyAdults,
    trip.partyChildren,
    trip.partyChildAges,
  );
  return (
    <li className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
      <Link href={`/admin/trips/${trip.id}`} className="block">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-display text-base font-semibold text-ink">
            {trip.title}
          </p>
          <span className={badge.className}>{badge.label}</span>
        </div>
        {dest ? (
          <p className="mt-0.5 text-xs text-ink-muted">{dest}</p>
        ) : null}
        <dl className="mt-2 space-y-0.5 text-[11px] text-ink-muted">
          {dates ? (
            <div>
              <dt className="inline font-semibold text-ink">Dates: </dt>
              <dd className="inline">{dates}</dd>
            </div>
          ) : null}
          {travelers ? (
            <div>
              <dt className="inline font-semibold text-ink">Travelers: </dt>
              <dd className="inline">{travelers}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-semibold text-ink">Service: </dt>
            <dd className="inline">{TRIP_KIND_LABEL[trip.kind] ?? trip.kind}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-ink">Activity: </dt>
            <dd className="inline">
              {trip._count.proposals} proposal
              {trip._count.proposals === 1 ? "" : "s"} ·{" "}
              {trip._count.bookings} booking
              {trip._count.bookings === 1 ? "" : "s"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs font-semibold text-accent">Open trip →</p>
      </Link>
    </li>
  );
}
