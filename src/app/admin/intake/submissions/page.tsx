import Link from "next/link";
import { IntakeSubmissionActions } from "@/components/intake/IntakeSubmissionActions";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  email: string;
  status: string;
  notes: string | null;
  createdAt: string;
  form: { name: string; slug: string };
  formVersion: { version: number; label: string | null };
  preview: {
    name: string | null;
    phone: string | null;
    travelers: string | null;
    destinations: string | null;
    homeAirport: string | null;
  };
};

function formatWhen(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return { date: iso, time: "" };
  return {
    date: d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export default async function IntakeSubmissionsPage() {
  const data = await serverFetchJson<{ submissions: Submission[] }>(
    "/api/admin/intake-submissions?take=100",
  );
  const submissions = data?.submissions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/intake"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Forms
        </Link>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          Form submissions
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Latest {submissions.length} submissions across all forms. Click{" "}
          <strong>View</strong> on any row for the full answers.
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
          No submissions yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="bg-canvas/60">
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Who</th>
                  <th className="px-4 py-3 font-semibold">Travelers</th>
                  <th className="px-4 py-3 font-semibold">Destinations</th>
                  <th className="px-4 py-3 font-semibold">Home airport</th>
                  <th className="px-4 py-3 font-semibold">Form</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const when = formatWhen(s.createdAt);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-line/70 align-top transition-colors last:border-b-0 hover:bg-canvas/40"
                    >
                      <td className="px-4 py-4 text-xs text-ink-muted">
                        <p className="font-medium text-ink">{when.date}</p>
                        <p>{when.time}</p>
                      </td>
                      <td className="px-4 py-4">
                        {s.preview.name ? (
                          <p className="font-semibold text-ink">
                            {s.preview.name}
                          </p>
                        ) : null}
                        <p
                          className={
                            s.preview.name
                              ? "text-xs text-ink-muted"
                              : "font-semibold text-ink"
                          }
                        >
                          {s.email}
                        </p>
                        {s.preview.phone ? (
                          <p className="text-xs text-ink-muted">
                            {s.preview.phone}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-ink">
                        {s.preview.travelers ?? (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td
                        className="max-w-[22rem] px-4 py-4 text-sm text-ink"
                        title={s.preview.destinations ?? undefined}
                      >
                        {s.preview.destinations ? (
                          <span className="line-clamp-3">
                            {s.preview.destinations}
                          </span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-ink">
                        {s.preview.homeAirport ?? (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <p className="font-medium text-ink">{s.form.name}</p>
                        <p className="text-xs text-ink-muted">
                          v{s.formVersion.version}
                          {s.formVersion.label ? ` · ${s.formVersion.label}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <IntakeSubmissionActions id={s.id} status={s.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/intake/submissions/${s.id}`}
                          className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
