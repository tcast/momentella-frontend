import { formatBytes } from "@/lib/booking-display";

export type ClientDocument = {
  id: string;
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
};

export function ClientDocumentsCard({
  documents,
}: {
  documents: ClientDocument[];
}) {
  if (documents.length === 0) return null;
  return (
    <section className="space-y-3">
      <header>
        <h3 className="font-display text-lg font-semibold text-ink">
          Documents
        </h3>
        <p className="text-xs text-ink-muted">
          Your designer shared these with you. Open or download anytime.
        </p>
      </header>
      <ul className="space-y-2">
        {documents.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
          >
            <span aria-hidden className="text-xl">
              📄
            </span>
            <div className="min-w-0 flex-1">
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink hover:underline"
              >
                {d.name}
              </a>
              <p className="text-[11px] text-ink-muted">
                {formatBytes(d.size)} ·{" "}
                {new Date(d.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
            >
              Open ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
