"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function ArchiveIntakeFormToggle({
  formId,
  archived,
}: {
  formId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await fetch(`${getPublicAppUrl()}/api/admin/intake-forms/${formId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !archived }),
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void toggle()}
      className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"
    >
      {archived ? "Unarchive form" : "Archive form"}
    </button>
  );
}
