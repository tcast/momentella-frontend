"use client";

import { useCallback, useMemo } from "react";
import {
  type ComboOption,
  SearchableCombobox,
} from "@/components/ui/SearchableCombobox";
import { getPublicAppUrl } from "@/lib/env-public";

export interface DestinationValue {
  id: string;
  slug: string;
  name: string;
  type: string;
  country?: string | null;
  region?: string | null;
}

interface ApiDestination {
  id: string;
  slug: string;
  name: string;
  type: string;
  country: string | null;
  region: string | null;
  aliases: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  COUNTRY: "Country",
  REGION: "State / Region",
  CITY: "City",
  AREA: "Area / Region",
  PARK: "Theme park",
  RESORT: "Resort",
  VENUE: "Venue",
};

function asOption(d: ApiDestination): ComboOption<DestinationValue> {
  const loc = [d.region, d.country].filter(Boolean).join(", ");
  const sub = [TYPE_LABEL[d.type] ?? d.type, loc].filter(Boolean).join(" • ");
  return {
    id: d.id,
    label: d.name,
    sub,
    data: {
      id: d.id,
      slug: d.slug,
      name: d.name,
      type: d.type,
      country: d.country,
      region: d.region,
    },
  };
}

function asSelectedOption(v: DestinationValue): ComboOption<DestinationValue> {
  const loc = [v.region, v.country].filter(Boolean).join(", ");
  const sub = [TYPE_LABEL[v.type] ?? v.type, loc].filter(Boolean).join(" • ");
  return { id: v.id, label: v.name, sub, data: v };
}

export function DestinationPicker({
  value,
  onChange,
  placeholder,
}: {
  value: DestinationValue | null;
  onChange: (v: DestinationValue | null) => void;
  placeholder?: string;
}) {
  const selected = useMemo(
    () => (value ? asSelectedOption(value) : null),
    [value],
  );
  const search = useCallback(async (q: string) => {
    const url = new URL("/api/public/destinations", getPublicAppUrl());
    if (q) url.searchParams.set("q", q);
    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) return [];
    const j = (await res.json().catch(() => null)) as
      | { destinations?: ApiDestination[] }
      | null;
    return (j?.destinations ?? []).map(asOption);
  }, []);

  return (
    <SearchableCombobox
      value={selected}
      onChange={(opt) => onChange(opt ? opt.data : null)}
      onSearch={search}
      placeholder={placeholder ?? "Type a city, country, park, or region"}
      emptyLabel="Nothing matched. Try a broader term (e.g. “Italy”)."
    />
  );
}

export function DestinationMultiPicker({
  value,
  onChange,
  placeholder,
}: {
  value: DestinationValue[];
  onChange: (v: DestinationValue[]) => void;
  placeholder?: string;
}) {
  const selectedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  function add(v: DestinationValue | null) {
    if (!v) return;
    if (selectedIds.has(v.id)) return;
    onChange([...value, v]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((v) => (
            <li
              key={v.id}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink shadow-sm"
            >
              <span>{v.name}</span>
              <button
                type="button"
                onClick={() => remove(v.id)}
                className="-mr-1 rounded-full px-1 text-xs text-ink-muted hover:text-red-800"
                aria-label={`Remove ${v.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <DestinationPicker
        value={null}
        onChange={add}
        placeholder={
          placeholder ?? "Add another — city, country, park, or region"
        }
      />
    </div>
  );
}
