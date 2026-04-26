import { kindMeta, type ItemKind } from "@/lib/itinerary-schema";

const ACCENT_BG: Record<string, string> = {
  violet: "bg-violet-100 text-violet-900",
  sky: "bg-sky-100 text-sky-900",
  amber: "bg-amber-100 text-amber-900",
  rose: "bg-rose-100 text-rose-900",
  stone: "bg-stone-200 text-stone-800",
};

export function ItemKindBadge({
  kind,
  size = "sm",
}: {
  kind: ItemKind;
  size?: "sm" | "lg";
}) {
  const meta = kindMeta(kind);
  const sizing =
    size === "lg" ? "h-9 w-9 text-base" : "h-7 w-7 text-xs";
  return (
    <span
      aria-label={meta.label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sizing} ${ACCENT_BG[meta.accent] ?? "bg-stone-100 text-stone-800"}`}
    >
      {meta.icon}
    </span>
  );
}
