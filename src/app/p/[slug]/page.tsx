import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page/PageRenderer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getUpstreamApiUrl } from "@/lib/api-origin";
import { parsePageSchema, type PageSchema } from "@/lib/page-schema";

export const dynamic = "force-dynamic";

async function fetchPage(slug: string): Promise<{
  page: { name: string; description: string | null };
  schema: PageSchema;
} | null> {
  try {
    const upstream = getUpstreamApiUrl();
    const res = await fetch(`${upstream}/api/public/pages/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json().catch(() => null)) as {
      page?: { name: string; description: string | null };
      version?: { schema: unknown };
    } | null;
    const schema = parsePageSchema(j?.version?.schema ?? null);
    if (!schema || !j?.page) return null;
    return { page: j.page, schema };
  } catch {
    return null;
  }
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "home") notFound();
  const data = await fetchPage(slug);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageRenderer schema={data.schema} />
      </main>
      <SiteFooter />
    </>
  );
}
