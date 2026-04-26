"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function PublishProposalButton({
  tripId,
  hasItinerary,
  latestVersion,
}: {
  tripId: string;
  hasItinerary: boolean;
  latestVersion: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/trips/${tripId}/proposals`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message.trim() || undefined }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not publish",
        );
        return;
      }
      setOpen(false);
      setMessage("");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasItinerary}
        title={
          hasItinerary
            ? "Snapshot the current itinerary and send it to the client"
            : "Build at least one day before you publish"
        }
        className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-50"
      >
        {latestVersion === null
          ? "Publish to client"
          : `Publish v${latestVersion + 1}`}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-canvas p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-semibold text-ink">
              {latestVersion === null
                ? "Publish proposal v1"
                : `Publish proposal v${latestVersion + 1}`}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              This snapshots the trip basics + the current itinerary and sends
              it to the family. They can <strong>Approve</strong> or{" "}
              <strong>Request changes</strong>. Future edits to the working
              itinerary won’t change what they see — publish a new version when
              you’re ready.
            </p>
            <label className="mt-4 block text-xs font-semibold text-ink-muted">
              Optional message to the family
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="A quick note to introduce this version of the trip…"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
              />
            </label>
            {err ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {err}
              </p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
              >
                {pending ? "Publishing…" : "Publish — send to client"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
