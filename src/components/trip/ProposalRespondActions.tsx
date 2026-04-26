"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function ProposalRespondActions({
  tripId,
  proposalId,
  status,
}: {
  tripId: string;
  proposalId: string;
  status: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "approve" | "request_changes">(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (status === "APPROVED") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
        <p className="font-semibold">You approved this version.</p>
        <p className="mt-1 text-xs">
          Your trip designer is taking next steps. Use the messages below if
          something changes.
        </p>
      </div>
    );
  }
  if (status === "CHANGES_REQUESTED") {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-900">
        <p className="font-semibold">Changes requested.</p>
        <p className="mt-1 text-xs">
          Your designer will publish a new version once they’ve adjusted things.
          Keep an eye on this page.
        </p>
      </div>
    );
  }
  if (status === "WITHDRAWN") {
    return (
      <p className="rounded-2xl border border-line bg-canvas/40 px-5 py-3 text-sm text-ink-muted">
        This version was withdrawn. A new one is on the way.
      </p>
    );
  }

  function submit(decision: "approve" | "request_changes") {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/client/trips/${tripId}/proposals/${proposalId}/respond`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            note: note.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not save",
        );
        return;
      }
      setMode(null);
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <p className="font-display text-base font-semibold text-amber-950">
        How does this look?
      </p>
      <p className="mt-1 text-sm text-amber-900">
        Tap one of the buttons below. Add a note if you want to call out
        anything specific — your designer will see it right away.
      </p>
      {mode ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={
              mode === "approve"
                ? "Anything you’re especially excited about? (optional)"
                : "What would you like changed?"
            }
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submit(mode)}
              disabled={pending}
              className={`rounded-full px-5 py-2 text-sm font-semibold text-canvas disabled:opacity-60 ${
                mode === "approve"
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-violet-700 hover:bg-violet-800"
              }`}
            >
              {pending
                ? "Sending…"
                : mode === "approve"
                  ? "Send approval"
                  : "Send request"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setNote("");
              }}
              className="rounded-full border border-amber-300 bg-white px-5 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Cancel
            </button>
          </div>
          {err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
              {err}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("approve")}
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-canvas hover:bg-emerald-800"
          >
            Approve this version
          </button>
          <button
            type="button"
            onClick={() => setMode("request_changes")}
            className="rounded-full bg-violet-700 px-5 py-2 text-sm font-semibold text-canvas hover:bg-violet-800"
          >
            Request changes
          </button>
        </div>
      )}
    </div>
  );
}
