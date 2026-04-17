"use client";

import type { HTMLAttributes } from "react";
import type { FormField } from "@/lib/intake-schema";
import { OptionListEditor } from "./OptionListEditor";

const FRIENDLY_TYPE: Record<FormField["type"], string> = {
  section: "Section heading",
  text: "Short answer",
  email: "Email",
  tel: "Phone",
  textarea: "Long answer",
  number: "Number",
  date: "Date",
  select: "Dropdown — pick one",
  multiselect: "Multiple choice",
  checkbox: "Checkbox",
  travel_party: "Who’s traveling",
  airport: "Airport picker (searchable)",
  destination: "Destination picker (searchable)",
};

type Props = {
  field: FormField;
  index: number;
  dragProps: HTMLAttributes<HTMLButtonElement>;
  onPatch: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function FormBuilderQuestionCard({
  field,
  dragProps,
  onPatch,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  const friendly = FRIENDLY_TYPE[field.type];

  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-start gap-3 border-b border-line/80 bg-canvas/40 px-4 py-3">
        <button
          type="button"
          className="mt-1 flex h-10 w-10 shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-lg border border-line bg-white text-ink-muted shadow-sm hover:text-ink"
          {...dragProps}
          aria-label="Drag to reorder"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {friendly}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-ink disabled:opacity-40"
          >
            Up
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-ink disabled:opacity-40"
          >
            Down
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-semibold text-ink">
            {field.type === "section" ? "Title shown to guests" : "Question or label"}
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onPatch({ label: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-base text-ink placeholder:text-ink-muted/70"
            placeholder={
              field.type === "section"
                ? "e.g. About your trip"
                : "e.g. Where do you want to go?"
            }
          />
        </div>

        {field.type !== "checkbox" && field.type !== "section" ? (
          <div>
            <label className="block text-sm font-semibold text-ink">
              Help text <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={field.description ?? ""}
              onChange={(e) =>
                onPatch({ description: e.target.value || undefined })
              }
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink"
              placeholder="Extra guidance under the question"
            />
          </div>
        ) : null}

        {field.type === "section" && (
          <div>
            <label className="block text-sm font-semibold text-ink">
              Intro <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={field.description ?? ""}
              onChange={(e) =>
                onPatch({ description: e.target.value || undefined })
              }
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink"
              placeholder="A sentence under the section title"
            />
          </div>
        )}

        {field.type !== "section" ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas/60 px-3 py-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line text-accent"
              checked={!!field.required}
              onChange={(e) => onPatch({ required: e.target.checked })}
            />
            <span className="text-sm font-medium text-ink">
              Guests must answer this before submitting
            </span>
          </label>
        ) : null}

        {(field.type === "select" || field.type === "multiselect") && (
          <OptionListEditor
            options={field.options}
            multi={field.type === "multiselect"}
            onChange={(options) => onPatch({ options })}
          />
        )}

        {field.type === "number" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink-muted">
                Smallest allowed number
              </label>
              <input
                type="number"
                value={field.min ?? ""}
                onChange={(e) =>
                  onPatch({
                    min:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted">
                Largest allowed number
              </label>
              <input
                type="number"
                value={field.max ?? ""}
                onChange={(e) =>
                  onPatch({
                    max:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {field.type === "airport" && (
          <p className="rounded-lg border border-dashed border-line bg-canvas/50 px-3 py-2 text-xs text-ink-muted">
            Guests will get a live search box that finds airports by city name,
            airport name, or 3-letter code (e.g. <strong>DTW</strong> → Detroit).
            Manage the list under <strong>Admin → Airports</strong>.
          </p>
        )}

        {field.type === "destination" && (
          <div className="space-y-3 rounded-xl border border-dashed border-line bg-canvas/40 p-4">
            <p className="text-xs text-ink-muted">
              Guests search a catalog of countries, states, cities, parks, and
              resorts. Manage the list under <strong>Admin → Destinations</strong>.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!field.allowMultiple}
                onChange={(e) =>
                  onPatch({ allowMultiple: e.target.checked })
                }
              />
              Let guests pick more than one destination
            </label>
          </div>
        )}

        {field.type === "travel_party" && (
          <div className="space-y-3 rounded-xl border border-dashed border-line bg-canvas/40 p-4">
            <p className="text-sm font-semibold text-ink">Travel party options</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.collectChildAges}
                onChange={(e) =>
                  onPatch({ collectChildAges: e.target.checked })
                }
              />
              Ask for each child’s age when there are children
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-ink-muted">Min adults</label>
                <input
                  type="number"
                  min={1}
                  value={field.minAdults ?? 1}
                  onChange={(e) =>
                    onPatch({ minAdults: Number(e.target.value) || 1 })
                  }
                  className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted">Max adults</label>
                <input
                  type="number"
                  min={1}
                  value={field.maxAdults ?? 12}
                  onChange={(e) =>
                    onPatch({ maxAdults: Number(e.target.value) || 12 })
                  }
                  className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted">Max children</label>
                <input
                  type="number"
                  min={0}
                  value={field.maxChildren ?? 10}
                  onChange={(e) =>
                    onPatch({ maxChildren: Number(e.target.value) ?? 10 })
                  }
                  className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <details className="rounded-lg border border-line/80 bg-canvas/30">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink-muted">
            Technical details (only if something breaks)
          </summary>
          <div className="border-t border-line/80 px-3 py-3">
            {field.type !== "section" ? (
              <label className="block text-xs text-ink-muted">
                Internal field code — don’t change unless support asked you to
                <input
                  type="text"
                  value={field.id}
                  onChange={(e) =>
                    onPatch({ id: e.target.value } as Partial<FormField>)
                  }
                  className="mt-1 w-full rounded border border-line font-mono text-xs text-ink"
                />
              </label>
            ) : (
              <p className="text-xs text-ink-muted">
                Section headings don’t need a code.
              </p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
