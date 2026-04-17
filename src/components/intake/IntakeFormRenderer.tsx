"use client";

import { useMemo, useState } from "react";
import type {
  FormField,
  IntakeFormSchema,
  TravelPartyField,
} from "@/lib/intake-schema";
import { getPublicAppUrl } from "@/lib/env-public";
import {
  AirportPicker,
  type AirportValue,
} from "@/components/intake/AirportPicker";
import {
  DestinationMultiPicker,
  DestinationPicker,
  type DestinationValue,
} from "@/components/intake/DestinationPicker";

type Responses = Record<string, unknown>;

function TravelPartyEditor({
  field,
  value,
  onChange,
}: {
  field: TravelPartyField;
  value: unknown;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const v = useMemo(() => {
    if (value && typeof value === "object") {
      const o = value as Record<string, unknown>;
      return {
        adults: typeof o.adults === "number" ? o.adults : Number(o.adults) || 2,
        children:
          typeof o.children === "number" ? o.children : Number(o.children) || 0,
        childAges: Array.isArray(o.childAges)
          ? o.childAges.map((x) => Number(x) || 0)
          : [],
      };
    }
    return { adults: 2, children: 0, childAges: [] as number[] };
  }, [value]);

  function setAdults(n: number) {
    const min = field.minAdults ?? 1;
    const max = field.maxAdults ?? 20;
    onChange({
      ...v,
      adults: Math.min(max, Math.max(min, n)),
    });
  }

  function setChildren(n: number) {
    const maxC = field.maxChildren ?? 12;
    const children = Math.min(maxC, Math.max(0, n));
    const ages = v.childAges.slice(0, children);
    while (ages.length < children) ages.push(0);
    onChange({ ...v, children, childAges: ages });
  }

  function setAge(i: number, age: number) {
    const ages = [...v.childAges];
    ages[i] = age;
    onChange({ ...v, childAges: ages });
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-white/60 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Adults
          </label>
          <input
            type="number"
            min={field.minAdults ?? 1}
            max={field.maxAdults ?? 20}
            value={v.adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none ring-gold/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Children (0–17)
          </label>
          <input
            type="number"
            min={0}
            max={field.maxChildren ?? 12}
            value={v.children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none ring-gold/30 focus:ring-2"
          />
        </div>
      </div>
      {field.collectChildAges && v.children > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {v.childAges.map((age, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Child {i + 1} age
              </label>
              <input
                type="number"
                min={0}
                max={21}
                value={age}
                onChange={(e) => setAge(i, Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none ring-gold/30 focus:ring-2"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "section") return null;

  const common =
    "mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none ring-gold/30 focus:ring-2";

  switch (field.type) {
    case "travel_party":
      return (
        <TravelPartyEditor
          field={field}
          value={value}
          onChange={(o) => onChange(o)}
        />
      );
    case "textarea":
      return (
        <textarea
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={common}
        />
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-line text-accent"
          />
          <span>{field.description ?? "Yes"}</span>
        </label>
      );
    case "select":
      return (
        <select
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={common}
        >
          <option value="">Choose…</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {field.options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label
                key={o.value}
                className="flex items-center gap-2 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    if (checked) {
                      onChange(selected.filter((x) => x !== o.value));
                    } else {
                      onChange([...selected, o.value]);
                    }
                  }}
                  className="h-4 w-4 rounded border-line text-accent"
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
    }
    case "number":
      return (
        <input
          type="number"
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className={common}
        />
      );
    case "date":
      return (
        <input
          type="date"
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={common}
        />
      );
    case "text":
    case "email":
    case "tel":
      return (
        <input
          type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={common}
        />
      );
    case "airport":
      return (
        <AirportPicker
          value={(value as AirportValue | null) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case "destination": {
      if (field.allowMultiple) {
        const arr = Array.isArray(value) ? (value as DestinationValue[]) : [];
        return (
          <DestinationMultiPicker
            value={arr}
            onChange={(v) => onChange(v)}
          />
        );
      }
      return (
        <DestinationPicker
          value={(value as DestinationValue | null) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    }
    default:
      return null;
  }
}

export function IntakeFormRenderer({
  slug,
  schema,
  preview = false,
}: {
  slug: string;
  schema: IntakeFormSchema;
  /** When true, shows the form as guests see it without submitting. */
  preview?: boolean;
}) {
  const [responses, setResponses] = useState<Responses>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  function setField(id: string, v: unknown) {
    setResponses((prev) => ({ ...prev, [id]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;
    setError(null);
    const emailField = schema.fields.find((f) => f.type === "email");
    const emailRaw =
      (emailField && responses[emailField.id]) ||
      responses.contact_email ||
      responses.email;
    const email =
      typeof emailRaw === "string" ? emailRaw.trim() : "";
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(
        `${getPublicAppUrl()}/api/public/intake-forms/${encodeURIComponent(slug)}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, responses }),
        },
      );
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json
            ? String((json as { error: unknown }).error)
            : "Could not submit";
        setError(msg);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-line bg-white/70 px-6 py-8 text-center shadow-sm">
        <p className="font-display text-xl font-semibold text-ink">Thank you</p>
        <p className="mt-2 text-sm text-ink-muted">
          We received your trip intake. Our team will be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {preview ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Preview</strong> — this is how the form looks to families. Nothing is
          saved until they submit on your live page.
        </div>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      {schema.fields.map((field) => {
        if (field.type === "section") {
          return (
            <div key={field.id} className="border-t border-line pt-8 first:border-t-0 first:pt-0">
              <h3 className="font-display text-lg font-semibold text-ink">
                {field.label}
              </h3>
              {field.description ? (
                <p className="mt-1 text-sm text-ink-muted">{field.description}</p>
              ) : null}
            </div>
          );
        }
        return (
          <div key={field.id}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {field.label}
              {field.required ? (
                <span className="text-red-700"> *</span>
              ) : null}
            </label>
            {field.description && field.type !== "checkbox" ? (
              <p className="mt-1 text-xs text-ink-muted">{field.description}</p>
            ) : null}
            <div className="mt-2">
              <FieldControl
                field={field}
                value={responses[field.id]}
                onChange={(v) => setField(field.id, v)}
              />
            </div>
          </div>
        );
      })}
      <button
        type={preview ? "button" : "submit"}
        disabled={pending || preview}
        onClick={preview ? (e) => e.preventDefault() : undefined}
        className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {preview ? "Submit (disabled in preview)" : pending ? "Sending…" : "Submit intake"}
      </button>
    </form>
  );
}
