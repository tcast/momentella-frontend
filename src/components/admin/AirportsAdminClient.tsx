"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPublicAppUrl } from "@/lib/env-public";
import type { AdminAirport } from "@/app/admin/airports/page";

const EMPTY_FORM: {
  iata: string;
  icao: string;
  name: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
} = {
  iata: "",
  icao: "",
  name: "",
  city: "",
  region: "",
  country: "",
  countryCode: "",
};

export function AirportsAdminClient({ initial }: { initial: AdminAirport[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter((a) =>
      [a.iata, a.icao ?? "", a.name, a.city, a.region ?? "", a.country]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [initial, query]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function beginEdit(a: AdminAirport) {
    setEditingId(a.id);
    setForm({
      iata: a.iata,
      icao: a.icao ?? "",
      name: a.name,
      city: a.city,
      region: a.region ?? "",
      country: a.country,
      countryCode: a.countryCode,
    });
    setShowForm(true);
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const url = editingId
        ? `${getPublicAppUrl()}/api/admin/airports/${editingId}`
        : `${getPublicAppUrl()}/api/admin/airports`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setMsg(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not save",
        );
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function toggleActive(a: AdminAirport) {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/airports/${a.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !a.active }),
        },
      );
      if (!res.ok) {
        setMsg("Could not update");
        return;
      }
      router.refresh();
    });
  }

  function remove(a: AdminAirport) {
    if (!confirm(`Delete ${a.iata} — ${a.name}?`)) return;
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/airports/${a.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        setMsg("Could not delete");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {msg ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {msg}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by IATA, city, or country"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
        >
          + Add airport
        </button>
        <span className="text-xs text-ink-muted">
          Showing {filtered.length} of {initial.length}
        </span>
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-ink">
            {editingId ? "Edit airport" : "Add a new airport"}
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Required: IATA (3 letters), name, city, country, country code (2 letters).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-ink-muted">
              IATA (3 letters)
              <input
                value={form.iata}
                onChange={(e) =>
                  setForm({ ...form, iata: e.target.value.toUpperCase() })
                }
                maxLength={3}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-sm uppercase"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              ICAO (optional)
              <input
                value={form.icao}
                onChange={(e) =>
                  setForm({ ...form, icao: e.target.value.toUpperCase() })
                }
                maxLength={4}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-sm uppercase"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted sm:col-span-2">
              Airport name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              City
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              State / region (optional)
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              Country
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              Country code (2-letter, e.g. US)
              <input
                value={form.countryCode}
                onChange={(e) =>
                  setForm({ ...form, countryCode: e.target.value.toUpperCase() })
                }
                maxLength={2}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-sm uppercase"
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => save()}
              disabled={pending}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
            >
              {editingId ? "Save changes" : "Add airport"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white/70">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Airport</th>
              <th className="px-3 py-2">City / region</th>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-line/80 align-top">
                <td className="px-3 py-3 font-mono text-sm font-semibold">
                  {a.iata}
                  {a.icao ? (
                    <span className="ml-1 text-xs text-ink-muted">/ {a.icao}</span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <p className="text-ink">{a.name}</p>
                </td>
                <td className="px-3 py-3 text-sm text-ink-muted">
                  {a.city}
                  {a.region ? `, ${a.region}` : ""}
                </td>
                <td className="px-3 py-3 text-sm">
                  {a.country}{" "}
                  <span className="text-xs text-ink-muted">({a.countryCode})</span>
                </td>
                <td className="px-3 py-3">
                  {a.active ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-ink-muted">
                      Hidden
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(a)}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(a)}
                      disabled={pending}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    >
                      {a.active ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(a)}
                      disabled={pending}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-muted">
                  No matches.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
