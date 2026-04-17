"use client";

import { useState } from "react";
import type { FormField, FormFieldType } from "@/lib/intake-schema";
import { PRESET_TEMPLATES } from "./preset-templates";

type Tile = {
  type: FormFieldType;
  title: string;
  blurb: string;
};

const BASIC_TILES: Tile[] = [
  { type: "section", title: "Section title", blurb: "A heading that groups questions below it" },
  { type: "text", title: "Short answer", blurb: "One line of text" },
  { type: "textarea", title: "Long answer", blurb: "Multiple lines" },
  { type: "email", title: "Email", blurb: "Collect an email address" },
  { type: "tel", title: "Phone", blurb: "Phone number" },
  { type: "number", title: "Number", blurb: "A numeric answer" },
  { type: "date", title: "Date", blurb: "Pick a date from a calendar" },
  { type: "select", title: "Dropdown", blurb: "One answer from a list you define" },
  { type: "multiselect", title: "Multiple choice", blurb: "Several answers from a list" },
  { type: "checkbox", title: "Single checkbox", blurb: 'One yes/no or "I agree" style' },
  { type: "travel_party", title: "Who’s traveling", blurb: "Adults, children, and optional child ages" },
  { type: "airport", title: "Home airport", blurb: "Searchable — guests type their city or 3-letter code" },
  { type: "destination", title: "Destination picker", blurb: "Searchable catalog of cities, countries, parks…" },
];

export function AddFieldPicker({
  onPickType,
  onInsertField,
}: {
  onPickType: (type: FormFieldType) => void;
  onInsertField: (field: FormField) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"popular" | "basic">("popular");

  function pickType(t: FormFieldType) {
    onPickType(t);
    setOpen(false);
  }

  function pickPreset(key: string) {
    const t = PRESET_TEMPLATES.find((p) => p.key === key);
    if (!t) return;
    onInsertField(t.build());
    setOpen(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setTab("popular");
          setOpen(true);
        }}
        className="w-full rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 py-4 text-center text-base font-semibold text-ink transition hover:border-accent hover:bg-accent/10 sm:max-w-md"
      >
        + Add a question or section
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl"
            role="dialog"
            aria-labelledby="add-field-title"
          >
            <div className="border-b border-line px-6 pt-6 pb-4">
              <h3
                id="add-field-title"
                className="font-display text-xl font-semibold text-ink"
              >
                What do you want to add?
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Pick a ready-made question from <strong>Popular travel questions</strong>,
                or build a <strong>Basic field</strong> from scratch. You can edit the
                wording afterward.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab("popular")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    tab === "popular"
                      ? "bg-ink text-canvas"
                      : "border border-line bg-white text-ink"
                  }`}
                >
                  Popular travel questions
                </button>
                <button
                  type="button"
                  onClick={() => setTab("basic")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    tab === "basic"
                      ? "bg-ink text-canvas"
                      : "border border-line bg-white text-ink"
                  }`}
                >
                  Basic fields
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {tab === "popular" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {PRESET_TEMPLATES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => pickPreset(t.key)}
                      className="rounded-xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-accent/50 hover:shadow-md"
                    >
                      <span className="block font-semibold text-ink">
                        {t.title}
                      </span>
                      <span className="mt-1 block text-xs text-ink-muted">
                        {t.blurb}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {BASIC_TILES.map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => pickType(t.type)}
                      className="rounded-xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-accent/50 hover:shadow-md"
                    >
                      <span className="block font-semibold text-ink">
                        {t.title}
                      </span>
                      <span className="mt-1 block text-xs text-ink-muted">
                        {t.blurb}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-line px-6 py-4">
              <button
                type="button"
                className="w-full rounded-full border border-line py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
