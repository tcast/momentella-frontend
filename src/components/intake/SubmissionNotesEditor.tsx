"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function SubmissionNotesEditor({
  submissionId,
  initialNotes,
}: {
  submissionId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/intake-submissions/${submissionId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: notes || null }),
        },
      );
      if (!res.ok) {
        setMsg("Could not save notes");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-line bg-white/60 p-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Internal notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
        placeholder="Follow-ups, call notes, etc."
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => void save()}
        className="mt-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save notes"}
      </button>
      {msg ? <p className="mt-2 text-sm text-red-800">{msg}</p> : null}
    </div>
  );
}
