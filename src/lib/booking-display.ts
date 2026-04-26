/** Shared display helpers for Bookings + Documents. */

export const BOOKING_KIND_LABEL: Record<string, string> = {
  LODGING: "Lodging",
  FLIGHT: "Flight",
  TRANSFER: "Transfer",
  ACTIVITY: "Activity",
  CRUISE: "Cruise",
  CAR_RENTAL: "Car rental",
  RAIL: "Train",
  INSURANCE: "Travel insurance",
  OTHER: "Other",
};

export const BOOKING_KIND_ICON: Record<string, string> = {
  LODGING: "🛏",
  FLIGHT: "✈",
  TRANSFER: "🚐",
  ACTIVITY: "✦",
  CRUISE: "⚓",
  CAR_RENTAL: "🚗",
  RAIL: "🚆",
  INSURANCE: "🛡",
  OTHER: "•",
};

export const BOOKING_KIND_OPTIONS = [
  "LODGING",
  "FLIGHT",
  "TRANSFER",
  "ACTIVITY",
  "CRUISE",
  "CAR_RENTAL",
  "RAIL",
  "INSURANCE",
  "OTHER",
] as const;

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-stone-200 text-stone-800",
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-rose-100 text-rose-900",
};

export const BOOKING_STATUS_OPTIONS = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
] as const;

export function statusBadge(status: string): {
  label: string;
  className: string;
} {
  return {
    label: BOOKING_STATUS_LABEL[status] ?? status,
    className: `${BOOKING_STATUS_COLOR[status] ?? "bg-stone-100 text-stone-700"} px-2 py-0.5 rounded-full text-[11px] font-semibold`,
  };
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatBookingDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  function fmt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.valueOf())) return iso;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `from ${fmt(start)}`;
  if (end) return `until ${fmt(end)}`;
  return null;
}
