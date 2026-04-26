/** Shared display helpers for Trip status / kind labels and badge colors. */

export const TRIP_STATUS_LABEL: Record<string, string> = {
  LEAD: "Lead",
  PLANNING: "Planning",
  PROPOSED: "Proposed",
  BOOKED: "Booked",
  IN_PROGRESS: "Traveling",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  // legacy fallbacks
  DRAFT: "Lead",
  CONFIRMED: "Booked",
};

export const TRIP_STATUS_COLOR: Record<string, string> = {
  LEAD: "bg-amber-100 text-amber-900",
  PLANNING: "bg-sky-100 text-sky-900",
  PROPOSED: "bg-violet-100 text-violet-900",
  BOOKED: "bg-emerald-100 text-emerald-900",
  IN_PROGRESS: "bg-blue-100 text-blue-900",
  COMPLETED: "bg-stone-200 text-stone-900",
  ARCHIVED: "bg-stone-100 text-stone-700",
  DRAFT: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-emerald-100 text-emerald-900",
};

export const TRIP_KIND_LABEL: Record<string, string> = {
  FULL_SERVICE: "Full service",
  ITINERARY_ONLY: "Itinerary only",
  CONSULT: "Consult",
};

export const TRIP_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "LEAD", label: "Lead" },
  { value: "PLANNING", label: "Planning" },
  { value: "PROPOSED", label: "Proposed" },
  { value: "BOOKED", label: "Booked" },
  { value: "IN_PROGRESS", label: "Traveling" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

export const TRIP_KIND_OPTIONS: { value: string; label: string }[] = [
  { value: "FULL_SERVICE", label: "Full service" },
  { value: "ITINERARY_ONLY", label: "Itinerary only" },
  { value: "CONSULT", label: "Consult" },
];

export function tripStatusBadge(status: string): {
  label: string;
  className: string;
} {
  return {
    label: TRIP_STATUS_LABEL[status] ?? status,
    className: `${TRIP_STATUS_COLOR[status] ?? "bg-stone-100 text-stone-900"} px-2 py-0.5 rounded-full text-[11px] font-semibold`,
  };
}

export function summarizeDestinations(d: unknown): string | null {
  if (!Array.isArray(d) || d.length === 0) return null;
  const names = d
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      return typeof o.name === "string" ? o.name : null;
    })
    .filter((s): s is string => !!s);
  if (names.length === 0) return null;
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

export function summarizeTravelers(
  adults: number | null | undefined,
  children: number | null | undefined,
  childAges: unknown,
): string | null {
  const a = typeof adults === "number" ? adults : null;
  const c = typeof children === "number" ? children : null;
  if (a === null && c === null) return null;
  const parts: string[] = [];
  if (a !== null) parts.push(`${a} adult${a === 1 ? "" : "s"}`);
  if (c !== null) parts.push(`${c} child${c === 1 ? "" : "ren"}`);
  if (Array.isArray(childAges) && childAges.length > 0) {
    parts.push(`ages ${childAges.join(", ")}`);
  }
  return parts.join(" · ");
}

export function formatDateRange(
  startsOn: string | null | undefined,
  endsOn: string | null | undefined,
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
  if (startsOn && endsOn) return `${fmt(startsOn)} – ${fmt(endsOn)}`;
  if (startsOn) return `from ${fmt(startsOn)}`;
  if (endsOn) return `until ${fmt(endsOn)}`;
  return null;
}
