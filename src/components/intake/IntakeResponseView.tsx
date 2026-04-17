"use client";

import { useState } from "react";
import type { FormField, IntakeFormSchema } from "@/lib/intake-schema";

function formatValue(field: FormField, val: unknown): string {
  if (val === undefined || val === null) return "—";
  if (field.type === "travel_party" && typeof val === "object" && val !== null) {
    const tp = val as Record<string, unknown>;
    const ages = tp.childAges;
    let s = `Adults: ${String(tp.adults)}, children: ${String(tp.children)}`;
    if (Array.isArray(ages) && ages.length) {
      s += ` · ages: ${ages.join(", ")}`;
    }
    return s;
  }
  if (field.type === "multiselect" && Array.isArray(val)) {
    return val
      .map((v) => field.options.find((o) => o.value === v)?.label ?? String(v))
      .join(", ");
  }
  if (field.type === "select") {
    return field.options.find((o) => o.value === val)?.label ?? String(val);
  }
  if (typeof val === "object") {
    return JSON.stringify(val, null, 2);
  }
  return String(val);
}

export function IntakeResponseView({
  schema,
  responses,
}: {
  schema: IntakeFormSchema | null;
  responses: Record<string, unknown>;
}) {
  const [showRaw, setShowRaw] = useState(false);

  if (showRaw) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() => setShowRaw(false)}
        >
          ← Field view
        </button>
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-line bg-ink p-4 text-xs text-canvas">
          {JSON.stringify(responses, null, 2)}
        </pre>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="space-y-3">
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-line bg-canvas p-4 text-xs text-ink">
          {JSON.stringify(responses, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">Answers mapped to your form fields.</p>
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() => setShowRaw(true)}
        >
          View raw JSON
        </button>
      </div>
      <dl className="divide-y divide-line rounded-xl border border-line bg-white/60">
        {schema.fields.map((field) => {
          if (field.type === "section") {
            return (
              <div key={field.id} className="bg-canvas/50 px-4 py-2">
                <dt className="font-display text-sm font-semibold text-ink">
                  {field.label}
                </dt>
                {field.description ? (
                  <dd className="text-xs text-ink-muted">{field.description}</dd>
                ) : null}
              </div>
            );
          }
          const val = responses[field.id];
          return (
            <div key={field.id} className="px-4 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {field.label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink sm:mt-0">
                {formatValue(field, val)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
