"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPublicAppUrl } from "@/lib/env-public";
import { formatBytes } from "@/lib/booking-display";

export type AdminDocument = {
  id: string;
  name: string;
  url: string;
  contentType: string;
  size: number;
  visibleToClient: boolean;
  bookingId: string | null;
  uploadedByName: string | null;
  createdAt: string;
};

export type BookingOption = { id: string; title: string; kind: string };

const MAX_BYTES = 25 * 1024 * 1024;

export function DocumentsSection({
  tripId,
  documents,
  bookings,
}: {
  tripId: string;
  documents: AdminDocument[];
  bookings: BookingOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [progress, setProgress] = useState<{
    name: string;
    pct: number;
  } | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  function uploadFile(file: File) {
    if (file.size > MAX_BYTES) {
      setErr(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 25 MB.`,
      );
      return;
    }
    setErr(null);
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file, file.name);
    if (selectedBookingId) form.append("bookingId", selectedBookingId);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      setProgress({ name: file.name, pct: Math.round((e.loaded / e.total) * 100) });
    };
    xhr.onload = () => {
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        router.refresh();
        return;
      }
      try {
        const j = JSON.parse(xhr.responseText) as { error?: string };
        setErr(j.error ?? `Upload failed (${xhr.status})`);
      } catch {
        setErr(`Upload failed (${xhr.status})`);
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setErr("Network error");
    };
    xhr.open(
      "POST",
      `${getPublicAppUrl()}/api/admin/trips/${tripId}/documents`,
    );
    xhr.withCredentials = true;
    xhr.send(form);
    setProgress({ name: file.name, pct: 0 });
  }

  function toggleVisibility(d: AdminDocument) {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${tripId}/documents/${d.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visibleToClient: !d.visibleToClient }),
        },
      );
      if (!res.ok) {
        setErr("Could not update");
        return;
      }
      router.refresh();
    });
  }

  function rename(d: AdminDocument) {
    const next = window.prompt("Rename document", d.name);
    if (!next || next.trim() === d.name) return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${tripId}/documents/${d.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: next.trim() }),
        },
      );
      if (!res.ok) {
        setErr("Could not rename");
        return;
      }
      router.refresh();
    });
  }

  function remove(d: AdminDocument) {
    if (
      !confirm(`Delete "${d.name}"? The file will be removed from storage too.`)
    ) {
      return;
    }
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${tripId}/documents/${d.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        setErr("Could not delete");
        return;
      }
      router.refresh();
    });
  }

  function bookingLabel(id: string | null): string | null {
    if (!id) return null;
    const b = bookings.find((x) => x.id === id);
    return b ? b.title : null;
  }

  return (
    <section className="space-y-4">
      <header>
        <h3 className="font-display text-lg font-semibold text-ink">
          Documents
        </h3>
        <p className="text-xs text-ink-muted">
          Confirmations, vouchers, contracts. Visible to the family by default —
          toggle off to keep one internal.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          {bookings.length > 0 ? (
            <label className="text-xs font-semibold text-ink-muted">
              Attach to booking (optional)
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="mt-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="">Just attach to the trip</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button
            type="button"
            onClick={pick}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
          >
            Upload document
          </button>
          <p className="text-[11px] text-ink-muted">
            PDF · DOC · DOCX · XLS · CSV · JPG · PNG · WebP — up to 25 MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
          className="hidden"
        />
        {progress ? (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-ink-muted">
              Uploading {progress.name}… {progress.pct}%
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-accent transition-[width]"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        ) : null}
        {err ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}
      </div>

      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-6 text-center text-sm text-ink-muted">
          No documents yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((d) => {
            const linkedTo = bookingLabel(d.bookingId);
            return (
              <li
                key={d.id}
                className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span aria-hidden className="text-xl">
                    📄
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-ink hover:underline"
                    >
                      {d.name}
                    </a>
                    <p className="text-[11px] text-ink-muted">
                      {formatBytes(d.size)} · {d.contentType}
                      {linkedTo ? ` · linked to ${linkedTo}` : ""}
                      {d.uploadedByName ? ` · by ${d.uploadedByName}` : ""}
                      {" · "}
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-[11px]">
                      {d.visibleToClient ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900">
                          Visible to family
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 font-semibold text-stone-800">
                          Internal only
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(d)}
                      disabled={pending}
                      className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-ink hover:bg-canvas disabled:opacity-60"
                    >
                      {d.visibleToClient ? "Make internal" : "Show to family"}
                    </button>
                    <button
                      type="button"
                      onClick={() => rename(d)}
                      className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-ink-muted hover:bg-canvas"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(d)}
                      className="rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
