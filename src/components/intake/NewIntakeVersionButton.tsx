"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function NewIntakeVersionButton({ formId }: { formId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copyFrom, setCopyFrom] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function create() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/intake-forms/${formId}/versions`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: label || undefined,
            copyFromVersionId: copyFrom || undefined,
          }),
        },
      );
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          json && typeof json === "object" && "error" in json
            ? String((json as { error: unknown }).error)
            : "Could not create version",
        );
        return;
      }
      const v =
        json && typeof json === "object" && "version" in json
          ? (json as { version: { id: string } }).version
          : null;
      setOpen(false);
      if (v?.id) {
        router.push(`/admin/intake/${formId}/v/${v.id}`);
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
      >
        New version
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-canvas p-6 shadow-xl">
            <h4 className="font-display text-lg font-semibold text-ink">
              Create version
            </h4>
            <p className="mt-2 text-sm text-ink-muted">
              Leave “copy from” empty for a blank schema, or paste a version ID
              to duplicate its fields.
            </p>
            <label className="mt-4 block text-xs font-semibold uppercase text-ink-muted">
              Label (optional)
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
                placeholder="e.g. Spring 2026"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold uppercase text-ink-muted">
              Copy from version ID (optional)
              <input
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-xs"
                placeholder="cuid…"
              />
            </label>
            {error ? (
              <p className="mt-2 text-sm text-red-800">{error}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="text-sm font-semibold text-ink-muted hover:text-ink"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60"
                onClick={() => void create()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
