"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";
import {
  BOOKING_KIND_ICON,
  BOOKING_KIND_LABEL,
  BOOKING_KIND_OPTIONS,
  BOOKING_STATUS_OPTIONS,
  formatBookingDateRange,
  formatCurrency,
  statusBadge,
} from "@/lib/booking-display";

export type AdminBooking = {
  id: string;
  kind: string;
  status: string;
  title: string;
  vendorName: string | null;
  vendorUrl: string | null;
  bookingRef: string | null;
  bookedBy: string | null;
  startDate: string | null;
  endDate: string | null;
  cost: number | null;
  costNotes: string | null;
  description: string | null;
  notes: string | null;
};

const EMPTY_FORM: BookingDraft = {
  kind: "LODGING",
  status: "DRAFT",
  title: "",
  vendorName: "",
  vendorUrl: "",
  bookingRef: "",
  bookedBy: "us",
  startDate: "",
  endDate: "",
  cost: "",
  costNotes: "",
  description: "",
  notes: "",
};

interface BookingDraft {
  kind: string;
  status: string;
  title: string;
  vendorName: string;
  vendorUrl: string;
  bookingRef: string;
  bookedBy: string;
  startDate: string;
  endDate: string;
  cost: string;
  costNotes: string;
  description: string;
  notes: string;
}

function toDraft(b: AdminBooking): BookingDraft {
  return {
    kind: b.kind,
    status: b.status,
    title: b.title,
    vendorName: b.vendorName ?? "",
    vendorUrl: b.vendorUrl ?? "",
    bookingRef: b.bookingRef ?? "",
    bookedBy: b.bookedBy ?? "",
    startDate: b.startDate ? b.startDate.slice(0, 10) : "",
    endDate: b.endDate ? b.endDate.slice(0, 10) : "",
    cost: b.cost === null || b.cost === undefined ? "" : String(b.cost),
    costNotes: b.costNotes ?? "",
    description: b.description ?? "",
    notes: b.notes ?? "",
  };
}

function draftToBody(d: BookingDraft) {
  return {
    kind: d.kind,
    status: d.status,
    title: d.title.trim(),
    vendorName: d.vendorName.trim() || null,
    vendorUrl: d.vendorUrl.trim() || null,
    bookingRef: d.bookingRef.trim() || null,
    bookedBy: d.bookedBy || null,
    startDate: d.startDate || null,
    endDate: d.endDate || null,
    cost: d.cost === "" ? null : Number(d.cost),
    costNotes: d.costNotes.trim() || null,
    description: d.description.trim() || null,
    notes: d.notes.trim() || null,
  };
}

