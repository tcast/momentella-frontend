import {
  formatDayDate,
  formatTimeRange,
  type ItineraryDay,
  type ItineraryItem,
  type ItinerarySchema,
} from "@/lib/itinerary-schema";
import { ItemKindBadge } from "./ItemKindBadge";

/** Read-only itinerary view used in admin preview and the client portal. */
export function ItineraryRenderer({
  schema,
  tripTitle,
  empty,
}: {
  schema: ItinerarySchema;
  tripTitle?: string;
  empty?: React.ReactNode;
}) {
  if (schema.days.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-ink-muted">
        {empty ?? <p>No itinerary yet — your trip designer is working on it.</p>}
      </div>
    );
  }
  return (
    <article className="bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {tripTitle ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage">
            Itinerary
          </p>
        ) : null}
        {tripTitle ? (
          <h1 className="mt-2 font-display text-3xl font-medium text-ink sm:text-4xl">
            {tripTitle}
          </h1>
        ) : null}
        {schema.summary ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {schema.summary}
          </p>
        ) : null}
        <ol className="mt-10 space-y-10">
          {schema.days.map((day, idx) => (
            <DayView key={day.id} day={day} number={idx + 1} />
          ))}
        </ol>
      </div>
    </article>
  );
}

function DayView({ day, number }: { day: ItineraryDay; number: number }) {
  const date = formatDayDate(day.date);
  return (
    <li className="border-l-2 border-line/80 pl-6">
      <header>
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Day {number}
          {date ? ` · ${date}` : ""}
        </p>
        {day.title ? (
          <h2 className="mt-1 font-display text-2xl font-medium text-ink">
            {day.title}
          </h2>
        ) : null}
        {day.summary ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {day.summary}
          </p>
        ) : null}
      </header>
      {day.items.length === 0 ? (
        <p className="mt-4 text-xs text-ink-muted">
          Nothing scheduled for this day.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {day.items.map((item) => (
            <ItemView key={item.id} item={item} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ItemView({ item }: { item: ItineraryItem }) {
  const time = formatTimeRange(item.startTime, item.endTime);
  return (
    <li className="rounded-xl border border-line bg-white/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ItemKindBadge kind={item.kind} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-medium text-ink">
            {item.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
            {time ? <span>🕒 {time}</span> : null}
            {item.location ? <span>📍 {item.location}</span> : null}
            {item.vendorName ? <span>· {item.vendorName}</span> : null}
            {item.bookedBy === "them" ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                You book this
              </span>
            ) : null}
          </div>
          {item.description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {item.description}
            </p>
          ) : null}
          {item.vendorUrl ? (
            <p className="mt-2 text-[11px]">
              <a
                href={item.vendorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                {item.vendorName ? `${item.vendorName} site ↗` : "Vendor site ↗"}
              </a>
            </p>
          ) : null}
          {item.bookingRef ? (
            <p className="mt-1 text-[11px] text-ink-muted">
              Confirmation:{" "}
              <span className="font-mono text-ink">{item.bookingRef}</span>
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
