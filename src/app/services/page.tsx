import { ProductGrid, type PublicProduct } from "@/components/commerce/ProductGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getUpstreamApiUrl } from "@/lib/api-origin";

export const dynamic = "force-dynamic";

async function fetchProducts(): Promise<PublicProduct[]> {
  try {
    const res = await fetch(
      `${getUpstreamApiUrl()}/api/public/products`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const j = (await res.json().catch(() => null)) as
      | { products?: PublicProduct[] }
      | null;
    return j?.products ?? [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const products = await fetchProducts();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[6.25rem] md:pt-[4.25rem]">
        <ProductGrid products={products} />
      </main>
      <SiteFooter />
    </>
  );
}
