"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

const STATUSES = ["NEW", "IN_REVIEW", "RESPONDED", "CLOSED"] as const;

export function IntakeSubmissionActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function update(next: string) {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/intake-submissions/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        },
      );
      if (!res.ok) {
        setErr("Update failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => update(e.target.value)}
        className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs font-semibold uppercase text-ink"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {err ? <span className="text-xs text-red-800">{err}</span> : null}
    </div>
  );
}
