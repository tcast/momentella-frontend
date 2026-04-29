import Link from "next/link";
import { ProductsAdminClient } from "@/components/admin/ProductsAdminClient";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export type AdminProduct = {
  id: string;
  slug: string;
  kind: string;
  name: string;
  description: string | null;
  itineraryDays: number | null;
  priceCents: number;
  stripePriceId: string | null;
  active: boolean;
  sortOrder: number;
  updatedAt: string;
};

export default async function AdminProductsPage() {
  const data = await serverFetchJson<{ products: AdminProduct[] }>(
    "/api/admin/products",
  );
  const products = data?.products ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Overview
        </Link>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          Products
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          The catalog of services you sell at{" "}
          <code className="rounded bg-canvas px-1">/services</code>. Edit
          name, description, or price; saving syncs the price to Stripe
          automatically. Mark inactive to hide a product without deleting it.
        </p>
      </div>
      <ProductsAdminClient initial={products} />
    </div>
  );
}
