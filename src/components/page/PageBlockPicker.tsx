"use client";

import { useState } from "react";
import {
  BLOCK_DESCRIPTIONS,
  BLOCK_LABELS,
  type PageBlockType,
} from "@/lib/page-schema";

const ORDER: PageBlockType[] = [
  "hero",
  "editorial_intro",
  "feature_tiles",
  "process_steps",
  "testimonial",
  "cta_split",
  "intake_form",
  "rich_text",
  "image",
  "spacer",
];

export function PageBlockPicker({
  onPick,
}: {
  onPick: (type: PageBlockType) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 py-4 text-center text-base font-semibold text-ink transition hover:border-accent hover:bg-accent/10 sm:max-w-md"
      >
        + Add a block
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-canvas p-6 shadow-2xl">
            <h3 className="font-display text-xl font-semibold text-ink">
              Pick a block
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Each block is a section of your page. You can edit the wording
              after you drop it in.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onPick(t);
                    setOpen(false);
                  }}
                  className="rounded-xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-accent/50 hover:shadow-md"
                >
                  <span className="block font-semibold text-ink">
                    {BLOCK_LABELS[t]}
                  </span>
                  <span className="mt-1 block text-xs text-ink-muted">
                    {BLOCK_DESCRIPTIONS[t]}
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
