import Link from "next/link";
import { IntakeSubmissionActions } from "@/components/intake/IntakeSubmissionActions";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  email: string;
  status: string;
  responses: unknown;
  notes: string | null;
  createdAt: string;
  form: { name: string; slug: string };
  formVersion: { version: number; label: string | null };
};

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
          ← Trip intakes
        </Link>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          Intake submissions
        </h2>
      </div>
      {submissions.length === 0 ? (
        <p className="text-sm text-ink-muted">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-muted">
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Form</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-line/80 align-top">
                  <td className="px-3 py-3 text-ink-muted">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-medium text-ink">{s.form.name}</span>
                    <p className="text-xs text-ink-muted">
                      v{s.formVersion.version}
                      {s.formVersion.label ? ` · ${s.formVersion.label}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3">{s.email}</td>
                  <td className="px-3 py-3">
                    <IntakeSubmissionActions id={s.id} status={s.status} />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/intake/submissions/${s.id}`}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
