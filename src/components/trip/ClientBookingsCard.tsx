import {
  BOOKING_KIND_ICON,
  BOOKING_KIND_LABEL,
  formatBookingDateRange,
  statusBadge,
} from "@/lib/booking-display";

export type ClientBooking = {
  id: string;
  kind: string;
  status: string;
  title: string;
  vendorName: string | null;
  bookingRef: string | null;
  bookedBy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
};

export function ClientBookingsCard({
  bookings,
}: {
  bookings: ClientBooking[];
}) {
  if (bookings.length === 0) return null;
  return (
    <section className="space-y-3">
      <header>
        <h3 className="font-display text-lg font-semibold text-ink">
          What’s booked
        </h3>
        <p className="text-xs text-ink-muted">
          Confirmations from your trip designer.
        </p>
      </header>
      <ul className="space-y-2">
        {bookings.map((b) => {
          const sb = statusBadge(b.status);
          const dates = formatBookingDateRange(b.startDate, b.endDate);
          return (
            <li
              key={b.id}
              className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start gap-3">
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas text-base"
                >
                  {BOOKING_KIND_ICON[b.kind] ?? "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-display text-base font-semibold text-ink">
                      {b.title}
                    </p>
                    <span className={sb.className}>{sb.label}</span>
                    <span className="text-[11px] uppercase tracking-wider text-ink-muted">
                      {BOOKING_KIND_LABEL[b.kind] ?? b.kind}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                    {dates ? <span>{dates}</span> : null}
                    {b.vendorName ? <span>· {b.vendorName}</span> : null}
                    {b.bookingRef ? (
                      <span>
                        · Confirmation{" "}
                        <span className="font-mono text-ink">
                          {b.bookingRef}
                        </span>
                      </span>
                    ) : null}
                    {b.bookedBy === "them" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                        You book this
                      </span>
                    ) : null}
                  </div>
                  {b.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {b.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
