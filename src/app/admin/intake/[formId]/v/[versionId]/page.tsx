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
          Trip intakes
        </Link>
        <span>/</span>
        <Link href={`/admin/intake/${formId}`} className="hover:text-ink">
          {data.form.name}
        </Link>
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Edit version {ver.version}
          {ver.published ? (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900">
              Published
            </span>
          ) : (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
              Draft
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Public URL:{" "}
          <Link
            href={`/intake/${data.form.slug}`}
            className="font-semibold text-accent hover:underline"
          >
            /intake/{data.form.slug}
          </Link>{" "}
          (shows the published version)
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