export function BookingsSection({
  tripId,
  bookings,
}: {
  tripId: string;
  bookings: AdminBooking[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_FORM);

  function beginCreate() {
    setEditingId(null);
    setDraft(EMPTY_FORM);
    setCreating(true);
    setErr(null);
  }
  function beginEdit(b: AdminBooking) {
    setCreating(false);
    setDraft(toDraft(b));
    setEditingId(b.id);
    setErr(null);
  }
  function cancel() {
    setCreating(false);
    setEditingId(null);
    setDraft(EMPTY_FORM);
    setErr(null);
  }

  function save() {
    setErr(null);
    if (!draft.title.trim()) {
      setErr("Title is required.");
      return;
    }
    const body = draftToBody(draft);
    const url = editingId
      ? `${getPublicAppUrl()}/api/admin/trips/${tripId}/bookings/${editingId}`
      : `${getPublicAppUrl()}/api/admin/trips/${tripId}/bookings`;
    startTransition(async () => {
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  function remove(id: string) {
    if (!confirm("Delete this booking? Linked documents stay (unattached).")) {
      return;
    }
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${tripId}/bookings/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        setErr("Could not delete");
        return;
      }
      router.refresh();
    });
  }

  const totals = bookings.reduce<Record<string, number>>(
    (acc, b) => {
      if (b.cost === null) return acc;
      acc[b.status] = (acc[b.status] ?? 0) + b.cost;
      acc.TOTAL = (acc.TOTAL ?? 0) + b.cost;
      return acc;
    },
    {},
  );

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            Bookings
          </h3>
          <p className="text-xs text-ink-muted">
            Source of truth for what’s actually reserved. Cost stays internal.
          </p>
        </div>
        <button
          type="button"
          onClick={beginCreate}
          className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
        >
          + Add booking
        </button>
      </header>

      {bookings.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-canvas/40 px-4 py-3 text-xs">
          <span className="font-semibold text-ink">Total cost</span>
          <span className="text-ink-muted">·</span>
          <span className="font-semibold">{formatCurrency(totals.TOTAL ?? 0)}</span>
          <span className="text-ink-muted">·</span>
          <span>
            <span className="font-semibold text-emerald-700">
              {formatCurrency(totals.CONFIRMED ?? 0)}
            </span>{" "}
            confirmed
          </span>
          {totals.PENDING ? (
            <>
              <span className="text-ink-muted">·</span>
              <span>
                <span className="font-semibold text-amber-700">
                  {formatCurrency(totals.PENDING ?? 0)}
                </span>{" "}
                pending
              </span>
            </>
          ) : null}
          {totals.DRAFT ? (
            <>
              <span className="text-ink-muted">·</span>
              <span>
                <span className="font-semibold text-stone-700">
                  {formatCurrency(totals.DRAFT ?? 0)}
                </span>{" "}
                draft
              </span>
            </>
          ) : null}
        </div>
      ) : null}

      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      ) : null}

      {creating || editingId ? (
        <BookingForm
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancel}
          pending={pending}
          isEdit={!!editingId}
        />
      ) : null}

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-6 text-center text-sm text-ink-muted">
          No bookings yet. Click <strong>+ Add booking</strong> when you start
          reserving things.
        </p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => {
            const sb = statusBadge(b.status);
            const dates = formatBookingDateRange(b.startDate, b.endDate);
            return (
              <li
                key={b.id}
                className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas text-base"
                  >
                    {BOOKING_KIND_ICON[b.kind] ?? "•"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-display text-base font-semibold text-ink">
                        {b.title}
                      </p>
                      <span className={sb.className}>{sb.label}</span>
                      <span className="text-[11px] uppercase tracking-wider text-ink-muted">
                        {BOOKING_KIND_LABEL[b.kind] ?? b.kind}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                      {dates ? <span>{dates}</span> : null}
                      {b.vendorName ? <span>· {b.vendorName}</span> : null}
                      {b.bookingRef ? (
                        <span>
                          · Ref{" "}
                          <span className="font-mono text-ink">
                            {b.bookingRef}
                          </span>
                        </span>
                      ) : null}
                      {b.cost !== null ? (
                        <span>
                          · {formatCurrency(b.cost)}
                          {b.costNotes ? (
                            <span className="text-ink-muted/80">
                              {" "}
                              ({b.costNotes})
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                      {b.bookedBy === "them" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Client books
                        </span>
                      ) : null}
                    </div>
                    {b.description ? (
                      <p className="mt-2 text-sm text-ink">{b.description}</p>
                    ) : null}
                    {b.notes ? (
                      <p className="mt-2 rounded-lg bg-canvas/60 px-3 py-1.5 text-xs text-ink-muted">
                        <span className="font-semibold">Internal: </span>
                        {b.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {b.vendorUrl ? (
                      <a
                        href={b.vendorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-accent hover:bg-canvas"
                      >
                        Open ↗
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => beginEdit(b)}
                      className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-ink hover:bg-canvas"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(b.id)}
                      className="rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function BookingForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  pending,
  isEdit,
}: {
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h4 className="font-display text-base font-semibold text-ink">
        {isEdit ? "Edit booking" : "Add a booking"}
      </h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Type">
          <select
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            className={inputCls}
          >
            {BOOKING_KIND_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {BOOKING_KIND_ICON[k]}  {BOOKING_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            className={inputCls}
          >
            {BOOKING_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0)}
                {s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title" full>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="e.g. Hay-Adams hotel"
            className={inputCls}
          />
        </Field>
        <Field label="Vendor / supplier">
          <input
            value={draft.vendorName}
            onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })}
            placeholder="Hotel chain, airline, tour co…"
            className={inputCls}
          />
        </Field>
        <Field label="Vendor URL (Fora link, etc.)">
          <input
            value={draft.vendorUrl}
            onChange={(e) => setDraft({ ...draft, vendorUrl: e.target.value })}
            placeholder="https://…"
            className={inputCls}
          />
        </Field>
        <Field label="Confirmation #">
          <input
            value={draft.bookingRef}
            onChange={(e) => setDraft({ ...draft, bookingRef: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Who books">
          <select
            value={draft.bookedBy}
            onChange={(e) => setDraft({ ...draft, bookedBy: e.target.value })}
            className={inputCls}
          >
            <option value="">—</option>
            <option value="us">Momentella books</option>
            <option value="them">Client books</option>
          </select>
        </Field>
        <Field label="Start / check-in">
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="End / check-out">
          <input
            type="date"
            value={draft.endDate}
            onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Cost (USD)">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            value={draft.cost}
            onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Cost notes">
          <input
            value={draft.costNotes}
            onChange={(e) => setDraft({ ...draft, costNotes: e.target.value })}
            placeholder="per person · total · 5 nights…"
            className={inputCls}
          />
        </Field>
        <Field label="Description (visible to client)" full>
          <textarea
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            rows={2}
            className={inputCls}
            placeholder="Friendly description that shows on the family's portal."
          />
        </Field>
        <Field label="Internal notes (admin only)" full>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={2}
            className={inputCls}
            placeholder="Whatever helps you and your team."
          />
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Add booking"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
        >
          Cancel
        </button>
      </div>
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
