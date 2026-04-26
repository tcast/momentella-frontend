"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function ConvertToTripButton({
  submissionId,
  existingTripId,
}: {
  submissionId: string;
  existingTripId: string | null;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (existingTripId) {
    return (
      <a
        href={`/admin/trips/${existingTripId}`}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
      >
        Open the trip →
      </a>
    );
  }

  function convert() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/intake-submissions/${submissionId}/convert-to-trip`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not convert",
        );
        return;
      }
      const j = (await res.json().catch(() => null)) as {
        trip?: { id: string };
      } | null;
      if (j?.trip?.id) {
        router.push(`/admin/trips/${j.trip.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={convert}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
      >
        {pending ? "Converting…" : "Convert to trip"}
      </button>
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-900">
          {err}
        </p>
      ) : null}
    </div>
  );
}
