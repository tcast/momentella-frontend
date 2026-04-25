"use client";

import { IntakeFormBlockView } from "@/components/page/IntakeFormBlockView";
import {
  type CtaSplitBlock,
  type EditorialIntroBlock,
  type FeatureTilesBlock,
  type HeroBlock,
  type ImageBlock,
  type IntakeFormBlock,
  type PageBlock,
  type ProcessStepsBlock,
  type RichTextBlock,
  type SpacerBlock,
  type TestimonialBlock,
  newBlockId,
} from "@/lib/page-schema";
import { EditableImage } from "./EditableImage";
import { EditableText } from "./EditableText";

function setAt<T>(arr: T[], i: number, v: T): T[] {
  const copy = [...arr];
  copy[i] = v;
  return copy;
}

export function EditableBlock({
  block,
  onPatch,
}: {
  block: PageBlock;
  onPatch: (patch: Partial<PageBlock>) => void;
}) {
  switch (block.type) {
    case "hero":
      return <HeroEditable block={block} onPatch={onPatch} />;
    case "editorial_intro":
      return <EditorialIntroEditable block={block} onPatch={onPatch} />;
    case "feature_tiles":
      return <FeatureTilesEditable block={block} onPatch={onPatch} />;
    case "process_steps":
      return <ProcessStepsEditable block={block} onPatch={onPatch} />;
    case "testimonial":
      return <TestimonialEditable block={block} onPatch={onPatch} />;
    case "cta_split":
      return <CtaSplitEditable block={block} onPatch={onPatch} />;
    case "rich_text":
      return <RichTextEditable block={block} onPatch={onPatch} />;
    case "image":
      return <ImageEditable block={block} onPatch={onPatch} />;
    case "spacer":
      return <SpacerEditable block={block} onPatch={onPatch} />;
    case "intake_form":
      return <IntakeFormEditable block={block} onPatch={onPatch} />;
    default: {
      const _ex: never = block;
      return _ex;
    }
  }
}

// ─── HERO ───────────────────────────────────────────────────────────────────
function HeroEditable({
  block,
  onPatch,
}: {
  block: HeroBlock;
  onPatch: (p: Partial<HeroBlock>) => void;
}) {
  const minH =
    block.height === "short"
      ? "min-h-[60vh]"
      : block.height === "medium"
        ? "min-h-[76vh]"
        : "min-h-[88vh]";
  return (
    <section
      className={`relative ${minH} overflow-hidden`}
    >
      <div className="absolute inset-0">
        <EditableImage
          url={block.imageUrl}
          alt={block.imageAlt}
          emptyHint="Add a hero image"
          onChange={({ url, alt }) =>
            onPatch({ imageUrl: url, imageAlt: alt })
          }
        />
      </div>
      {block.imageUrl ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/40 to-stone-900/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-stone-950/45 via-transparent to-transparent"
            aria-hidden
          />
        </>
      ) : null}
      <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-5 pb-16 pt-20 sm:px-8 sm:pb-20 md:justify-center md:pb-24 md:pt-24"
        style={{ minHeight: "inherit" }}
      >
        <EditableText
          value={block.eyebrow ?? ""}
          onChange={(v) => onPatch({ eyebrow: v || undefined })}
          placeholder="Eyebrow (optional)"
          className="mb-4 max-w-xl text-xs font-semibold uppercase tracking-[0.28em] text-stone-200/95 mix-blend-screen"
        />
        <h1 className="font-display text-balance text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:max-w-3xl md:text-6xl lg:text-[4.25rem]">
          <EditableText
            value={block.headline}
            onChange={(v) => onPatch({ headline: v })}
            placeholder="Your headline here"
          />
          <EditableText
            value={block.headlineMuted ?? ""}
            onChange={(v) => onPatch({ headlineMuted: v || undefined })}
            placeholder="Muted second line (optional)"
            className="text-stone-200"
          />
        </h1>
        <EditableText
          value={block.body ?? ""}
          onChange={(v) => onPatch({ body: v || undefined })}
          placeholder="Supporting paragraph (optional)"
          multiline
          className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-200/95 sm:text-xl"
        />
        <CtaButtonsEditable
          primary={block.primaryCta}
          secondary={block.secondaryCta}
          onChangePrimary={(v) => onPatch({ primaryCta: v })}
          onChangeSecondary={(v) => onPatch({ secondaryCta: v })}
        />
      </div>
    </section>
  );
}

