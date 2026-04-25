"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/page/ImageUploader";

/**
 * Combined image source picker. Offers Upload (R2 file upload via
 * ImageUploader) AND Paste URL — caller gets a single `onPicked(url)`
 * callback either way. Used by EditableImage in the visual builder and
 * by ImageInput in the form-style editor.
 */
export function ImagePicker({
  onPicked,
  initialTab = "upload",
}: {
  onPicked: (url: string) => void;
  initialTab?: "upload" | "url";
}) {
  const [tab, setTab] = useState<"upload" | "url">(initialTab);
  const [draftUrl, setDraftUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function applyUrl() {
    const u = draftUrl.trim();
    setErr(null);
    if (!u) {
      setErr("Please paste an image URL.");
      return;
    }
    if (!/^https?:\/\//i.test(u)) {
      setErr("URL must start with http:// or https://");
      return;
    }
    onPicked(u);
    setDraftUrl("");
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <div
        role="tablist"
        className="inline-flex rounded-full border border-line bg-white p-0.5 text-xs font-semibold"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upload"}
          onClick={() => setTab("upload")}
          className={`rounded-full px-3 py-1.5 transition ${
            tab === "upload"
              ? "bg-ink text-canvas"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Upload a file
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "url"}
          onClick={() => setTab("url")}
          className={`rounded-full px-3 py-1.5 transition ${
            tab === "url"
              ? "bg-ink text-canvas"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Paste a URL
        </button>
      </div>
      {tab === "upload" ? (
        <ImageUploader compact onUploaded={onPicked} />
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder="https://images.unsplash.com/…"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyUrl}
              disabled={!draftUrl.trim()}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas disabled:opacity-50"
            >
              Use this URL
            </button>
            <p className="text-[11px] text-ink-muted">
              Any public image URL — Unsplash, your own host, etc.
            </p>
          </div>
          {err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] text-red-900">
              {err}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
