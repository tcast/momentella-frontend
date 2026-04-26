"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type HTMLAttributes } from "react";
import {
  formatDayDate,
  newItem,
  type ItineraryDay,
  type ItineraryItem,
  type ItemKind,
} from "@/lib/itinerary-schema";
import { AddItemMenu } from "./AddItemMenu";
import { ItemCard } from "./ItemCard";

export function DayCard({
  day,
  index,
  total,
  onPatch,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  day: ItineraryDay;
  index: number;
  total: number;
  onPatch: (patch: Partial<ItineraryDay>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const sortable = useSortable({ id: day.id });
  const dragProps = {
    ...sortable.attributes,
    ...sortable.listeners,
  } as HTMLAttributes<HTMLButtonElement>;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function patchItem(itemId: string, patch: Partial<ItineraryItem>) {
    onPatch({
      items: day.items.map((i) =>
        i.id === itemId ? ({ ...i, ...patch } as ItineraryItem) : i,
      ),
    });
  }
  function removeItem(itemId: string) {
    onPatch({ items: day.items.filter((i) => i.id !== itemId) });
  }
  function duplicateItem(itemId: string) {
    const idx = day.items.findIndex((i) => i.id === itemId);
    if (idx < 0) return;
    const orig = day.items[idx]!;
    const copy: ItineraryItem = {
      ...orig,
      id: `item_${Math.random().toString(36).slice(2, 10)}`,
    };
    const next = [...day.items];
    next.splice(idx + 1, 0, copy);
    onPatch({ items: next });
  }
  function addItem(kind: ItemKind) {
    onPatch({ items: [...day.items, newItem(kind)] });
  }
  function handleItemDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = day.items.findIndex((i) => i.id === active.id);
    const newIndex = day.items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onPatch({ items: arrayMove(day.items, oldIndex, newIndex) });
  }

  const dateLabel = formatDayDate(day.date);

  return (
    <article
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
      className={`rounded-2xl border border-line bg-white/80 shadow-sm ${
        sortable.isDragging ? "z-30 opacity-95 ring-2 ring-accent/40" : ""
      }`}
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-line/80 bg-canvas/40 px-4 py-3">
        <button
          type="button"
          {...dragProps}
          aria-label="Drag day"
          className="mt-1 grid h-9 w-9 cursor-grab touch-manipulation place-items-center rounded-lg border border-line bg-white text-ink-muted shadow-sm hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Day {index + 1}
            </span>
            <input
              type="date"
              value={day.date ?? ""}
              onChange={(e) =>
                onPatch({ date: e.target.value || undefined })
              }
              className="rounded border border-line bg-white px-2 py-0.5 text-[11px] text-ink-muted"
            />
            {dateLabel ? (
              <span className="text-[11px] text-ink-muted">
                · {dateLabel}
              </span>
            ) : null}
          </div>
          <input
            value={day.title ?? ""}
            onChange={(e) =>
              onPatch({ title: e.target.value || undefined })
            }
            placeholder="Day title (e.g. Arrival in Rome)"
            className="mt-1 w-full rounded bg-transparent font-display text-xl font-semibold text-ink outline-none focus:bg-canvas focus:px-1.5"
          />
          <textarea
            value={day.summary ?? ""}
            onChange={(e) =>
              onPatch({ summary: e.target.value || undefined })
            }
            placeholder="Optional one-liner about this day"
            rows={1}
            className="mt-1 w-full resize-none rounded bg-transparent text-sm text-ink-muted outline-none focus:bg-canvas focus:px-1.5"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
          >
            Up
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
          >
            Down
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remove Day ${index + 1}?`)) onRemove();
            }}
            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </header>

      <div className="space-y-2 p-4">
        {day.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-canvas/40 px-4 py-3 text-center text-xs text-ink-muted">
            Nothing planned for this day yet.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleItemDragEnd}
          >
            <SortableContext
              items={day.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {day.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onPatch={(p) => patchItem(item.id, p)}
                    onRemove={() => removeItem(item.id)}
                    onDuplicate={() => duplicateItem(item.id)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <div className="pt-1">
          <AddItemMenu onPick={addItem} />
        </div>
      </div>
    </article>
  );
}
