import Image from "next/image";
import Link from "next/link";
import { IntakeFormBlockView } from "@/components/page/IntakeFormBlockView";
import type {
  CtaSplitBlock,
  EditorialIntroBlock,
  FeatureTilesBlock,
  HeroBlock,
  ImageBlock,
  IntakeFormBlock,
  PageBlock,
  PageSchema,
  ProcessStepsBlock,
  RichTextBlock,
  SpacerBlock,
  TestimonialBlock,
} from "@/lib/page-schema";

export function PageRenderer({ schema }: { schema: PageSchema }) {
  return (
    <>
      {schema.blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </>
  );
}

export function BlockView({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "hero":
      return <HeroView block={block} />;
    case "editorial_intro":
      return <EditorialIntroView block={block} />;
    case "feature_tiles":
      return <FeatureTilesView block={block} />;
    case "process_steps":
      return <ProcessStepsView block={block} />;
    case "testimonial":
      return <TestimonialView block={block} />;
    case "cta_split":
      return <CtaSplitView block={block} />;
    case "rich_text":
      return <RichTextView block={block} />;
    case "image":
      return <ImageView block={block} />;
    case "spacer":
      return <SpacerView block={block} />;
    case "intake_form":
      return <IntakeFormView block={block} />;
    default: {
      const _ex: never = block;
      return _ex;
    }
  }
}

function HeroView({ block }: { block: HeroBlock }) {
  const minH =
    block.height === "short"
      ? "min-h-[60vh]"
      : block.height === "medium"
        ? "min-h-[76vh]"
        : "min-h-[92vh]";
  return (
    <section
      id={block.anchor}
      className={`relative ${minH} overflow-hidden pt-[6.25rem] md:pt-[4.25rem]`}
    >
      <div className="absolute inset-0">
        {block.imageUrl ? (
          <Image
            src={block.imageUrl}
            alt={block.imageAlt || ""}
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/45 to-stone-900/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-stone-950/50 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-5 pb-16 pt-16 sm:px-8 sm:pb-20 md:justify-center md:pb-24 md:pt-24"
        style={{ minHeight: "inherit" }}
      >
        {block.eyebrow ? (
          <p className="mb-4 max-w-xl text-xs font-semibold uppercase tracking-[0.28em] text-stone-200/90">
            {block.eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-balance text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:max-w-3xl md:text-6xl lg:text-[4.25rem]">
          {block.headline}
          {block.headlineMuted ? (
            <span className="text-stone-200"> {block.headlineMuted}</span>
          ) : null}
        </h1>
        {block.body ? (
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-200/95 sm:text-xl">
            {block.body}
          </p>
        ) : null}
        {block.primaryCta || block.secondaryCta ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            {block.primaryCta?.label ? (
              <Link
                href={block.primaryCta.href || "#"}
                className="inline-flex h-12 items-center justify-center rounded-full bg-canvas px-8 text-sm font-semibold text-ink shadow-hero transition hover:bg-white"
              >
                {block.primaryCta.label}
              </Link>
            ) : null}
            {block.secondaryCta?.label ? (
              <Link
                href={block.secondaryCta.href || "#"}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {block.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EditorialIntroView({ block }: { block: EditorialIntroBlock }) {
  return (
    <section
      id={block.anchor}
      className="border-b border-line bg-canvas py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 lg:items-start">
          <blockquote className="font-display text-balance text-3xl font-medium leading-snug text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
            {block.quote}
            {block.quoteMuted ? (
              <>
                {" "}
                <span className="text-ink-muted">{block.quoteMuted}</span>
              </>
            ) : null}
          </blockquote>
          <div className="space-y-6 text-base leading-relaxed text-ink-muted sm:text-lg">
            {(block.paragraphs ?? []).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureTilesView({ block }: { block: FeatureTilesBlock }) {
  return (
    <section id={block.anchor} className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          {block.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
              {block.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            {block.title}
          </h2>
          {block.body ? (
            <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
              {block.body}
            </p>
          ) : null}
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {(block.tiles ?? []).map((tile) => (
            <article
              key={tile.id}
              className="group relative overflow-hidden rounded-2xl border border-line bg-canvas-muted shadow-[0_2px_0_rgba(28,25,23,0.04)]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                {tile.imageUrl ? (
                  <Image
                    src={tile.imageUrl}
                    alt={tile.imageAlt || ""}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-ink/20" />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent"
                  aria-hidden
                />
                <h3 className="absolute bottom-4 left-4 right-4 font-display text-2xl font-medium text-white drop-shadow-sm sm:text-[1.65rem]">
                  {tile.title}
                </h3>
              </div>
              <p className="p-6 text-sm leading-relaxed text-ink-muted sm:text-base">
                {tile.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessStepsView({ block }: { block: ProcessStepsBlock }) {
  return (
    <section
      id={block.anchor}
      className="border-y border-line bg-canvas-muted/50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {block.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
                {block.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
              {block.title}
            </h2>
          </div>
          {block.body ? (
            <p className="max-w-md text-base leading-relaxed text-ink-muted">
              {block.body}
            </p>
          ) : null}
        </div>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {(block.steps ?? []).map((s) => (
            <li key={s.id} className="relative pl-14 sm:pl-0">
              <span
                className="absolute left-0 top-0 font-display text-3xl font-semibold text-gold/90 sm:static sm:mb-4 sm:block"
                aria-hidden
              >
                {s.number}
              </span>
              <h3 className="font-display text-xl font-medium text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TestimonialView({ block }: { block: TestimonialBlock }) {
  return (
    <section id={block.anchor} className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <figure className="relative overflow-hidden rounded-3xl border border-line bg-canvas-muted/40 px-8 py-14 sm:px-16 sm:py-20">
          <div
            className="pointer-events-none absolute -left-6 top-6 font-display text-[8rem] leading-none text-gold/25 sm:text-[10rem]"
            aria-hidden
          >
            “
          </div>
          <blockquote className="relative font-display text-2xl font-medium leading-snug text-ink sm:text-3xl md:max-w-4xl md:text-[2.1rem] md:leading-snug">
            {block.quote}
          </blockquote>
          {block.attribution || block.sublabel ? (
            <figcaption className="relative mt-8 text-sm font-semibold text-ink-muted">
              {block.attribution ?? ""}
              {block.sublabel ? (
                <>
                  {block.attribution ? ", " : ""}
                  <span className="font-normal text-ink-muted/80">
                    {block.sublabel}
                  </span>
                </>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}

function CtaSplitView({ block }: { block: CtaSplitBlock }) {
  return (
    <section
      id={block.anchor}
      className="border-t border-line bg-canvas-muted/35 py-16 sm:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          {block.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
              {block.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">
            {block.title}
          </h2>
        </div>
        {block.cta?.label ? (
          <Link
            href={block.cta.href || "#"}
            target={/^https?:\/\//.test(block.cta.href) ? "_blank" : undefined}
            rel={
              /^https?:\/\//.test(block.cta.href)
                ? "noopener noreferrer"
                : undefined
            }
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-line bg-canvas px-7 text-sm font-semibold text-ink transition hover:border-accent/40 hover:bg-white"
          >
            {block.cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function RichTextView({ block }: { block: RichTextBlock }) {
  const maxW =
    block.maxWidth === "narrow"
      ? "max-w-2xl"
      : block.maxWidth === "wide"
        ? "max-w-5xl"
        : "max-w-3xl";
  return (
    <section id={block.anchor} className="bg-canvas py-16 sm:py-20">
      <div className={`mx-auto ${maxW} space-y-6 px-5 text-base leading-relaxed text-ink sm:px-8 sm:text-lg`}>
        {(block.paragraphs ?? []).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function ImageView({ block }: { block: ImageBlock }) {
  const maxW =
    block.maxWidth === "narrow"
      ? "max-w-3xl"
      : block.maxWidth === "full"
        ? "max-w-none"
        : "max-w-5xl";
  return (
    <section id={block.anchor} className="bg-canvas py-12 sm:py-16">
      <figure className={`mx-auto ${maxW} px-5 sm:px-8`}>
        {block.imageUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line">
            <Image
              src={block.imageUrl}
              alt={block.imageAlt || ""}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ) : null}
        {block.caption ? (
          <figcaption className="mt-3 text-center text-sm text-ink-muted">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function SpacerView({ block }: { block: SpacerBlock }) {
  const h =
    block.size === "small"
      ? "h-8 sm:h-10"
      : block.size === "large"
        ? "h-24 sm:h-32"
        : "h-14 sm:h-20";
  return <div className={`${h} bg-canvas`} aria-hidden />;
}

function IntakeFormView({ block }: { block: IntakeFormBlock }) {
  return (
    <section id={block.anchor} className="bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {block.eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
            {block.eyebrow}
          </p>
        ) : null}
        {block.title ? (
          <h2 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            {block.title}
          </h2>
        ) : null}
        {block.body ? (
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            {block.body}
          </p>
        ) : null}
        <div className="mt-8 rounded-3xl border border-line bg-white/60 p-6 shadow-sm sm:p-10">
          <IntakeFormBlockView slug={block.slug} />
        </div>
      </div>
    </section>
  );
}