// ─── EDITORIAL INTRO ────────────────────────────────────────────────────────
function EditorialIntroEditable({
  block,
  onPatch,
}: {
  block: EditorialIntroBlock;
  onPatch: (p: Partial<EditorialIntroBlock>) => void;
}) {
  return (
    <section className="border-b border-line bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 lg:items-start">
          <blockquote className="font-display text-balance text-3xl font-medium leading-snug text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
            <EditableText
              value={block.quote}
              onChange={(v) => onPatch({ quote: v })}
              placeholder="A bold opening line"
              multiline
            />
            <EditableText
              value={block.quoteMuted ?? ""}
              onChange={(v) => onPatch({ quoteMuted: v || undefined })}
              placeholder="Muted continuation (optional)"
              multiline
              className="text-ink-muted"
            />
          </blockquote>
          <div className="space-y-6 text-base leading-relaxed text-ink-muted sm:text-lg">
            {(block.paragraphs.length ? block.paragraphs : [""]).map((p, i) => (
              <EditableText
                key={i}
                value={p}
                onChange={(v) =>
                  onPatch({ paragraphs: setAt(block.paragraphs, i, v) })
                }
                placeholder="Paragraph…"
                multiline
                className="block"
              />
            ))}
            <button
              type="button"
              onClick={() =>
                onPatch({ paragraphs: [...block.paragraphs, ""] })
              }
              className="text-xs font-semibold text-accent hover:underline"
            >
              + Add paragraph
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURE TILES ──────────────────────────────────────────────────────────
function FeatureTilesEditable({
  block,
  onPatch,
}: {
  block: FeatureTilesBlock;
  onPatch: (p: Partial<FeatureTilesBlock>) => void;
}) {
  const tiles = block.tiles;
  function patchTile(i: number, p: Partial<typeof tiles[number]>) {
    onPatch({ tiles: setAt(tiles, i, { ...tiles[i]!, ...p }) });
  }
  function removeTile(i: number) {
    onPatch({ tiles: tiles.filter((_, idx) => idx !== i) });
  }
  function addTile() {
    onPatch({
      tiles: [
        ...tiles,
        {
          id: newBlockId("tile"),
          title: "New tile",
          body: "",
          imageUrl: "",
          imageAlt: "",
        },
      ],
    });
  }
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <EditableText
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
            placeholder="Eyebrow (optional)"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-sage"
          />
          <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            <EditableText
              value={block.title}
              onChange={(v) => onPatch({ title: v })}
              placeholder="Section title"
            />
          </h2>
          <EditableText
            value={block.body ?? ""}
            onChange={(v) => onPatch({ body: v || undefined })}
            placeholder="Intro paragraph (optional)"
            multiline
            className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg"
          />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {tiles.map((tile, i) => (
            <article
              key={tile.id}
              className="group relative overflow-hidden rounded-2xl border border-line bg-canvas-muted shadow-[0_2px_0_rgba(28,25,23,0.04)]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <EditableImage
                  url={tile.imageUrl}
                  alt={tile.imageAlt}
                  emptyHint="Add tile image"
                  onChange={({ url, alt }) =>
                    patchTile(i, { imageUrl: url, imageAlt: alt })
                  }
                />
                {tile.imageUrl ? (
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent"
                    aria-hidden
                  />
                ) : null}
                <h3 className="pointer-events-auto absolute bottom-4 left-4 right-4 z-10 font-display text-2xl font-medium text-white drop-shadow-sm sm:text-[1.65rem]">
                  <EditableText
                    value={tile.title}
                    onChange={(v) => patchTile(i, { title: v })}
                    placeholder="Tile title"
                  />
                </h3>
              </div>
              <div className="p-6">
                <EditableText
                  value={tile.body}
                  onChange={(v) => patchTile(i, { body: v })}
                  placeholder="Tile body"
                  multiline
                  className="text-sm leading-relaxed text-ink-muted sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => removeTile(i)}
                  className="mt-4 text-[11px] font-semibold text-red-700 hover:underline"
                >
                  Remove tile
                </button>
              </div>
            </article>
          ))}
          <button
            type="button"
            onClick={addTile}
            className="grid place-items-center rounded-2xl border-2 border-dashed border-line bg-canvas/40 p-10 text-sm font-semibold text-ink-muted hover:border-accent/50 hover:text-ink"
          >
            + Add tile
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── PROCESS STEPS ──────────────────────────────────────────────────────────
function ProcessStepsEditable({
  block,
  onPatch,
}: {
  block: ProcessStepsBlock;
  onPatch: (p: Partial<ProcessStepsBlock>) => void;
}) {
  const steps = block.steps;
  function patchStep(i: number, p: Partial<typeof steps[number]>) {
    onPatch({ steps: setAt(steps, i, { ...steps[i]!, ...p }) });
  }
  function removeStep(i: number) {
    onPatch({ steps: steps.filter((_, idx) => idx !== i) });
  }
  function addStep() {
    const next = String(steps.length + 1).padStart(2, "0");
    onPatch({
      steps: [
        ...steps,
        {
          id: newBlockId("step"),
          number: next,
          title: "New step",
          body: "",
        },
      ],
    });
  }
  return (
    <section className="border-y border-line bg-canvas-muted/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <EditableText
              value={block.eyebrow ?? ""}
              onChange={(v) => onPatch({ eyebrow: v || undefined })}
              placeholder="Eyebrow (optional)"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-sage"
            />
            <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
              <EditableText
                value={block.title}
                onChange={(v) => onPatch({ title: v })}
                placeholder="Section title"
              />
            </h2>
          </div>
          <EditableText
            value={block.body ?? ""}
            onChange={(v) => onPatch({ body: v || undefined })}
            placeholder="Intro paragraph (optional)"
            multiline
            className="max-w-md text-base leading-relaxed text-ink-muted"
          />
        </div>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) => (
            <li key={s.id} className="relative pl-14 sm:pl-0">
              <span className="absolute left-0 top-0 font-display text-3xl font-semibold text-gold/90 sm:static sm:mb-4 sm:block">
                <EditableText
                  value={s.number}
                  onChange={(v) => patchStep(i, { number: v })}
                  placeholder="01"
                />
              </span>
              <h3 className="font-display text-xl font-medium text-ink">
                <EditableText
                  value={s.title}
                  onChange={(v) => patchStep(i, { title: v })}
                  placeholder="Step title"
                />
              </h3>
              <EditableText
                value={s.body}
                onChange={(v) => patchStep(i, { body: v })}
                placeholder="Step body"
                multiline
                className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="mt-3 text-[11px] font-semibold text-red-700 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
          <li className="relative">
            <button
              type="button"
              onClick={addStep}
              className="grid h-full w-full place-items-center rounded-xl border-2 border-dashed border-line p-6 text-sm font-semibold text-ink-muted hover:border-accent/50 hover:text-ink"
            >
              + Add step
            </button>
          </li>
        </ol>
      </div>
    </section>
  );
}

// ─── TESTIMONIAL ────────────────────────────────────────────────────────────
function TestimonialEditable({
  block,
  onPatch,
}: {
  block: TestimonialBlock;
  onPatch: (p: Partial<TestimonialBlock>) => void;
}) {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <figure className="relative overflow-hidden rounded-3xl border border-line bg-canvas-muted/40 px-8 py-14 sm:px-16 sm:py-20">
          <div
            className="pointer-events-none absolute -left-6 top-6 font-display text-[8rem] leading-none text-gold/25 sm:text-[10rem]"
            aria-hidden
          >
            “
          </div>
          <blockquote className="relative font-display text-2xl font-medium leading-snug text-ink sm:text-3xl md:max-w-4xl md:text-[2.1rem] md:leading-snug">
            <EditableText
              value={block.quote}
              onChange={(v) => onPatch({ quote: v })}
              placeholder="The testimonial quote…"
              multiline
            />
          </blockquote>
          <figcaption className="relative mt-8 text-sm font-semibold text-ink-muted">
            <EditableText
              value={block.attribution ?? ""}
              onChange={(v) => onPatch({ attribution: v || undefined })}
              placeholder="— Attribution"
            />
            {block.attribution || block.sublabel ? <span>, </span> : null}
            <span className="font-normal text-ink-muted/80">
              <EditableText
                value={block.sublabel ?? ""}
                onChange={(v) => onPatch({ sublabel: v || undefined })}
                placeholder="Sublabel"
              />
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

// ─── CTA SPLIT ──────────────────────────────────────────────────────────────
function CtaSplitEditable({
  block,
  onPatch,
}: {
  block: CtaSplitBlock;
  onPatch: (p: Partial<CtaSplitBlock>) => void;
}) {
  return (
    <section className="border-t border-line bg-canvas-muted/35 py-16 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <EditableText
            value={block.eyebrow ?? ""}
            onChange={(v) => onPatch({ eyebrow: v || undefined })}
            placeholder="Eyebrow (optional)"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-sage"
          />
          <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">
            <EditableText
              value={block.title}
              onChange={(v) => onPatch({ title: v })}
              placeholder="Title"
            />
          </h2>
        </div>
        <CtaPill
          cta={block.cta}
          onChange={(v) => onPatch({ cta: v ?? { label: "", href: "" } })}
        />
      </div>
    </section>
  );
}

// ─── RICH TEXT ──────────────────────────────────────────────────────────────
function RichTextEditable({
  block,
  onPatch,
}: {
  block: RichTextBlock;
  onPatch: (p: Partial<RichTextBlock>) => void;
}) {
  const maxW =
    block.maxWidth === "narrow"
      ? "max-w-2xl"
      : block.maxWidth === "wide"
        ? "max-w-5xl"
        : "max-w-3xl";
  const list = block.paragraphs.length ? block.paragraphs : [""];
  return (
    <section className="bg-canvas py-16 sm:py-20">
      <div
        className={`mx-auto ${maxW} space-y-6 px-5 text-base leading-relaxed text-ink sm:px-8 sm:text-lg`}
      >
        {list.map((p, i) => (
          <EditableText
            key={i}
            value={p}
            onChange={(v) =>
              onPatch({ paragraphs: setAt(block.paragraphs, i, v) })
            }
            placeholder="Paragraph…"
            multiline
            className="block"
          />
        ))}
        <button
          type="button"
          onClick={() => onPatch({ paragraphs: [...block.paragraphs, ""] })}
          className="text-xs font-semibold text-accent hover:underline"
        >
          + Add paragraph
        </button>
      </div>
    </section>
  );
}

// ─── IMAGE ──────────────────────────────────────────────────────────────────
function ImageEditable({
  block,
  onPatch,
}: {
  block: ImageBlock;
  onPatch: (p: Partial<ImageBlock>) => void;
}) {
  const maxW =
    block.maxWidth === "narrow"
      ? "max-w-3xl"
      : block.maxWidth === "full"
        ? "max-w-none"
        : "max-w-5xl";
  return (
    <section className="bg-canvas py-12 sm:py-16">
      <figure className={`mx-auto ${maxW} px-5 sm:px-8`}>
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line">
          <EditableImage
            url={block.imageUrl}
            alt={block.imageAlt}
            emptyHint="Add an image"
            onChange={({ url, alt }) =>
              onPatch({ imageUrl: url, imageAlt: alt })
            }
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-ink-muted">
          <EditableText
            value={block.caption ?? ""}
            onChange={(v) => onPatch({ caption: v || undefined })}
            placeholder="Caption (optional)"
          />
        </figcaption>
      </figure>
    </section>
  );
}

// ─── SPACER ─────────────────────────────────────────────────────────────────
function SpacerEditable({
  block,
  onPatch,
}: {
  block: SpacerBlock;
  onPatch: (p: Partial<SpacerBlock>) => void;
}) {
  const h =
    block.size === "small"
      ? "h-8 sm:h-10"
      : block.size === "large"
        ? "h-24 sm:h-32"
        : "h-14 sm:h-20";
  return (
    <div className={`${h} relative bg-canvas`}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-line bg-canvas/80 px-3 py-1 text-[11px] font-semibold text-ink-muted">
          Spacer
          {(["small", "medium", "large"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPatch({ size: s })}
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                block.size === s
                  ? "bg-ink text-canvas"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── INTAKE FORM ────────────────────────────────────────────────────────────
function IntakeFormEditable({
  block,
  onPatch,
}: {
  block: IntakeFormBlock;
  onPatch: (p: Partial<IntakeFormBlock>) => void;
}) {
  return (
    <section className="bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <EditableText
          value={block.eyebrow ?? ""}
          onChange={(v) => onPatch({ eyebrow: v || undefined })}
          placeholder="Eyebrow (optional)"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-sage"
        />
        <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
          <EditableText
            value={block.title ?? ""}
            onChange={(v) => onPatch({ title: v || undefined })}
            placeholder="Section title (optional)"
          />
        </h2>
        <EditableText
          value={block.body ?? ""}
          onChange={(v) => onPatch({ body: v || undefined })}
          placeholder="Intro paragraph (optional)"
          multiline
          className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg"
        />
        <div className="mt-8 rounded-3xl border border-line bg-white/60 p-6 shadow-sm sm:p-10">
          {block.slug ? (
            <IntakeFormBlockView slug={block.slug} preview />
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
              No form chosen yet — open <strong>More</strong> on this block to
              pick one.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── shared bits ────────────────────────────────────────────────────────────
function CtaButtonsEditable({
  primary,
  secondary,
  onChangePrimary,
  onChangeSecondary,
}: {
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  onChangePrimary: (v: { label: string; href: string } | undefined) => void;
  onChangeSecondary: (v: { label: string; href: string } | undefined) => void;
}) {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
      <CtaPill
        cta={primary}
        variant="solid"
        onChange={onChangePrimary}
        emptyLabel="+ Add primary button"
      />
      <CtaPill
        cta={secondary}
        variant="ghost"
        onChange={onChangeSecondary}
        emptyLabel="+ Add secondary button"
      />
    </div>
  );
}

function CtaPill({
  cta,
  variant = "ghost",
  onChange,
  emptyLabel,
}: {
  cta?: { label: string; href: string };
  variant?: "solid" | "ghost";
  onChange: (v: { label: string; href: string } | undefined) => void;
  emptyLabel?: string;
}) {
  if (!cta?.label && !cta?.href) {
    return (
      <button
        type="button"
        onClick={() => onChange({ label: "Click to edit", href: "/" })}
        className="rounded-full border border-dashed border-ink-muted/50 px-5 py-2 text-sm font-semibold text-ink-muted hover:text-ink"
      >
        {emptyLabel ?? "+ Add button"}
      </button>
    );
  }
  const base =
    variant === "solid"
      ? "inline-flex h-12 items-center justify-center rounded-full bg-canvas px-6 text-sm font-semibold text-ink shadow-hero"
      : "inline-flex h-12 items-center justify-center rounded-full border border-white/35 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm";
  return (
    <div className={`group relative ${base}`}>
      <EditableText
        value={cta.label}
        onChange={(v) => onChange({ label: v, href: cta.href })}
        placeholder="Button text"
      />
      <input
        value={cta.href}
        onChange={(e) => onChange({ label: cta.label, href: e.target.value })}
        placeholder="Link URL"
        className="ml-3 w-32 rounded-full border border-white/30 bg-white/10 px-2 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:bg-white focus:text-ink focus:placeholder-ink-muted"
      />
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className="ml-2 hidden text-[11px] text-red-200 hover:text-white group-hover:inline"
        aria-label="Remove button"
      >
        ×
      </button>
    </div>
  );
}

