/** Shared display helpers for the commerce surfaces. */

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PAID: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-stone-200 text-stone-800",
  FAILED: "bg-rose-100 text-rose-900",
  REFUNDED: "bg-violet-100 text-violet-900",
};

export function orderStatusBadge(status: string): {
  label: string;
  className: string;
} {
  return {
    label: ORDER_STATUS_LABEL[status] ?? status,
    className: `${ORDER_STATUS_COLOR[status] ?? "bg-stone-100 text-stone-700"} px-2 py-0.5 rounded-full text-[11px] font-semibold`,
  };
}
