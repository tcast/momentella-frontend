/** Mirrors backend `itinerary-schema.ts` so the editor and renderer share types. */

export const ITINERARY_SCHEMA_VERSION = 1 as const;

export type ItemKind =
  | "lodging"
  | "activity"
  | "transit"
  | "meal"
  | "note";

export type BookedBy = "us" | "them" | "tbd";

export interface ItineraryItem {
  id: string;
  kind: ItemKind;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  vendorName?: string;
  vendorUrl?: string;
  bookingRef?: string;
  cost?: number;
  imageUrl?: string;
  bookedBy?: BookedBy;
}

export interface ItineraryDay {
  id: string;
  date?: string;
  title?: string;
  summary?: string;
  items: ItineraryItem[];
}

export interface ItinerarySchema {
  version: typeof ITINERARY_SCHEMA_VERSION;
  summary?: string;
  days: ItineraryDay[];
}

export function parseItinerarySchema(raw: unknown): ItinerarySchema | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== ITINERARY_SCHEMA_VERSION) return null;
  if (!Array.isArray(o.days)) return null;
  return {
    version: ITINERARY_SCHEMA_VERSION,
    summary: typeof o.summary === "string" ? o.summary : undefined,
    days: o.days as ItineraryDay[],
  };
}

export function emptyItinerary(): ItinerarySchema {
  return { version: ITINERARY_SCHEMA_VERSION, days: [] };
}

export function newId(prefix = "x"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const ITEM_KINDS: {
  value: ItemKind;
  label: string;
  blurb: string;
  icon: string;
  accent: string;
}[] = [
  {
    value: "lodging",
    label: "Lodging",
    blurb: "Hotel, villa, or rental",
    icon: "🛏",
    accent: "violet",
  },
  {
    value: "transit",
    label: "Transit",
    blurb: "Flight, train, transfer, drive",
    icon: "✈",
    accent: "sky",
  },
  {
    value: "activity",
    label: "Activity",
    blurb: "Tour, excursion, experience",
    icon: "✦",
    accent: "amber",
  },
  {
    value: "meal",
    label: "Meal",
    blurb: "Restaurant or reservation",
    icon: "✸",
    accent: "rose",
  },
  {
    value: "note",
    label: "Note",
    blurb: "Anything else worth telling them",
    icon: "✎",
    accent: "stone",
  },
];

export function kindMeta(kind: ItemKind) {
  return ITEM_KINDS.find((k) => k.value === kind) ?? ITEM_KINDS[0]!;
}

export const BOOKED_BY_OPTIONS: { value: BookedBy; label: string }[] = [
  { value: "us", label: "Momentella books" },
  { value: "them", label: "Client books" },
  { value: "tbd", label: "TBD" },
];

export function newDay(date?: string): ItineraryDay {
  return { id: newId("day"), date, title: "", summary: "", items: [] };
}

export function newItem(kind: ItemKind): ItineraryItem {
  const titles: Record<ItemKind, string> = {
    lodging: "Hotel — name TBD",
    activity: "New activity",
    transit: "Transit",
    meal: "Restaurant — name TBD",
    note: "Note",
  };
  return { id: newId("item"), kind, title: titles[kind] };
}

/** Auto-fill day dates from a start date if the trip has one. */
export function applyAutoDates(
  days: ItineraryDay[],
  startsOn: string | null,
): ItineraryDay[] {
  if (!startsOn) return days;
  const start = new Date(`${startsOn.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(start.valueOf())) return days;
  return days.map((d, idx) => {
    const next = new Date(start);
    next.setUTCDate(next.getUTCDate() + idx);
    return { ...d, date: next.toISOString().slice(0, 10) };
  });
}

export function formatDayDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatTimeRange(start?: string, end?: string): string | null {
  function pretty(t: string): string {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return t;
    let h = Number(m[1]);
    const min = m[2];
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12;
    if (h === 0) h = 12;
    return min === "00" ? `${h}${ampm}` : `${h}:${min}${ampm}`;
  }
  if (start && end) return `${pretty(start)} – ${pretty(end)}`;
  if (start) return pretty(start);
  if (end) return `until ${pretty(end)}`;
  return null;
}
