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
import { getPublicAppUrl } from "@/lib/env-public";
import { AddFieldPicker } from "./AddFieldPicker";
import { FormBuilderQuestionCard } from "./FormBuilderQuestionCard";
import { FormBuilderSortableRow } from "./FormBuilderSortableRow";
import { IntakeFormRenderer } from "./IntakeFormRenderer";

function newFieldId(): string {
  return `field_${Math.random().toString(36).slice(2, 10)}`;
}

function makeField(type: FormFieldType): FormField {
  const id = newFieldId();
  switch (type) {
    case "section":
      return {
        id,
        type: "section",
        label: "New section",
        description: "",
      };
    case "text":
      return { id, type: "text", label: "Your question here", required: false };
    case "email":
      return { id, type: "email", label: "Email address", required: true };
    case "tel":
      return { id, type: "tel", label: "Phone number" };
    case "textarea":
      return {
        id,
        type: "textarea",
        label: "Tell us more",
        required: false,
      };
    case "number":
      return { id, type: "number", label: "Number", min: 0 };
    case "date":
      return { id, type: "date", label: "Date" };
    case "select":
      return {
        id,
        type: "select",
        label: "Choose one option",
        options: [
          { value: "option_1", label: "First option" },
          { value: "option_2", label: "Second option" },
        ],
      };
    case "multiselect":
      return {
        id,
        type: "multiselect",
        label: "Select all that apply",
        options: [
          { value: "option_1", label: "First option" },
          { value: "option_2", label: "Second option" },
        ],
      };
    case "checkbox":
      return {
        id,
        type: "checkbox",
        label: "I agree to the terms",
        required: false,
      };
    case "travel_party":
      return {
        id,
        type: "travel_party",
        label: "Who will be traveling?",
        required: true,
        minAdults: 1,
        maxAdults: 12,
        maxChildren: 10,
        collectChildAges: true,
      };
    case "airport":
      return {
        id,
        type: "airport",
        label: "Home airport",
        description: "Type a city, airport name, or 3-letter code (e.g. DTW).",
      };
    case "destination":
      return {
        id,
        type: "destination",
        label: "Where would you like to go?",
        allowMultiple: true,
      };
    default:
      return { id, type: "text", label: "Your question here" };
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
  const [tab, setTab] = useState<"design" | "preview">("design");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
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
    setTab("design");
  }

  function insertField(field: FormField) {
    setSchema((s) => ({
      ...s,
      fields: [...s.fields, field],
    }));
    setTab("design");
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
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-line bg-gradient-to-b from-white to-canvas/80 p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-ink">
          Build your intake form
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Add questions in plain language. Drag the grip icon to change order. Use{" "}
          <strong>Preview</strong> to see exactly what travelers see. When you’re
          ready, <strong>Publish</strong> makes this version live on your website.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink">
              Name this version <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1.5 w-full min-w-[12rem] rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm sm:max-w-xs"
              placeholder="e.g. Spring 2026"
            />
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={pending}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas shadow-sm hover:bg-accent-deep disabled:opacity-60"
          >
            Save my changes
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={pending}
            className="rounded-full border-2 border-accent bg-white px-6 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-accent/5 disabled:opacity-60"
          >
            Publish — go live
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full border border-line bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("design")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "design"
              ? "bg-ink text-canvas shadow"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Design
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "preview"
              ? "bg-ink text-canvas shadow"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Preview as guest
        </button>
      </div>

      {tab === "preview" ? (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <IntakeFormRenderer slug="preview" schema={schema} preview />
        </div>
      ) : (
        <>
          <AddFieldPicker onPickType={addField} onInsertField={insertField} />

          {fields.length === 0 ? (
            <p className="text-center text-sm text-ink-muted">
              No questions yet. Tap <strong>Add a question or section</strong> above.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-muted">
                <strong>Tip:</strong> Drag the{" "}
                <span className="inline-block rounded border border-line bg-white px-1">
                  ⋮⋮
                </span>{" "}
                handle to reorder. Use Up/Down if you prefer buttons.
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
                  <ul className="space-y-5">
                    {fields.map((field, idx) => (
                      <FormBuilderSortableRow key={field.id} id={field.id}>
                        {(dragProps) => (
                          <FormBuilderQuestionCard
                            field={field}
                            index={idx}
                            dragProps={dragProps}
                            onPatch={(patch) => patchField(idx, patch)}
                            onRemove={() => remove(idx)}
                            onMoveUp={() => move(idx, -1)}
                            onMoveDown={() => move(idx, 1)}
                            canMoveUp={idx > 0}
                            canMoveDown={idx < fields.length - 1}
                          />
                        )}
                      </FormBuilderSortableRow>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </>
          )}
        </>
      )}
    </div>
  );
}
