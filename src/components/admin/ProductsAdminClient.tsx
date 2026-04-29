"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";
import { formatPrice } from "@/lib/commerce-display";
import type { AdminProduct } from "@/app/admin/products/page";

export function ProductsAdminClient({
  initial,
}: {
  initial: AdminProduct[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    description: string;
    priceDollars: string;
    itineraryDays: string;
    active: boolean;
    sortOrder: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function beginEdit(p: AdminProduct) {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      description: p.description ?? "",
      priceDollars: (p.priceCents / 100).toFixed(2),
      itineraryDays: p.itineraryDays?.toString() ?? "",
      active: p.active,
      sortOrder: String(p.sortOrder),
    });
    setErr(null);
  }
  function cancel() {
    setEditingId(null);
    setDraft(null);
  }

  function save() {
    if (!editingId || !draft) return;
    setErr(null);
    const dollars = Number(draft.priceDollars);
    if (!Number.isFinite(dollars) || dollars < 0) {
      setErr("Price must be a non-negative number.");
      return;
    }
    const priceCents = Math.round(dollars * 100);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/products/${editingId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name.trim(),
            description: draft.description.trim() || null,
            priceCents,
            itineraryDays: draft.itineraryDays
              ? Number(draft.itineraryDays)
              : null,
            active: draft.active,
            sortOrder: Number(draft.sortOrder) || 0,
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
      cancel();
      router.refresh();
    });
  }

  function toggleActive(p: AdminProduct) {
    startTransition(async () => {
      await fetch(`${getPublicAppUrl()}/api/admin/products/${p.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      router.refresh();
    });
  }

  function syncStripe(p: AdminProduct) {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/products/${p.id}/sync-stripe`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        setErr("Stripe sync failed — check API keys.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      ) : null}
      {initial.map((p) => {
        const editing = editingId === p.id;
        return (
          <div
            key={p.id}
            className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm"
          >
            {editing && draft ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" full>
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Description (shown on /services)" full>
                  <textarea
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                    rows={3}
                    className={inputCls}
                  />
                </Field>
                <Field label="Price (USD)">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draft.priceDollars}
                    onChange={(e) =>
                      setDraft({ ...draft, priceDollars: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Itinerary days included">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={draft.itineraryDays}
                    onChange={(e) =>
                      setDraft({ ...draft, itineraryDays: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Sort order (lower = first)">
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({ ...draft, sortOrder: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Active">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(e) =>
                        setDraft({ ...draft, active: e.target.checked })
                      }
                    />
                    Visible at /services
                  </label>
                </Field>
                <div className="flex gap-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={save}
                    disabled={pending}
                    className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Save (and sync Stripe)"}
                  </button>
                  <button
                    type="button"
                    onClick={cancel}
                    className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {p.name}
                    {p.active ? null : (
                      <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                        Hidden
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-ink-muted">
                    {p.slug}
                    {p.itineraryDays
                      ? ` · ${p.itineraryDays} day${p.itineraryDays === 1 ? "" : "s"}`
                      : ""}
                    {p.stripePriceId ? ` · ${p.stripePriceId}` : " · not synced"}
                  </p>
                  {p.description ? (
                    <p className="mt-2 text-sm text-ink-muted">
                      {p.description}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold text-ink">
                    {formatPrice(p.priceCents)}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(p)}
                      className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink hover:bg-canvas"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      disabled={pending}
                      className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink hover:bg-canvas"
                    >
                      {p.active ? "Hide" : "Show"}
                    </button>
                    {!p.stripePriceId ? (
                      <button
                        type="button"
                        onClick={() => syncStripe(p)}
                        disabled={pending}
                        className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas hover:bg-accent-deep"
                      >
                        Sync to Stripe
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
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

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink";
