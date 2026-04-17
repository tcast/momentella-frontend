"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPublicAppUrl } from "@/lib/env-public";
import type { AdminDestination } from "@/app/admin/destinations/page";

const TYPE_LABEL: Record<AdminDestination["type"], string> = {
  COUNTRY: "Country",
  REGION: "State / Region",
  CITY: "City",
  AREA: "Area / Region",
  PARK: "Theme park",
  RESORT: "Resort",
  VENUE: "Venue",
};

const TYPE_OPTIONS: AdminDestination["type"][] = [
  "COUNTRY",
  "REGION",
  "CITY",
  "AREA",
  "PARK",
  "RESORT",
  "VENUE",
];

const EMPTY_FORM: {
  slug: string;
  name: string;
  type: AdminDestination["type"];
  country: string;
  region: string;
  aliases: string;
} = {
  slug: "",
  name: "",
  type: "CITY",
  country: "",
  region: "",
  aliases: "",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function DestinationsAdminClient({
  initial,
}: {
  initial: AdminDestination[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.filter((d) => {
      if (typeFilter && d.type !== typeFilter) return false;
      if (!q) return true;
      return [d.name, d.slug, d.country ?? "", d.region ?? "", d.aliases ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [initial, query, typeFilter]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function beginEdit(d: AdminDestination) {
    setEditingId(d.id);
    setForm({
      slug: d.slug,
      name: d.name,
      type: d.type,
      country: d.country ?? "",
      region: d.region ?? "",
      aliases: d.aliases ?? "",
    });
    setShowForm(true);
  }

  function save() {
    setMsg(null);
    const body = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      type: form.type,
      country: form.country || null,
      region: form.region || null,
      aliases: form.aliases || null,
    };
    startTransition(async () => {
      const url = editingId
        ? `${getPublicAppUrl()}/api/admin/destinations/${editingId}`
        : `${getPublicAppUrl()}/api/admin/destinations`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  function toggleActive(d: AdminDestination) {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/destinations/${d.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !d.active }),
        },
      );
      if (!res.ok) {
        setMsg("Could not update");
        return;
      }
      router.refresh();
    });
  }

  function remove(d: AdminDestination) {
    if (!confirm(`Delete ${d.name}?`)) return;
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/destinations/${d.id}`,
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
          placeholder="Search destinations, aliases, country"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
        >
          + Add destination
        </button>
        <span className="text-xs text-ink-muted">
          Showing {filtered.length} of {initial.length}
        </span>
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-ink">
            {editingId ? "Edit destination" : "Add a new destination"}
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Name and type are required. Aliases are optional — comma-separated
            search keywords guests might type (e.g. “WDW, Disney, Magic Kingdom”).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-ink-muted sm:col-span-2">
              Display name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editingId
                      ? form.slug
                      : form.slug || slugify(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              Type
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as AdminDestination["type"],
                  })
                }
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-ink-muted">
              Internal slug
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: slugify(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-xs"
              />
            </label>
            <label className="text-xs font-medium text-ink-muted">
              Country (optional)
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
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
            <label className="text-xs font-medium text-ink-muted sm:col-span-2">
              Aliases (comma-separated)
              <input
                value={form.aliases}
                onChange={(e) => setForm({ ...form, aliases: e.target.value })}
                placeholder="e.g. WDW, Disney, Magic Kingdom"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => save()}
              disabled={pending || !form.name}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
            >
              {editingId ? "Save changes" : "Add destination"}
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
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Aliases</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-line/80 align-top">
                <td className="px-3 py-3">
                  <p className="text-ink">{d.name}</p>
                  <p className="font-mono text-[10px] text-ink-muted">
                    {d.slug}
                  </p>
                </td>
                <td className="px-3 py-3 text-xs">
                  <span className="rounded-full bg-canvas px-2 py-0.5 font-semibold text-ink-muted">
                    {TYPE_LABEL[d.type]}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-ink-muted">
                  {[d.region, d.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-3 py-3 text-xs text-ink-muted">
                  {d.aliases || "—"}
                </td>
                <td className="px-3 py-3">
                  {d.active ? (
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
                      onClick={() => beginEdit(d)}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(d)}
                      disabled={pending}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    >
                      {d.active ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(d)}
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
