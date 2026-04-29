"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  applyAutoDates,
  emptyItinerary,
  ITINERARY_SCHEMA_VERSION,
  newDay,
  newId,
  type ItineraryDay,
  type ItinerarySchema,
} from "@/lib/itinerary-schema";
import { getPublicAppUrl } from "@/lib/env-public";
import { PublishProposalButton } from "@/components/trip/PublishProposalButton";
import { DayCard } from "./DayCard";
import { ItineraryRenderer } from "./ItineraryRenderer";

export function ItineraryBuilderClient({
  tripId,
  tripTitle,
  startsOn,
  initialSchema,
  latestProposalVersion,
  itineraryDaysAllowed,
}: {
  tripId: string;
  tripTitle: string;
  startsOn: string | null;
  initialSchema: ItinerarySchema | null;
  latestProposalVersion: number | null;
  itineraryDaysAllowed?: number | null;
}) {
  const router = useRouter();
  const [schema, setSchema] = useState<ItinerarySchema>(
    initialSchema ?? emptyItinerary(),
  );
  const [tab, setTab] = useState<"build" | "preview">("build");
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const days = useMemo(() => schema.days, [schema.days]);

  function handleDayDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = days.findIndex((d) => d.id === active.id);
    const newIndex = days.findIndex((d) => d.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setSchema((s) => ({ ...s, days: arrayMove(s.days, oldIndex, newIndex) }));
  }

  function patchDay(id: string, patch: Partial<ItineraryDay>) {
    setSchema((s) => ({
      ...s,
      days: s.days.map((d) =>
        d.id === id ? ({ ...d, ...patch } as ItineraryDay) : d,
      ),
    }));
  }
  function removeDay(id: string) {
    setSchema((s) => ({ ...s, days: s.days.filter((d) => d.id !== id) }));
  }
  function duplicateDay(id: string) {
    setSchema((s) => {
      const idx = s.days.findIndex((d) => d.id === id);
      if (idx < 0) return s;
      const orig = s.days[idx]!;
      const copy: ItineraryDay = {
        ...orig,
        id: newId("day"),
        items: orig.items.map((i) => ({ ...i, id: newId("item") })),
      };
      const out = [...s.days];
      out.splice(idx + 1, 0, copy);
      return { ...s, days: out };
    });
  }
  function moveDay(id: string, dir: -1 | 1) {
    setSchema((s) => {
      const idx = s.days.findIndex((d) => d.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= s.days.length) return s;
      const out = [...s.days];
      const tmp = out[idx]!;
      out[idx] = out[next]!;
      out[next] = tmp;
      return { ...s, days: out };
    });
  }
  function addDay() {
    setSchema((s) => ({ ...s, days: [...s.days, newDay()] }));
  }
  function autoDates() {
    if (!startsOn) {
      setErr("Set the trip's earliest departure date first to auto-fill.");
      return;
    }
    setErr(null);
    setSchema((s) => ({ ...s, days: applyAutoDates(s.days, startsOn) }));
  }

  function save() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${tripId}/itinerary`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Save failed",
        );
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  const totalItems = days.reduce((acc, d) => acc + d.items.length, 0);
  const overCap =
    typeof itineraryDaysAllowed === "number" &&
    days.length > itineraryDaysAllowed;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-gradient-to-b from-white to-canvas/80 p-6 shadow-sm">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
          Build the trip day-by-day. <strong>Drag any day</strong> to reorder.
          Inside each day, <strong>add items</strong> for lodging, transit,
          activities, meals, or notes — drag those too. The client sees this on
          their portal once you save.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-ink-muted">
            {schema.version === ITINERARY_SCHEMA_VERSION ? null : null}
            {days.length} day{days.length === 1 ? "" : "s"}
            {typeof itineraryDaysAllowed === "number"
              ? ` of ${itineraryDaysAllowed} purchased`
              : ""}
            {" · "}
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </span>
          {overCap ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
              Over the purchased {itineraryDaysAllowed}-day plan
            </span>
          ) : null}
          <button
            type="button"
            onClick={addDay}
            className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
          >
            + Add a day
          </button>
          {startsOn ? (
            <button
              type="button"
              onClick={autoDates}
              className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
            >
              Auto-fill dates from start
            </button>
          ) : null}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="ml-auto rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save itinerary"}
          </button>
          {savedAt ? (
            <span className="text-[11px] text-ink-muted">
              Saved {new Date(savedAt).toLocaleTimeString()}
            </span>
          ) : null}
          <PublishProposalButton
            tripId={tripId}
            hasItinerary={days.length > 0}
            latestVersion={latestProposalVersion}
          />
        </div>
        {err ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 rounded-full border border-line bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("build")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "build"
              ? "bg-ink text-canvas shadow"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Build
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "preview"
              ? "bg-ink text-canvas shadow"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Preview as the client sees it
        </button>
      </div>

      {tab === "preview" ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="border-b border-line bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-950">
            Preview — this is how the client will see this itinerary on their
            portal.
          </div>
          <ItineraryRenderer schema={schema} tripTitle={tripTitle} />
        </div>
      ) : (
        <>
          <div>
            <label className="text-xs font-semibold text-ink-muted">
              Itinerary intro (optional, shows above Day 1)
            </label>
            <textarea
              value={schema.summary ?? ""}
              onChange={(e) =>
                setSchema({ ...schema, summary: e.target.value || undefined })
              }
              rows={2}
              placeholder="A short note from the team about this trip…"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm"
            />
          </div>

          {days.length === 0 ? (
            <button
              type="button"
              onClick={addDay}
              className="grid w-full place-items-center rounded-3xl border-2 border-dashed border-line bg-canvas/50 py-16 text-center"
            >
              <div>
                <p className="font-display text-xl font-medium text-ink">
                  Empty itinerary
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Click to add your first day.
                </p>
                <span className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas">
                  + Add Day 1
                </span>
              </div>
            </button>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDayDragEnd}
            >
              <SortableContext
                items={days.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <ol className="space-y-4">
                  {days.map((day, idx) => (
                    <DayCard
                      key={day.id}
                      day={day}
                      index={idx}
                      total={days.length}
                      onPatch={(p) => patchDay(day.id, p)}
                      onRemove={() => removeDay(day.id)}
                      onDuplicate={() => duplicateDay(day.id)}
                      onMoveUp={() => moveDay(day.id, -1)}
                      onMoveDown={() => moveDay(day.id, 1)}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
          )}

          {days.length > 0 ? (
            <button
              type="button"
              onClick={addDay}
              className="w-full rounded-2xl border-2 border-dashed border-line bg-canvas/40 py-4 text-sm font-semibold text-ink-muted hover:border-accent/60 hover:text-ink"
            >
              + Add a day
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
