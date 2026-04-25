"use client";

import { useEffect } from "react";
import { BlockEditor } from "@/components/page/PageBlockCard";
import { BLOCK_LABELS, type PageBlock } from "@/lib/page-schema";

/**
 * Slide-in side drawer that shows full per-field controls for a block.
 * The body reuses the existing BlockEditor (CTA links, tile arrays,
 * step arrays, intake form select, anchor IDs, etc.) so admins still get
 * comprehensive controls when needed — just kept out of the way.
 */
export function BlockSettingsDrawer({
  block,
  onPatch,
  onClose,
}: {
  block: PageBlock | null;
  onPatch: (patch: Partial<PageBlock>) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!block) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [block, onClose]);

  if (!block) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal>
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden
      />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-l border-line bg-canvas shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Block settings
            </p>
            <h2 className="font-display text-lg font-semibold text-ink">
              {BLOCK_LABELS[block.type]}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Edit anywhere on the page first — use this for less-common
              options.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-canvas"
          >
            Close
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <BlockEditor block={block} onPatch={onPatch} />
          <details className="mt-5 rounded-lg border border-line/80 bg-canvas/30">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink-muted">
              Anchor link ID (advanced)
            </summary>
            <div className="border-t border-line/80 px-3 py-3">
              <label className="block text-xs text-ink-muted">
                Used so links like{" "}
                <code className="rounded bg-canvas px-1">/#about</code> jump to
                this block.
                <input
                  type="text"
                  value={block.anchor ?? ""}
                  onChange={(e) =>
                    onPatch({ anchor: e.target.value || undefined })
                  }
                  placeholder="e.g. journeys"
                  className="mt-1 w-full rounded border border-line px-2 py-1 font-mono text-xs"
                />
              </label>
            </div>
          </details>
        </div>
      </aside>
    </div>
  );
}
