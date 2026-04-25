"use client";

import { useState } from "react";
import { ImagePicker } from "@/components/page/ImagePicker";

/**
 * Visually-editable image. The caller is responsible for sizing the wrapping
 * container — this component fills 100% of its parent (so it sits cleanly
 * inside an `absolute inset-0` background slot, an aspect-ratio frame, or
 * any other layout the parent provides). Hovering shows Replace / Remove
 * controls; clicking either opens an ImagePicker (Upload OR URL).
 */
export function EditableImage({
  url,
  alt,
  emptyHint,
  onChange,
}: {
  url: string;
  alt: string;
  emptyHint?: string;
  onChange: (next: { url: string; alt: string }) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="group relative h-full w-full overflow-hidden">
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/30" />
          <div className="absolute right-3 top-3 z-10 hidden gap-2 group-hover:flex">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditing((v) => !v);
              }}
              className="rounded-full bg-canvas/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-md hover:bg-white"
            >
              {editing ? "Close" : "Replace image"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ url: "", alt });
                setEditing(false);
              }}
              className="rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-canvas shadow-md hover:bg-ink"
            >
              Remove
            </button>
          </div>
          {editing ? (
            <div
              className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-line bg-canvas/95 p-4 shadow-2xl backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ImagePicker
                onPicked={(u) => {
                  onChange({ url: u, alt });
                  setEditing(false);
                }}
              />
            </div>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-line bg-canvas/70 p-4 text-center text-xs text-ink-muted">
          <p className="text-sm font-semibold text-ink">
            {emptyHint ?? "Choose an image"}
          </p>
          <p>Upload a file from your computer or paste any image URL.</p>
          <ImagePicker onPicked={(u) => onChange({ url: u, alt })} />
        </div>
      )}
    </div>
  );
}
