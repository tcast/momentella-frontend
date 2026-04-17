import Link from "next/link";
import { AirportsAdminClient } from "@/components/admin/AirportsAdminClient";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export type AdminAirport = {
  id: string;
  iata: string;
  icao: string | null;
  name: string;
  city: string;
  region: string | null;
  country: string;
  countryCode: string;
  active: boolean;
};

export default async function AdminAirportsPage() {
  const data = await serverFetchJson<{ airports: AdminAirport[] }>(
    "/api/admin/airports?includeInactive=1",
  );
  const airports = data?.airports ?? [];

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
          Airports
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          This is the list guests see when you use a <strong>Home airport</strong>{" "}
          question on an intake form. Add any missing ones, correct spellings, or
          turn off airports you don’t want offered. Guests can search by city
          name, airport name, or 3-letter code.
        </p>
      </div>
      <AirportsAdminClient initial={airports} />
    </div>
  );
}
