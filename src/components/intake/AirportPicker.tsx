"use client";

import { useCallback, useMemo } from "react";
import {
  type ComboOption,
  SearchableCombobox,
} from "@/components/ui/SearchableCombobox";
import { getPublicAppUrl } from "@/lib/env-public";

export interface AirportValue {
  id: string;
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface ApiAirport {
  id: string;
  iata: string;
  icao: string | null;
  name: string;
  city: string;
  region: string | null;
  country: string;
}

function asOption(a: ApiAirport): ComboOption<AirportValue> {
  return {
    id: a.id,
    label: `${a.iata} — ${a.name}`,
    sub: `${a.city}${a.region ? `, ${a.region}` : ""} • ${a.country}`,
    data: {
      id: a.id,
      iata: a.iata,
      name: a.name,
      city: a.city,
      country: a.country,
    },
  };
}

export function AirportPicker({
  value,
  onChange,
  placeholder,
}: {
  value: AirportValue | null;
  onChange: (v: AirportValue | null) => void;
  placeholder?: string;
}) {
  const selected = useMemo<ComboOption<AirportValue> | null>(() => {
    if (!value) return null;
    return {
      id: value.id,
      label: `${value.iata} — ${value.name}`,
      sub: `${value.city} • ${value.country}`,
      data: value,
    };
  }, [value]);

  const search = useCallback(async (q: string) => {
    const url = new URL(
      "/api/public/airports",
      getPublicAppUrl(),
    );
    if (q) url.searchParams.set("q", q);
    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) return [];
    const j = (await res.json().catch(() => null)) as
      | { airports?: ApiAirport[] }
      | null;
    return (j?.airports ?? []).map(asOption);
  }, []);

  return (
    <SearchableCombobox
      value={selected}
      onChange={(opt) => onChange(opt ? opt.data : null)}
      onSearch={search}
      placeholder={placeholder ?? "Search by city, name, or code (e.g. DTW, Detroit)"}
      emptyLabel="No airports match. Try the city or 3-letter code."
    />
  );
}
