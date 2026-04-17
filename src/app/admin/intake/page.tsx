import Link from "next/link";
import { CreateIntakeFormButton } from "@/components/intake/CreateIntakeFormButton";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type IntakeFormRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  archived: boolean;
  updatedAt: string;
  versions: { id: string; version: number; published: boolean }[];
};

export default async function AdminIntakeIndexPage() {
  const data = await serverFetchJson<{ intakeForms: IntakeFormRow[] }>(
    "/api/admin/intake-forms",
  );
  const forms = data?.intakeForms ?? [];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Trip intake forms
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Build versioned questionnaires. The published version is shown at{" "}
            <code className="rounded bg-canvas px-1">/intake/your-slug</code>.
          </p>
        </div>
        <CreateIntakeFormButton />
      </div>

      {forms.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No intake forms yet. Create one to get started.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-white/60">
          {forms.map((f) => {
            const pub = f.versions.find((v) => v.published);
            return (
              <li key={f.id} className="px-4 py-4 sm:flex sm:justify-between">
                <div>
                  <Link
                    href={`/admin/intake/${f.id}`}
                    className="font-semibold text-ink hover:underline"
                  >
                    {f.name}
                    {f.archived ? (
                      <span className="ml-2 text-xs font-normal uppercase tracking-wider text-ink-muted">
                        (archived)
                      </span>
                    ) : null}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    /intake/{f.slug}
                    {pub ? ` · published v${pub.version}` : " · no published version"}
                  </p>
                </div>
                <Link
                  href={`/intake/${f.slug}`}
                  className="mt-2 text-sm font-semibold text-accent hover:underline sm:mt-0"
                >
                  View live →
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <section>
        <h3 className="font-display text-lg font-semibold text-ink">
          Submissions
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          Review responses from all intake forms.
        </p>
        <Link
          href="/admin/intake/submissions"
          className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Open submissions →
        </Link>
      </section>
    </div>
  );
}
