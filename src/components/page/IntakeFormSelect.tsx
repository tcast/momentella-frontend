"use client";

import { useEffect, useState } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

type FormOption = {
  id: string;
  slug: string;
  name: string;
  archived: boolean;
  hasPublished: boolean;
};

export function IntakeFormSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  const [options, setOptions] = useState<FormOption[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${getPublicAppUrl()}/api/admin/intake-forms`,
          { credentials: "include" },
        );
        if (!res.ok) {
          if (!cancelled) {
            setErr("Could not load your forms");
            setLoaded(true);
          }
          return;
        }
        const j = (await res.json().catch(() => null)) as {
          intakeForms?: {
            id: string;
            slug: string;
            name: string;
            archived: boolean;
            versions: { published: boolean }[];
          }[];
        } | null;
        const next = (j?.intakeForms ?? []).map((f) => ({
          id: f.id,
          slug: f.slug,
          name: f.name,
          archived: f.archived,
          hasPublished: f.versions.some((v) => v.published),
        }));
        if (!cancelled) {
          setOptions(next);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setErr("Network error loading forms");
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unknown =
    loaded && value && !options.some((o) => o.slug === value) ? value : null;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-ink-muted">
        Which form should appear here?
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
        >
          <option value="">— Pick a form —</option>
          {options
            .filter((o) => !o.archived)
            .map((o) => (
              <option
                key={o.id}
                value={o.slug}
                disabled={!o.hasPublished}
              >
                {o.name} ({o.slug})
                {o.hasPublished ? "" : " — no published version yet"}
              </option>
            ))}
          {unknown ? <option value={unknown}>{unknown} (unknown)</option> : null}
        </select>
      </label>
      {err ? (
        <p className="text-xs text-red-800">{err}</p>
      ) : options.length === 0 && loaded ? (
        <p className="text-xs text-ink-muted">
          You don’t have any forms yet. Create one under{" "}
          <strong>Forms</strong> first, publish it, and it’ll show up
          here.
        </p>
      ) : (
        <p className="text-xs text-ink-muted">
          Only forms with a published version can be embedded. Manage forms
          under <strong>Forms</strong>.
        </p>
      )}
    </div>
  );
}
