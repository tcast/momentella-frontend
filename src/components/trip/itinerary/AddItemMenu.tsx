"use client";

import { useEffect, useRef, useState } from "react";
import { ITEM_KINDS, type ItemKind } from "@/lib/itinerary-schema";

export function AddItemMenu({
  onPick,
  label = "+ Add item",
}: {
  onPick: (kind: ItemKind) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-dashed border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted hover:border-accent/60 hover:text-ink"
      >
        {label}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-line bg-canvas p-2 shadow-xl">
          {ITEM_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => {
                onPick(k.value);
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-canvas-muted"
            >
              <span aria-hidden className="text-base">
                {k.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {k.label}
                </span>
                <span className="block text-[11px] text-ink-muted">
                  {k.blurb}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
