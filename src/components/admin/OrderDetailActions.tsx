"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function OrderDetailActions({
  orderId,
  status,
  canRefund,
}: {
  orderId: string;
  status: string;
  canRefund: boolean;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refund() {
    if (
      !confirm(
        "Refund this order? Stripe will send the money back to the buyer's card.",
      )
    )
      return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/orders/${orderId}/refund`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Refund failed",
        );
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-col items-end gap-2">
      {canRefund ? (
        <button
          type="button"
          onClick={refund}
          disabled={pending}
          className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
        >
          Refund via Stripe
        </button>
      ) : null}
      {status === "REFUNDED" ? (
        <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-900">
          Refunded
        </span>
      ) : null}
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-900">
          {err}
        </p>
      ) : null}
    </div>
  );
}
