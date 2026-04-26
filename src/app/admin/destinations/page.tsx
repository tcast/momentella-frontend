import Link from "next/link";
import { DestinationsAdminClient } from "@/components/admin/DestinationsAdminClient";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export type AdminDestination = {
  id: string;
  slug: string;
  name: string;
  type: "COUNTRY" | "REGION" | "CITY" | "AREA" | "PARK" | "RESORT" | "VENUE";
  country: string | null;
  region: string | null;
  aliases: string | null;
  active: boolean;
};

export default async function AdminDestinationsPage() {
  const data = await serverFetchJson<{ destinations: AdminDestination[] }>(
    "/api/admin/destinations?includeInactive=1",
  );
  const destinations = data?.destinations ?? [];

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
          Destinations
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          This is the catalog guests see when you use a{" "}
          <strong>Destination picker</strong> on a form. Add any missing
          places — a city, a country, a theme park, a resort, anything you sell.
          Aliases help search (e.g. add <strong>WDW, Disney</strong> to “Walt
          Disney World”).
        </p>
      </div>
      <DestinationsAdminClient initial={destinations} />
    </div>
  );
}
