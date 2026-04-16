/** Mirrors backend `intake-schema.ts` for UI — keep field types in sync. */

export const FORM_SCHEMA_VERSION = 1 as const;

export type FormFieldType =
  | "section"
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox"
  | "travel_party";

export interface FieldOption {
  value: string;
  label: string;
}

interface FormFieldBase {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  required?: boolean;
}

export interface SectionField extends FormFieldBase {
  type: "section";
}

export interface TextField extends FormFieldBase {
  type: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
}

export interface NumberField extends FormFieldBase {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface DateField extends FormFieldBase {
  type: "date";
}

export interface SelectField extends FormFieldBase {
  type: "select" | "multiselect";
  options: FieldOption[];
}

export interface CheckboxField extends FormFieldBase {
  type: "checkbox";
}

export interface TravelPartyField extends FormFieldBase {
  type: "travel_party";
  minAdults?: number;
  maxAdults?: number;
  maxChildren?: number;
  collectChildAges: boolean;
}

export type FormField =
  | SectionField
  | TextField
  | NumberField
  | DateField
  | SelectField
  | CheckboxField
  | TravelPartyField;

export interface IntakeFormSchema {
  version: typeof FORM_SCHEMA_VERSION;
  fields: FormField[];
}

export function parseIntakeFormSchema(raw: unknown): IntakeFormSchema | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== FORM_SCHEMA_VERSION) return null;
  if (!Array.isArray(o.fields)) return null;
  return { version: FORM_SCHEMA_VERSION, fields: o.fields as FormField[] };
}
