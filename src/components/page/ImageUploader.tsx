"use client";

import {
  type DragEvent,
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { getPublicAppUrl } from "@/lib/env-public";

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number; name: string }
  | { kind: "error"; message: string }
  | { kind: "done" };

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Drag-drop / click-to-pick image uploader. Sends a multipart POST to the
 * admin API and calls `onUploaded(url)` with the resulting public URL.
 *
 * Falls back to a hint about pasting a URL when storage isn't configured yet
 * — the parent still surfaces the URL/alt text fields for that case.
 */
export function ImageUploader({
  onUploaded,
  compact = false,
}: {
  onUploaded: (url: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [hover, setHover] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${getPublicAppUrl()}/api/admin/uploads/status`,
          { credentials: "include" },
        );
        if (!res.ok) {
          if (!cancelled) setAvailable(false);
          return;
        }
        const j = (await res.json().catch(() => null)) as
          | { configured?: boolean }
          | null;
        if (!cancelled) setAvailable(!!j?.configured);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function pickFile() {
    inputRef.current?.click();
  }

  function uploadFile(file: File) {
    if (!ACCEPT.split(",").includes(file.type)) {
      setStatus({
        kind: "error",
        message: `Unsupported file type. Use JPG, PNG, WebP, GIF, or SVG.`,
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus({
        kind: "error",
        message: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max 8 MB.`,
      });
      return;
    }

    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file, file.name);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const progress = Math.round((e.loaded / e.total) * 100);
      setStatus({ kind: "uploading", progress, name: file.name });
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText) as { url?: string };
          if (j.url) {
            onUploaded(j.url);
            setStatus({ kind: "done" });
            setTimeout(() => setStatus({ kind: "idle" }), 1500);
            return;
          }
          setStatus({ kind: "error", message: "Server returned no URL" });
        } catch {
          setStatus({ kind: "error", message: "Bad server response" });
        }
        return;
      }
      let msg = `Upload failed (HTTP ${xhr.status})`;
      try {
        const j = JSON.parse(xhr.responseText) as { error?: string };
        if (j.error) msg = j.error;
      } catch {
        // ignore
      }
      setStatus({ kind: "error", message: msg });
    };
    xhr.onerror = () => {
      setStatus({ kind: "error", message: "Network error during upload" });
    };

    xhr.open("POST", `${getPublicAppUrl()}/api/admin/uploads/image`);
    xhr.withCredentials = true;
    xhr.send(form);
    setStatus({ kind: "uploading", progress: 0, name: file.name });
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setHover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  if (available === false) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Image uploads aren’t set up yet. You can still paste a public image URL
        below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={pickFile}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pickFile();
          }
        }}
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 text-center transition ${
          compact ? "py-4" : "py-6"
        } ${
          hover
            ? "border-accent bg-accent/10"
            : "border-line bg-canvas/40 hover:border-accent/60 hover:bg-canvas"
        }`}
      >
        <p className="text-sm font-semibold text-ink">
          {status.kind === "uploading"
            ? `Uploading ${status.name}…`
            : status.kind === "done"
              ? "Uploaded ✓"
              : "Click to choose an image, or drop one here"}
        </p>
        <p className="text-[11px] text-ink-muted">
          JPG · PNG · WebP · GIF · SVG · up to 8 MB
        </p>
        {status.kind === "uploading" ? (
          <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        ) : null}
      </div>
      {status.kind === "error" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
          {status.message}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
