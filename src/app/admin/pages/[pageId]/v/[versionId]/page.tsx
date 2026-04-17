import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBuilderClient } from "@/components/page/PageBuilderClient";
import {
  PAGE_SCHEMA_VERSION,
  parsePageSchema,
  type PageSchema,
} from "@/lib/page-schema";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export default async function PageVersionBuilder({
  params,
}: {
  params: Promise<{ pageId: string; versionId: string }>;
}) {
  const { pageId, versionId } = await params;
  const data = await serverFetchJson<{
    page: {
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
  }>(`/api/admin/pages/${pageId}`);
  if (!data?.page) notFound();
  const ver = data.page.versions.find((v) => v.id === versionId);
  if (!ver) notFound();
  const schema: PageSchema =
    parsePageSchema(ver.schema) ?? {
      version: PAGE_SCHEMA_VERSION,
      blocks: [],
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/pages" className="hover:text-ink">
          Marketing pages
        </Link>
        <span>/</span>
        <Link href={`/admin/pages/${pageId}`} className="hover:text-ink">
          {data.page.name}
        </Link>
        <span>/</span>
        <span className="text-ink">Version {ver.version}</span>
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {data.page.name} — version {ver.version}
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
          Drop in blocks, rearrange them by dragging, edit the text and images
          right in the cards. Use <strong>Preview as visitor</strong> to see
          exactly what the public will see. <strong>Publish</strong> pushes
          this version live at the page URL.
        </p>
      </div>
      <PageBuilderClient
        pageId={pageId}
        slug={data.page.slug}
        versionId={versionId}
        versionLabel={ver.label}
        initialSchema={schema}
      />
    </div>
  );
}
