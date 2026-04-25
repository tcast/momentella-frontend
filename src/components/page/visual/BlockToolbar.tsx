"use client";

import type { HTMLAttributes } from "react";
import { BLOCK_LABELS, type PageBlock } from "@/lib/page-schema";

/**
 * Floating toolbar that sits at the top-right of a block when its container
 * is hovered (or the block is "selected"). Drag handle, up/down, duplicate,
 * delete, settings.
 */
export function BlockToolbar({
  block,
  index,
  total,
  dragProps,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onOpenSettings,
}: {
  block: PageBlock;
  index: number;
  total: number;
  dragProps: HTMLAttributes<HTMLButtonElement>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div
      className="pointer-events-auto absolute -top-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-canvas/95 px-1.5 py-1 shadow-lg backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {BLOCK_LABELS[block.type]}
      </span>
      <span className="h-4 w-px bg-line" aria-hidden />
      <button
        type="button"
        className="grid h-7 w-7 cursor-grab touch-manipulation place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink"
        aria-label="Drag to reorder"
        {...dragProps}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </button>
      <button
        type="button"
        disabled={index === 0}
        onClick={onMoveUp}
        aria-label="Move block up"
        className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={onMoveDown}
        aria-label="Move block down"
        className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        aria-label="Duplicate block"
        className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink"
        title="Duplicate"
      >
        ⎘
      </button>
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="More settings"
        className="grid h-7 px-2 place-items-center rounded-full text-xs font-semibold text-ink-muted hover:bg-canvas hover:text-ink"
        title="More settings"
      >
        ⚙ More
      </button>
      <span className="h-4 w-px bg-line" aria-hidden />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove block"
        className="grid h-7 w-7 place-items-center rounded-full text-red-700 hover:bg-red-50"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}
