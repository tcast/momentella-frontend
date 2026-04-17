"use client";

import { useState } from "react";
import type { FormFieldType } from "@/lib/intake-schema";

type Tile = {
  type: FormFieldType;
  title: string;
  blurb: string;
};

const TILES: Tile[] = [
  {
    type: "section",
    title: "Section title",
    blurb: "A heading that groups questions below it",
  },
  { type: "text", title: "Short answer", blurb: "One line of text" },
  { type: "textarea", title: "Long answer", blurb: "Multiple lines" },
  { type: "email", title: "Email", blurb: "Collect an email address" },
  { type: "tel", title: "Phone", blurb: "Phone number" },
  { type: "number", title: "Number", blurb: "A numeric answer" },
  { type: "date", title: "Date", blurb: "Pick a date from a calendar" },
  {
    type: "select",
    title: "Dropdown",
    blurb: "One answer from a list you define",
  },
  {
    type: "multiselect",
    title: "Multiple choice",
    blurb: "Several answers from a list",
  },
  {
    type: "checkbox",
    title: "Single checkbox",
    blurb: 'One yes/no or "I agree" style',
  },
  {
    type: "travel_party",
    title: "Who’s traveling",
    blurb: "Adults, children, and optional child ages",
  },
];

export function AddFieldPicker({
  onPick,
}: {
  onPick: (type: FormFieldType) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 py-4 text-center text-base font-semibold text-ink transition hover:border-accent hover:bg-accent/10 sm:max-w-md"
      >
        + Add a question or section
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-canvas p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="add-field-title"
          >
            <h3
              id="add-field-title"
              className="font-display text-xl font-semibold text-ink"
            >
              What do you want to add?
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Tap an option. You can change the wording afterward.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {TILES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => {
                    onPick(t.type);
                    setOpen(false);
                  }}
                  className="rounded-xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-accent/50 hover:shadow-md"
                >
                  <span className="block font-semibold text-ink">{t.title}</span>
                  <span className="mt-1 block text-xs text-ink-muted">
                    {t.blurb}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full border border-line py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
