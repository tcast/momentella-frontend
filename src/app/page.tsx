import { EditorialIntro } from "@/components/EditorialIntro";
import { Hero } from "@/components/Hero";
import { InstagramCta } from "@/components/InstagramCta";
import { JourneyTiles } from "@/components/JourneyTiles";
import { PageRenderer } from "@/components/page/PageRenderer";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Testimonial } from "@/components/Testimonial";
import { parsePageSchema, type PageSchema } from "@/lib/page-schema";
import { getUpstreamApiUrl } from "@/lib/api-origin";

export const dynamic = "force-dynamic";

/**
 * Unauthenticated homepage fetch — bypasses the cookie-forwarding
 * `serverFetchJson` helper so we can render even when no visitor is signed in.
 */
async function fetchHomeSchema(): Promise<PageSchema | null> {
  try {
    const upstream = getUpstreamApiUrl();
    const res = await fetch(`${upstream}/api/public/pages/home`, {
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

export default async function Home() {
  const schema = await fetchHomeSchema();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {schema && schema.blocks.length > 0 ? (
          <PageRenderer schema={schema} />
        ) : (
          <>
            <Hero />
            <EditorialIntro />
            <JourneyTiles />
            <ProcessSteps />
            <Testimonial />
            <InstagramCta />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
