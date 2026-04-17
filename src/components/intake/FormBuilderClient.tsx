"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type {
  FormField,
  FormFieldType,
  IntakeFormSchema,
} from "@/lib/intake-schema";
import { FORM_SCHEMA_VERSION } from "@/lib/intake-schema";
import { getPublicAppUrl } from "@/lib/env-public";
import { FormBuilderSortableRow } from "./FormBuilderSortableRow";

function newFieldId(): string {
  return `field_${Math.random().toString(36).slice(2, 10)}`;
}

function makeField(type: FormFieldType): FormField {
  const id = newFieldId();
  switch (type) {
    case "section":
      return { id, type: "section", label: "New section" };
    case "text":
      return { id, type: "text", label: "Question", required: false };
    case "email":
      return { id, type: "email", label: "Email", required: true };
    case "tel":
      return { id, type: "tel", label: "Phone" };
    case "textarea":
      return { id, type: "textarea", label: "Details" };
    case "number":
      return { id, type: "number", label: "Number", min: 0 };
    case "date":
      return { id, type: "date", label: "Date" };
    case "select":
      return {
        id,
        type: "select",
        label: "Choose one",
        options: [
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
        ],
      };
    case "multiselect":
      return {
        id,
        type: "multiselect",
        label: "Choose any",
        options: [
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
        ],
      };
    case "checkbox":
      return { id, type: "checkbox", label: "Confirm", required: false };
    case "travel_party":
      return {
        id,
        type: "travel_party",
        label: "Travelers",
        required: true,
        minAdults: 1,
        maxAdults: 12,
        maxChildren: 10,
        collectChildAges: true,
      };
    default:
      return { id, type: "text", label: "Question" };
  }
}

export function FormBuilderClient({
  formId,
  versionId,
  initialSchema,
  versionLabel,
}: {
  formId: string;
  versionId: string;
  initialSchema: IntakeFormSchema;
  versionLabel: string | null;
}) {
  const router = useRouter();
  const [schema, setSchema] = useState<IntakeFormSchema>(initialSchema);
  const [label, setLabel] = useState(versionLabel ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fields = useMemo(() => schema.fields, [schema.fields]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSchema((s) => {
      const oldIndex = s.fields.findIndex((f) => f.id === active.id);
      const newIndex = s.fields.findIndex((f) => f.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return s;
      return { ...s, fields: arrayMove(s.fields, oldIndex, newIndex) };
    });
  }

  function move(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    setSchema((s) => {
      const copy = [...s.fields];
      const t = copy[idx]!;
      copy[idx] = copy[next]!;
      copy[next] = t;
      return { ...s, fields: copy };
    });
  }

  function remove(idx: number) {
    setSchema((s) => ({
      ...s,
      fields: s.fields.filter((_, i) => i !== idx),
    }));
  }

  function patchField(idx: number, patch: Partial<FormField>) {
    setSchema((s) => {
      const copy = [...s.fields];
      const cur = copy[idx];
      if (!cur) return s;
      copy[idx] = { ...cur, ...patch } as FormField;
      return { ...s, fields: copy };
    });
  }

  function addField(type: FormFieldType) {
    setSchema((s) => ({
      ...s,
      fields: [...s.fields, makeField(type)],
    }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/intake-forms/${formId}/versions/${versionId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema, label: label || null }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        const msg =
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Save failed";
        setError(msg);
        return;
      }
      router.refresh();
    });
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/intake-forms/${formId}/versions/${versionId}/publish`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        setError("Could not publish");
        return;
      }
      router.refresh();
      router.push(`/admin/intake/${formId}`);
    });
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Version label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => void publish()}
          disabled={pending}
          className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"
        >
          Publish this version
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Add field:
        </span>
        {(
          [
            "section",
            "text",
            "email",
            "textarea",
            "number",
            "date",
            "select",
            "multiselect",
            "checkbox",
            "travel_party",
          ] as const
        ).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addField(t)}
            className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink hover:bg-canvas"
          >
            + {t.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-muted">
        Drag <span className="font-semibold">⠿</span> to reorder fields (or use Up / Down).
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-4">
            {fields.map((field, idx) => (
              <FormBuilderSortableRow key={field.id} id={field.id}>
                {(dragProps) => (
                  <div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="cursor-grab touch-manipulation text-lg leading-none text-ink-muted hover:text-ink"
                {...dragProps}
                aria-label="Drag to reorder"
              >
                ⠿
              </button>
              <span className="text-xs font-mono text-ink-muted">{field.type}</span>
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => move(idx, -1)}
              >
                Up
              </button>
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => move(idx, 1)}
              >
                Down
              </button>
              <button
                type="button"
                className="text-xs text-red-800 hover:underline"
                onClick={() => remove(idx)}
              >
                Remove
              </button>
            </div>
            {field.type !== "section" ? (
              <label className="mt-2 block text-xs font-semibold uppercase text-ink-muted">
                Field id (stable)
                <input
                  value={field.id}
                  onChange={(e) => patchField(idx, { id: e.target.value } as Partial<FormField>)}
                  className="mt-1 w-full font-mono text-xs text-ink"
                />
              </label>
            ) : null}
            <label className="mt-2 block text-sm font-semibold text-ink">
              Label
              <input
                value={field.label}
                onChange={(e) => patchField(idx, { label: e.target.value })}
                className="mt-1 w-full rounded border border-line bg-canvas px-2 py-1.5 text-sm"
              />
            </label>
            {"description" in field && field.type !== "checkbox" ? (
              <label className="mt-2 block text-xs text-ink-muted">
                Description
                <input
                  value={field.description ?? ""}
                  onChange={(e) =>
                    patchField(idx, { description: e.target.value || undefined })
                  }
                  className="mt-1 w-full rounded border border-line bg-canvas px-2 py-1.5 text-sm text-ink"
                />
              </label>
            ) : null}
            {field.type !== "section" ? (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!field.required}
                  onChange={(e) => patchField(idx, { required: e.target.checked })}
                />
                Required
              </label>
            ) : null}
            {(field.type === "select" || field.type === "multiselect") && (
              <label className="mt-2 block text-xs text-ink-muted">
                Options (JSON array of {"{value,label}"})
                <textarea
                  value={JSON.stringify(field.options, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value) as {
                        value: string;
                        label: string;
                      }[];
                      patchField(idx, { options: parsed });
                    } catch {
                      /* ignore */
                    }
                  }}
                  rows={6}
                  className="mt-1 w-full font-mono text-xs text-ink"
                />
              </label>
            )}
            {field.type === "travel_party" && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.collectChildAges}
                  onChange={(e) =>
                    patchField(idx, { collectChildAges: e.target.checked })
                  }
                />
                Collect child ages
              </label>
            )}
                  </div>
                )}
              </FormBuilderSortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
