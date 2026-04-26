"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type HTMLAttributes } from "react";
import {
  BOOKED_BY_OPTIONS,
  formatTimeRange,
  ITEM_KINDS,
  kindMeta,
  type ItineraryItem,
  type ItemKind,
} from "@/lib/itinerary-schema";
import { ItemKindBadge } from "./ItemKindBadge";

export function ItemCard({
  item,
  onPatch,
  onRemove,
  onDuplicate,
}: {
  item: ItineraryItem;
  onPatch: (patch: Partial<ItineraryItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const sortable = useSortable({ id: item.id });
  const dragProps = {
    ...sortable.attributes,
    ...sortable.listeners,
  } as HTMLAttributes<HTMLButtonElement>;

  const [open, setOpen] = useState(false);
  const time = formatTimeRange(item.startTime, item.endTime);

  return (
    <li
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
      className={`rounded-xl border border-line bg-white shadow-sm ${
        sortable.isDragging ? "opacity-90 ring-2 ring-accent/40" : ""
      }`}
    >
      <header className="flex items-start gap-3 px-3 py-3">
        <button
          type="button"
          {...dragProps}
          aria-label="Drag to reorder"
          className="mt-1 grid h-7 w-7 shrink-0 cursor-grab touch-manipulation place-items-center rounded text-ink-muted hover:bg-canvas hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>
        <ItemKindBadge kind={item.kind} />
        <div className="min-w-0 flex-1">
          <input
            value={item.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            placeholder="Title"
            className="w-full rounded bg-transparent text-base font-semibold text-ink outline-none focus:bg-canvas focus:px-1.5"
          />
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
            {time ? <span>🕒 {time}</span> : null}
            {item.location ? <span>📍 {item.location}</span> : null}
            {item.vendorName ? <span>· {item.vendorName}</span> : null}
            {item.bookedBy ? (
              <BookedByBadge value={item.bookedBy} />
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-ink hover:bg-canvas"
          >
            {open ? "Done" : "Edit"}
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-full border border-line bg-white px-2 py-1 text-[11px] font-semibold text-ink-muted hover:bg-canvas"
            title="Duplicate"
          >
            ⎘
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remove "${item.title}"?`)) onRemove();
            }}
            className="rounded-full border border-red-200 bg-white px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
            title="Remove"
          >
            ×
          </button>
        </div>
      </header>

      {open ? (
        <div className="grid gap-3 border-t border-line/80 bg-canvas/30 px-3 py-3 sm:grid-cols-2">
          <Field label="Type">
            <select
              value={item.kind}
              onChange={(e) =>
                onPatch({ kind: e.target.value as ItemKind })
              }
              className={inputCls}
            >
              {ITEM_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.icon}  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Who books this">
            <select
              value={item.bookedBy ?? ""}
              onChange={(e) =>
                onPatch({
                  bookedBy: (e.target.value || undefined) as
                    | "us"
                    | "them"
                    | "tbd"
                    | undefined,
                })
              }
              className={inputCls}
            >
              <option value="">—</option>
              {BOOKED_BY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" full>
            <textarea
              value={item.description ?? ""}
              onChange={(e) =>
                onPatch({ description: e.target.value || undefined })
              }
              rows={3}
              className={inputCls}
              placeholder={
                item.kind === "lodging"
                  ? "Room type, view, special requests…"
                  : item.kind === "transit"
                    ? "Carrier, flight number, transfer notes…"
                    : "What to expect, dress code, prep…"
              }
            />
          </Field>
          <Field label="Start time">
            <input
              type="time"
              value={item.startTime ?? ""}
              onChange={(e) =>
                onPatch({ startTime: e.target.value || undefined })
              }
              className={inputCls}
            />
          </Field>
          <Field label="End time">
            <input
              type="time"
              value={item.endTime ?? ""}
              onChange={(e) =>
                onPatch({ endTime: e.target.value || undefined })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Location">
            <input
              value={item.location ?? ""}
              onChange={(e) =>
                onPatch({ location: e.target.value || undefined })
              }
              placeholder={
                item.kind === "lodging"
                  ? "Hotel address"
                  : item.kind === "transit"
                    ? "DTW → FCO"
                    : "Address or area"
              }
              className={inputCls}
            />
          </Field>
          <Field label="Vendor / supplier">
            <input
              value={item.vendorName ?? ""}
              onChange={(e) =>
                onPatch({ vendorName: e.target.value || undefined })
              }
              placeholder="Hotel chain, airline, tour co…"
              className={inputCls}
            />
          </Field>
          <Field label="Reference URL (Fora, supplier site…)">
            <input
              value={item.vendorUrl ?? ""}
              onChange={(e) =>
                onPatch({ vendorUrl: e.target.value || undefined })
              }
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
          <Field label="Confirmation #">
            <input
              value={item.bookingRef ?? ""}
              onChange={(e) =>
                onPatch({ bookingRef: e.target.value || undefined })
              }
              className={inputCls}
            />
          </Field>
          <Field label={`Cost (${kindMeta(item.kind).label} estimate)`}>
            <input
              type="number"
              min={0}
              value={item.cost ?? ""}
              onChange={(e) =>
                onPatch({
                  cost:
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value),
                })
              }
              placeholder="USD"
              className={inputCls}
            />
          </Field>
        </div>
      ) : null}
    </li>
  );
}

function BookedByBadge({ value }: { value: "us" | "them" | "tbd" }) {
  const styles =
    value === "us"
      ? "bg-emerald-100 text-emerald-900"
      : value === "them"
        ? "bg-amber-100 text-amber-900"
        : "bg-stone-100 text-stone-700";
  const label =
    value === "us"
      ? "We book"
      : value === "them"
        ? "Client books"
        : "TBD";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}
    >
      {label}
    </span>
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
      className={`block text-[11px] font-semibold text-ink-muted ${
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
