"use client";

import type { HTMLAttributes } from "react";
import { ImageUploader } from "@/components/page/ImageUploader";
import { IntakeFormSelect } from "@/components/page/IntakeFormSelect";
import {
  BLOCK_LABELS,
  type CtaLink,
  type FeatureTile,
  type PageBlock,
  type ProcessStep,
  newBlockId,
} from "@/lib/page-schema";

type Props = {
  block: PageBlock;
  index: number;
  total: number;
  dragProps: HTMLAttributes<HTMLButtonElement>;
  onPatch: (patch: Partial<PageBlock>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function PageBlockCard({
  block,
  index,
  total,
  dragProps,
  onPatch,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: Props) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="flex flex-wrap items-start gap-3 border-b border-line/80 bg-canvas/40 px-4 py-3">
        <button
          type="button"
          className="mt-1 flex h-10 w-10 shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-lg border border-line bg-white text-ink-muted shadow-sm hover:text-ink"
          {...dragProps}
          aria-label="Drag to reorder block"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Block {index + 1} of {total}
          </p>
          <p className="text-sm font-semibold text-accent">
            {BLOCK_LABELS[block.type]}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
          >
            Up
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
          >
            Down
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </header>
      <div className="space-y-4 p-4">
        <BlockEditor block={block} onPatch={onPatch} />
        <details className="rounded-lg border border-line/80 bg-canvas/30">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink-muted">
            Advanced (anchor link ID)
          </summary>
          <div className="border-t border-line/80 px-3 py-3">
            <label className="block text-xs text-ink-muted">
              Anchor link ID — use this if you link to this block like{" "}
              <code className="rounded bg-canvas px-1">/#about</code>.
              <input
                type="text"
                value={block.anchor ?? ""}
                onChange={(e) =>
                  onPatch({ anchor: e.target.value || undefined })
                }
                placeholder="e.g. journeys"
                className="mt-1 w-full rounded border border-line px-2 py-1 font-mono text-xs"
              />
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onPatch,
}: {
  block: PageBlock;
  onPatch: (patch: Partial<PageBlock>) => void;
}) {
  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <ImageInput
            url={block.imageUrl}
            alt={block.imageAlt}
            onChange={(imageUrl, imageAlt) => onPatch({ imageUrl, imageAlt })}
          />
          <TextInput
            label="Eyebrow (small text above headline)"
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
          />
          <TextInput
            label="Headline (main line)"
            value={block.headline}
            onChange={(v) => onPatch({ headline: v })}
          />
          <TextInput
            label="Headline tail (shown muted, optional)"
            value={block.headlineMuted ?? ""}
            onChange={(v) => onPatch({ headlineMuted: v || undefined })}
          />
          <TextareaInput
            label="Supporting paragraph"
            value={block.body ?? ""}
            onChange={(v) => onPatch({ body: v || undefined })}
          />
          <CtaInput
            label="Primary button"
            value={block.primaryCta}
            onChange={(v) => onPatch({ primaryCta: v })}
          />
          <CtaInput
            label="Secondary button (optional)"
            value={block.secondaryCta}
            onChange={(v) => onPatch({ secondaryCta: v })}
          />
          <label className="text-xs font-semibold text-ink-muted">
            Height
            <select
              value={block.height ?? "tall"}
              onChange={(e) =>
                onPatch({ height: e.target.value as "short" | "medium" | "tall" })
              }
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            >
              <option value="short">Short (60% of screen)</option>
              <option value="medium">Medium (~76%)</option>
              <option value="tall">Tall (~92%)</option>
            </select>
          </label>
        </div>
      );

    case "editorial_intro":
      return (
        <div className="space-y-4">
          <TextareaInput
            label="Bold quote / opening line"
            value={block.quote}
            onChange={(v) => onPatch({ quote: v })}
          />
          <TextareaInput
            label="Muted continuation (optional)"
            value={block.quoteMuted ?? ""}
            onChange={(v) => onPatch({ quoteMuted: v || undefined })}
          />
          <ListEditor
            label="Supporting paragraphs"
            addLabel="+ Add paragraph"
            values={block.paragraphs}
            onChange={(paragraphs) => onPatch({ paragraphs })}
            renderItem={(val, setVal) => (
              <textarea
                value={val}
                onChange={(e) => setVal(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
              />
            )}
            blank={() => ""}
          />
        </div>
      );

    case "feature_tiles":
      return (
        <div className="space-y-4">
          <TextInput
            label="Eyebrow (optional)"
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
          />
          <TextInput
            label="Section title"
            value={block.title}
            onChange={(v) => onPatch({ title: v })}
          />
          <TextareaInput
            label="Intro paragraph (optional)"
            value={block.body ?? ""}
            onChange={(v) => onPatch({ body: v || undefined })}
          />
          <ListEditor<FeatureTile>
            label="Tiles"
            addLabel="+ Add tile"
            values={block.tiles}
            onChange={(tiles) => onPatch({ tiles })}
            renderItem={(t, setT) => (
              <div className="space-y-3">
                <ImageInput
                  url={t.imageUrl}
                  alt={t.imageAlt}
                  onChange={(imageUrl, imageAlt) =>
                    setT({ ...t, imageUrl, imageAlt })
                  }
                  compact
                />
                <TextInput
                  label="Tile title"
                  value={t.title}
                  onChange={(v) => setT({ ...t, title: v })}
                />
                <TextareaInput
                  label="Tile body"
                  value={t.body}
                  onChange={(v) => setT({ ...t, body: v })}
                />
              </div>
            )}
            blank={() => ({
              id: newBlockId("tile"),
              title: "New tile",
              body: "",
              imageUrl: "",
              imageAlt: "",
            })}
          />
        </div>
      );

    case "process_steps":
      return (
        <div className="space-y-4">
          <TextInput
            label="Eyebrow (optional)"
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
          />
          <TextInput
            label="Section title"
            value={block.title}
            onChange={(v) => onPatch({ title: v })}
          />
          <TextareaInput
            label="Intro paragraph (optional)"
            value={block.body ?? ""}
            onChange={(v) => onPatch({ body: v || undefined })}
          />
          <ListEditor<ProcessStep>
            label="Steps"
            addLabel="+ Add step"
            values={block.steps}
            onChange={(steps) => onPatch({ steps })}
            renderItem={(s, setS) => (
              <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
                <TextInput
                  label="Number"
                  value={s.number}
                  onChange={(v) => setS({ ...s, number: v })}
                />
                <div className="space-y-3">
                  <TextInput
                    label="Step title"
                    value={s.title}
                    onChange={(v) => setS({ ...s, title: v })}
                  />
                  <TextareaInput
                    label="Step body"
                    value={s.body}
                    onChange={(v) => setS({ ...s, body: v })}
                  />
                </div>
              </div>
            )}
            blank={() => ({
              id: newBlockId("step"),
              number: "01",
              title: "New step",
              body: "",
            })}
          />
        </div>
      );

    case "testimonial":
      return (
        <div className="space-y-4">
          <TextareaInput
            label="Quote"
            value={block.quote}
            onChange={(v) => onPatch({ quote: v })}
            rows={5}
          />
          <TextInput
            label="Attribution (optional)"
            value={block.attribution ?? ""}
            onChange={(v) => onPatch({ attribution: v || undefined })}
            placeholder="— A Momentella family"
          />
          <TextInput
            label="Sublabel (optional)"
            value={block.sublabel ?? ""}
            onChange={(v) => onPatch({ sublabel: v || undefined })}
            placeholder="Southern Europe & the islands"
          />
        </div>
      );

    case "cta_split":
      return (
        <div className="space-y-4">
          <TextInput
            label="Eyebrow (optional)"
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
          />
          <TextInput
            label="Title"
            value={block.title}
            onChange={(v) => onPatch({ title: v })}
          />
          <CtaInput
            label="Button"
            value={block.cta}
            onChange={(v) =>
              onPatch({ cta: v ?? { label: "", href: "" } })
            }
            required
          />
        </div>
      );

    case "rich_text":
      return (
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-ink-muted">
            Column width
            <select
              value={block.maxWidth ?? "normal"}
              onChange={(e) =>
                onPatch({ maxWidth: e.target.value as "narrow" | "normal" | "wide" })
              }
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            >
              <option value="narrow">Narrow</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
          </label>
          <ListEditor
            label="Paragraphs"
            addLabel="+ Add paragraph"
            values={block.paragraphs}
            onChange={(paragraphs) => onPatch({ paragraphs })}
            renderItem={(val, setVal) => (
              <textarea
                value={val}
                onChange={(e) => setVal(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
              />
            )}
            blank={() => ""}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <ImageInput
            url={block.imageUrl}
            alt={block.imageAlt}
            onChange={(imageUrl, imageAlt) => onPatch({ imageUrl, imageAlt })}
          />
          <TextInput
            label="Caption (optional)"
            value={block.caption ?? ""}
            onChange={(v) => onPatch({ caption: v || undefined })}
          />
          <label className="block text-xs font-semibold text-ink-muted">
            Image width
            <select
              value={block.maxWidth ?? "normal"}
              onChange={(e) =>
                onPatch({ maxWidth: e.target.value as "narrow" | "normal" | "full" })
              }
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            >
              <option value="narrow">Narrow</option>
              <option value="normal">Normal</option>
              <option value="full">Full width</option>
            </select>
          </label>
        </div>
      );

    case "spacer":
      return (
        <label className="block text-xs font-semibold text-ink-muted">
          Size
          <select
            value={block.size}
            onChange={(e) =>
              onPatch({ size: e.target.value as "small" | "medium" | "large" })
            }
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      );

    case "intake_form":
      return (
        <div className="space-y-4">
          <IntakeFormSelect
            value={block.slug}
            onChange={(slug) => onPatch({ slug })}
          />
          <TextInput
            label="Eyebrow (optional)"
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
          />
          <TextInput
            label="Section title (optional)"
            value={block.title ?? ""}
            onChange={(v) => onPatch({ title: v || undefined })}
          />
          <TextareaInput
            label="Intro paragraph (optional)"
            value={block.body ?? ""}
            onChange={(v) => onPatch({ body: v || undefined })}
          />
        </div>
      );

    default: {
      const _ex: never = block;
      return _ex;
    }
  }
}

// ---------- shared subfield components ----------

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-ink-muted">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block text-xs font-semibold text-ink-muted">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
      />
    </label>
  );
}

function ImageInput({
  url,
  alt,
  onChange,
  compact = false,
}: {
  url: string;
  alt: string;
  onChange: (url: string, alt: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-line bg-canvas/40 p-3">
      <div
        className={`relative w-full overflow-hidden rounded-lg border border-line bg-ink/5 ${compact ? "aspect-[16/10]" : "aspect-[16/7]"}`}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={alt} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("", alt)}
              className="absolute right-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-semibold text-canvas shadow hover:bg-ink"
            >
              Remove
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-ink-muted">
            No image yet — upload below or paste a public URL.
          </div>
        )}
      </div>
      <ImageUploader
        compact={compact}
        onUploaded={(uploaded) => onChange(uploaded, alt)}
      />
      <TextInput
        label="…or paste an image URL"
        value={url}
        onChange={(v) => onChange(v, alt)}
        placeholder="https://…"
      />
      <TextInput
        label="Alt text (what screen readers read)"
        value={alt}
        onChange={(v) => onChange(url, v)}
        placeholder="Family at the beach at sunset"
      />
    </div>
  );
}

function CtaInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: CtaLink | undefined;
  onChange: (v: CtaLink | undefined) => void;
  required?: boolean;
}) {
  const cur = value ?? { label: "", href: "" };
  const empty = !cur.label && !cur.href;
  return (
    <fieldset className="rounded-xl border border-line/80 bg-canvas/40 p-3">
      <legend className="px-1 text-xs font-semibold text-ink-muted">
        {label}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput
          label="Button text"
          value={cur.label}
          onChange={(v) => onChange({ label: v, href: cur.href })}
        />
        <TextInput
          label="Link (URL or #anchor)"
          value={cur.href}
          onChange={(v) => onChange({ label: cur.label, href: v })}
          placeholder="#contact or https://…"
        />
      </div>
      {!required && !empty ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="mt-3 text-xs font-semibold text-red-800 hover:underline"
        >
          Remove this button
        </button>
      ) : null}
    </fieldset>
  );
}

function ListEditor<T>({
  label,
  addLabel,
  values,
  onChange,
  renderItem,
  blank,
}: {
  label: string;
  addLabel: string;
  values: T[];
  onChange: (v: T[]) => void;
  renderItem: (val: T, setVal: (val: T) => void) => React.ReactNode;
  blank: () => T;
}) {
  function setAt(i: number, v: T) {
    const copy = [...values];
    copy[i] = v;
    onChange(copy);
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const copy = [...values];
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
    onChange(copy);
  }
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      {values.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-ink-muted">
          Nothing yet.
        </p>
      ) : null}
      {values.map((val, i) => (
        <div
          key={i}
          className="rounded-xl border border-line bg-white/70 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Item {i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="rounded border border-line bg-white px-2 py-0.5 text-[10px] font-semibold disabled:opacity-40"
              >
                Up
              </button>
              <button
                type="button"
                disabled={i === values.length - 1}
                onClick={() => move(i, 1)}
                className="rounded border border-line bg-white px-2 py-0.5 text-[10px] font-semibold disabled:opacity-40"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded border border-red-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-red-800 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
          {renderItem(val, (nv) => setAt(i, nv))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, blank()])}
        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
      >
        {addLabel}
      </button>
    </div>
  );
}
