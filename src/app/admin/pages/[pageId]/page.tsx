import Link from "next/link";
import { notFound } from "next/navigation";
import { PageVersionsClient } from "@/components/page/PageVersionsClient";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type Version = {
  id: string;
  version: number;
  label: string | null;
  published: boolean;
  updatedAt: string;
};

type PageDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  archived: boolean;
  versions: Version[];
};

export default async function AdminPageDetailPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const data = await serverFetchJson<{ page: PageDetail }>(
    `/api/admin/pages/${pageId}`,
  );
  if (!data?.page) notFound();
  const publicHref = data.page.slug === "home" ? "/" : `/p/${data.page.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/pages" className="hover:text-ink">
          Marketing pages
        </Link>
        <span>/</span>
        <span className="text-ink">{data.page.name}</span>
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {data.page.name}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Public URL:{" "}
          <Link
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            {publicHref}
          </Link>
        </p>
      </div>
      <PageVersionsClient
        pageId={data.page.id}
        slug={data.page.slug}
        name={data.page.name}
        description={data.page.description}
        archived={data.page.archived}
        versions={data.page.versions}
      />
    </div>
  );
}
