"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/page/ImageUploader";

/**
 * Image-shaped click target. Renders the current image (or an empty placeholder
 * frame) and reveals a hover overlay with "Replace" and "Remove" controls.
 * Clicking the empty state opens the uploader inline.
 */
export function EditableImage({
  url,
  alt,
  className = "",
  emptyHint,
  onChange,
}: {
  url: string;
  alt: string;
  className?: string;
  emptyHint?: string;
  onChange: (next: { url: string; alt: string }) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!url) {
    return (
      <div
        className={`group flex w-full flex-col items-stretch justify-center gap-2 rounded-lg border-2 border-dashed border-line bg-canvas/60 p-4 text-center text-xs text-ink-muted ${className}`}
      >
        <p>{emptyHint ?? "Click to choose an image, or drag one here."}</p>
        <ImageUploader onUploaded={(u) => onChange({ url: u, alt })} />
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/40" />
      <div className="absolute right-3 top-3 hidden gap-2 group-hover:flex">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-full bg-canvas/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-md hover:bg-white"
        >
          {editing ? "Close" : "Replace image"}
        </button>
        <button
          type="button"
          onClick={() => onChange({ url: "", alt })}
          className="rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-canvas shadow-md hover:bg-ink"
        >
          Remove
        </button>
      </div>
      {editing ? (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-line bg-canvas p-3 shadow-2xl">
          <ImageUploader
            compact
            onUploaded={(u) => {
              onChange({ url: u, alt });
              setEditing(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
