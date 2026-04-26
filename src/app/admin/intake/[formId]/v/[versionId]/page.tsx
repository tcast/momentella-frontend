import Link from "next/link";
import { notFound } from "next/navigation";
import { FormBuilderClient } from "@/components/intake/FormBuilderClient";
import {
  FORM_SCHEMA_VERSION,
  type IntakeFormSchema,
  parseIntakeFormSchema,
} from "@/lib/intake-schema";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export default async function IntakeVersionBuilderPage({
  params,
}: {
  params: Promise<{ formId: string; versionId: string }>;
}) {
  const { formId, versionId } = await params;
  const data = await serverFetchJson<{
    form: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
      versions: {
        id: string;
        version: number;
        label: string | null;
        schema: unknown;
        published: boolean;
      }[];
    };
  }>(`/api/admin/intake-forms/${formId}`);
  if (!data?.form) notFound();
  const ver = data.form.versions.find((v) => v.id === versionId);
  if (!ver) notFound();
  const schema: IntakeFormSchema =
    parseIntakeFormSchema(ver.schema) ?? {
      version: FORM_SCHEMA_VERSION,
      fields: [],
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/intake" className="hover:text-ink">
          Forms
        </Link>
        <span>/</span>
        <Link href={`/admin/intake/${formId}`} className="hover:text-ink">
          {data.form.name}
        </Link>
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {data.form.name} — version {ver.version}
          {ver.published ? (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900">
              Live
            </span>
          ) : (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
              Draft
            </span>
          )}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Below is a simple, visual form builder—add questions in everyday language,
          drag to reorder, and use <strong>Preview as guest</strong> to see the exact
          experience travelers get. Families use your public link (only the{" "}
          <strong>published</strong> version appears there).
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Public page:{" "}
          <Link
            href={`/intake/${data.form.slug}`}
            className="font-semibold text-accent hover:underline"
          >
            /intake/{data.form.slug}
          </Link>
        </p>
      </div>
      <FormBuilderClient
        formId={formId}
        versionId={versionId}
        initialSchema={schema}
        versionLabel={ver.label}
      />
    </div>
  );
}
