"use client";

import { useState } from "react";
import type { PageBlockType } from "@/lib/page-schema";
import { PageBlockPickerModal } from "@/components/page/PageBlockPicker";

/**
 * Slim "+" target between blocks. Hovering reveals a button; clicking opens
 * the block-type picker modal scoped to insert at this index.
 */
export function BlockInsertZone({
  onPick,
  alwaysVisible = false,
}: {
  onPick: (type: PageBlockType) => void;
  alwaysVisible?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="group relative flex h-8 items-center justify-center">
      <span
        className={`absolute inset-x-12 top-1/2 h-px -translate-y-1/2 bg-line transition ${
          alwaysVisible ? "opacity-60" : "opacity-0 group-hover:opacity-60"
        }`}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => setPicking(true)}
        className={`relative z-10 flex h-7 items-center gap-1 rounded-full border border-line bg-canvas/95 px-3 text-[11px] font-semibold text-ink-muted shadow-sm transition hover:text-ink ${
          alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        + Add block
      </button>
      {picking ? (
        <PageBlockPickerModal
          onPick={(t) => {
            onPick(t);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  );
}
