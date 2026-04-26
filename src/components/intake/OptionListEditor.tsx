"use client";

import { slugifyFieldId } from "@/lib/slugify-field";

type Opt = { value: string; label: string };

export function OptionListEditor({
  options,
  onChange,
  multi,
}: {
  options: Opt[];
  onChange: (next: Opt[]) => void;
  /** true = "guests can pick several" */
  multi: boolean;
}) {
  function setRow(i: number, label: string) {
    const next = options.map((o, j) => {
      if (j !== i) return o;
      const value = slugifyFieldId(label, o.value || `choice_${i + 1}`);
      return { value, label };
    });
    onChange(next);
  }

  function addRow() {
    const n = options.length + 1;
    onChange([
      ...options,
      { value: `choice_${n}`, label: `New choice ${n}` },
    ]);
  }

  function removeRow(i: number) {
    onChange(options.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-line bg-canvas/50 p-4">
      <div>
        <p className="text-sm font-semibold text-ink">
          {multi ? "Choices (guests can pick several)" : "Choices (guests pick one)"}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">
          Type what travelers see. We save a short code automatically for reporting.
        </p>
      </div>
      <ul className="space-y-2">
        {options.map((o, i) => (
          // Stable index-based key. Using `o.value` here would change on
          // every keystroke (the value is auto-slugged from the label),
          // which remounts the input and steals focus mid-typing.
          <li key={i} className="flex gap-2">
            <input
              type="text"
              value={o.label}
              onChange={(e) => setRow(i, e.target.value)}
              placeholder={`Choice ${i + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="shrink-0 rounded-lg border border-line px-2 text-sm text-red-800 hover:bg-red-50"
              aria-label="Remove choice"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addRow}
        className="text-sm font-semibold text-accent hover:underline"
      >
        + Add another choice
      </button>
    </div>
  );
}
