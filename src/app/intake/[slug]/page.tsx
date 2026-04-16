import Link from "next/link";
import { notFound } from "next/navigation";
import { IntakeFormRenderer } from "@/components/intake/IntakeFormRenderer";
import { SiteHeader } from "@/components/SiteHeader";
import { parseIntakeFormSchema } from "@/lib/intake-schema";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type PublicIntakePayload = {
  form: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
  };
  version: {
    id: string;
    version: number;
    label: string | null;
    schema: unknown;
  };
};

export default async function IntakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await serverFetchJson<PublicIntakePayload>(
    `/api/public/intake-forms/${encodeURIComponent(slug)}`,
  );
  if (!data) notFound();
  const schema = parseIntakeFormSchema(data.version.schema);
  if (!schema) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 px-5 pb-24 pt-28 sm:pt-32 md:pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Trip intake
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {data.form.name}
        </h1>
        {data.form.description ? (
          <p className="mt-3 text-sm text-ink-muted">{data.form.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-ink-muted">
          Form version {data.version.version}
          {data.version.label ? ` · ${data.version.label}` : ""}
        </p>
        <div className="mt-10">
          <IntakeFormRenderer slug={slug} schema={schema} />
        </div>
        <p className="mt-10 text-center text-sm text-ink-muted">
          <Link href="/" className="font-semibold text-accent hover:underline">
            ← Back to Momentella
          </Link>
        </p>
      </main>
    </>
  );
}
