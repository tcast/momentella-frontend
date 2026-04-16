import Link from "next/link";
import { notFound } from "next/navigation";
import { NewIntakeVersionButton } from "@/components/intake/NewIntakeVersionButton";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type FormDetail = {
  form: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    versions: {
      id: string;
      version: number;
      label: string | null;
      published: boolean;
      createdAt: string;
    }[];
  };
};

export default async function IntakeFormDetailPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const data = await serverFetchJson<FormDetail>(
    `/api/admin/intake-forms/${formId}`,
  );
  if (!data?.form) notFound();
  const { form } = data;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/intake"
            className="text-sm font-semibold text-accent hover:underline"
          >
            ← All intakes
          </Link>
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
            {form.name}
          </h2>
          <p className="text-sm text-ink-muted">Slug: {form.slug}</p>
          {form.description ? (
            <p className="mt-2 text-sm text-ink-muted">{form.description}</p>
          ) : null}
          <p className="mt-3 text-sm">
            <Link
              href={`/intake/${form.slug}`}
              className="font-semibold text-accent hover:underline"
            >
              Open public form →
            </Link>
          </p>
        </div>
        <NewIntakeVersionButton formId={form.id} />
      </div>

      <section>
        <h3 className="font-display text-lg font-semibold text-ink">Versions</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Only one version is <strong>published</strong> at a time — that is what
          guests see at{" "}
          <code className="rounded bg-canvas px-1">/intake/{form.slug}</code>.
        </p>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white/60">
          {form.versions.map((v) => (
            <li
              key={v.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-semibold text-ink">
                  v{v.version}
                  {v.label ? ` — ${v.label}` : ""}
                </span>
                {v.published ? (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900">
                    Published
                  </span>
                ) : (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    Draft
                  </span>
                )}
                <p className="text-xs text-ink-muted">
                  {new Date(v.createdAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/admin/intake/${form.id}/v/${v.id}`}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Open builder →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
