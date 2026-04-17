import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page/PageRenderer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getUpstreamApiUrl } from "@/lib/api-origin";
import { parsePageSchema, type PageSchema } from "@/lib/page-schema";

export const dynamic = "force-dynamic";

async function fetchConnectPage(): Promise<PageSchema | null> {
  try {
    const upstream = getUpstreamApiUrl();
    const res = await fetch(`${upstream}/api/public/pages/connect`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = (await res.json().catch(() => null)) as
      | { version?: { schema?: unknown } }
      | null;
    return parsePageSchema(j?.version?.schema ?? null);
  } catch {
    return null;
  }
}

export default async function ConnectPage() {
  const schema = await fetchConnectPage();
  if (!schema) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageRenderer schema={schema} />
      </main>
      <SiteFooter />
    </>
  );
}
