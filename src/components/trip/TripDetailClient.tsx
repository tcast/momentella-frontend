"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";
import {
  TRIP_KIND_OPTIONS,
  TRIP_STATUS_OPTIONS,
  formatDateRange,
  summarizeDestinations,
  summarizeTravelers,
} from "@/lib/trip-display";
import type { AdminTrip } from "@/app/admin/trips/[tripId]/page";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function TripDetailClient({ trip }: { trip: AdminTrip }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: trip.title,
    destination: trip.destination ?? "",
    summary: trip.summary ?? "",
    kind: trip.kind,
    status: trip.status,
    startsOn: toDateInput(trip.startsOn),
    endsOn: toDateInput(trip.endsOn),
    homeAirportIata: trip.homeAirportIata ?? "",
    partyAdults: trip.partyAdults ?? "",
    partyChildren: trip.partyChildren ?? "",
    budgetTier: trip.budgetTier ?? "",
  });

  function save() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${trip.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title,
            destination: draft.destination || null,
            summary: draft.summary || null,
            kind: draft.kind,
            status: draft.status,
            startsOn: draft.startsOn || null,
            endsOn: draft.endsOn || null,
            homeAirportIata: draft.homeAirportIata.toUpperCase() || null,
            partyAdults:
              draft.partyAdults === "" ? null : Number(draft.partyAdults),
            partyChildren:
              draft.partyChildren === "" ? null : Number(draft.partyChildren),
            budgetTier: draft.budgetTier || null,
          }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not save",
        );
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function quickStatus(value: string) {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${trip.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: value }),
        },
      );
      if (!res.ok) {
        setErr("Could not update status");
        return;
      }
      router.refresh();
    });
  }

  function deleteTrip() {
    if (
      !confirm(
        "Delete this trip and all its notes? This can't be undone. The original intake stays.",
      )
    )
      return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${trip.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        setErr("Could not delete");
        return;
      }
      router.push("/admin/trips");
    });
  }

  if (!editing) {
    const dest = summarizeDestinations(trip.destinations) ?? trip.destination;
    const travelers = summarizeTravelers(
      trip.partyAdults,
      trip.partyChildren,
      trip.partyChildAges,
    );
    const dates = formatDateRange(trip.startsOn, trip.endsOn);
    return (
      <section className="space-y-4">
        {err ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}
        <div className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-ink">
              Trip overview
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={trip.status}
                onChange={(e) => quickStatus(e.target.value)}
                disabled={pending}
                className="rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-semibold"
              >
                {TRIP_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
              >
                Edit details
              </button>
              <button
                type="button"
                onClick={deleteTrip}
                disabled={pending}
                className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </header>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Cell label="Destinations">
              {dest ?? <Empty />}
            </Cell>
            <Cell label="Dates">{dates ?? <Empty />}</Cell>
            <Cell label="Travelers">{travelers ?? <Empty />}</Cell>
            <Cell label="Home airport">
              {trip.homeAirportIata ?? <Empty />}
            </Cell>
            <Cell label="Budget">
              {trip.budgetTier ?? <Empty />}
            </Cell>
            <Cell label="Service">
              {TRIP_KIND_OPTIONS.find((o) => o.value === trip.kind)?.label ??
                trip.kind}
            </Cell>
          </dl>
          {trip.summary ? (
            <p className="mt-5 rounded-xl border border-line bg-canvas/50 px-4 py-3 text-sm text-ink">
              {trip.summary}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm">
      {err ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      ) : null}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          Edit trip details
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={pending}
            className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink-muted hover:bg-canvas"
          >
            Cancel
          </button>
        </div>
      </header>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Trip title">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Service">
          <select
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          >
            {TRIP_KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          >
            {TRIP_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destination (free text)">
          <input
            value={draft.destination}
            onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Earliest departure">
          <input
            type="date"
            value={draft.startsOn}
            onChange={(e) => setDraft({ ...draft, startsOn: e.target.value })}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Latest return">
          <input
            type="date"
            value={draft.endsOn}
            onChange={(e) => setDraft({ ...draft, endsOn: e.target.value })}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Home airport (IATA)">
          <input
            value={draft.homeAirportIata}
            onChange={(e) =>
              setDraft({
                ...draft,
                homeAirportIata: e.target.value.toUpperCase(),
              })
            }
            placeholder="DTW"
            maxLength={3}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-sm uppercase"
          />
        </Field>
        <Field label="Adults">
          <input
            type="number"
            min={0}
            value={draft.partyAdults}
            onChange={(e) =>
              setDraft({ ...draft, partyAdults: e.target.value })
            }
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Children">
          <input
            type="number"
            min={0}
            value={draft.partyChildren}
            onChange={(e) =>
              setDraft({ ...draft, partyChildren: e.target.value })
            }
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Budget tier">
          <input
            value={draft.budgetTier}
            onChange={(e) => setDraft({ ...draft, budgetTier: e.target.value })}
            placeholder="value / mid / luxury / ultra / discuss"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Internal summary" full>
          <textarea
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>
    </section>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

function Field({
  label,
  full = false,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`block text-xs font-semibold text-ink-muted ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Empty() {
  return <span className="text-ink-muted">—</span>;
}
