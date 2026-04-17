/** Mirrors backend `page-schema.ts` for UI — keep block types in sync. */

export const PAGE_SCHEMA_VERSION = 1 as const;

export type PageBlockType =
  | "hero"
  | "editorial_intro"
  | "feature_tiles"
  | "process_steps"
  | "testimonial"
  | "cta_split"
  | "rich_text"
  | "image"
  | "spacer";

export interface CtaLink {
  label: string;
  href: string;
}

interface Base {
  id: string;
  type: PageBlockType;
  anchor?: string;
}

export interface HeroBlock extends Base {
  type: "hero";
  imageUrl: string;
  imageAlt: string;
  eyebrow?: string;
  headline: string;
  headlineMuted?: string;
  body?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  height?: "short" | "medium" | "tall";
}

export interface EditorialIntroBlock extends Base {
  type: "editorial_intro";
  quote: string;
  quoteMuted?: string;
  paragraphs: string[];
}

export interface FeatureTile {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
}

export interface FeatureTilesBlock extends Base {
  type: "feature_tiles";
  eyebrow?: string;
  title: string;
  body?: string;
  tiles: FeatureTile[];
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  body: string;
}

export interface ProcessStepsBlock extends Base {
  type: "process_steps";
  eyebrow?: string;
  title: string;
  body?: string;
  steps: ProcessStep[];
}

export interface TestimonialBlock extends Base {
  type: "testimonial";
  quote: string;
  attribution?: string;
  sublabel?: string;
}

export interface CtaSplitBlock extends Base {
  type: "cta_split";
  eyebrow?: string;
  title: string;
  cta: CtaLink;
}

export interface RichTextBlock extends Base {
  type: "rich_text";
  paragraphs: string[];
  maxWidth?: "narrow" | "normal" | "wide";
}

export interface ImageBlock extends Base {
  type: "image";
  imageUrl: string;
  imageAlt: string;
  caption?: string;
  maxWidth?: "narrow" | "normal" | "full";
}

export interface SpacerBlock extends Base {
  type: "spacer";
  size: "small" | "medium" | "large";
}

export type PageBlock =
  | HeroBlock
  | EditorialIntroBlock
  | FeatureTilesBlock
  | ProcessStepsBlock
  | TestimonialBlock
  | CtaSplitBlock
  | RichTextBlock
  | ImageBlock
  | SpacerBlock;

export interface PageSchema {
  version: typeof PAGE_SCHEMA_VERSION;
  blocks: PageBlock[];
}

export function parsePageSchema(raw: unknown): PageSchema | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== PAGE_SCHEMA_VERSION) return null;
  if (!Array.isArray(o.blocks)) return null;
  return { version: PAGE_SCHEMA_VERSION, blocks: o.blocks as PageBlock[] };
}

export function newBlockId(prefix = "b"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const BLOCK_LABELS: Record<PageBlockType, string> = {
  hero: "Hero — full image banner",
  editorial_intro: "Quote + intro paragraphs",
  feature_tiles: "Feature tiles (images grid)",
  process_steps: "Numbered steps",
  testimonial: "Testimonial",
  cta_split: "Heading + button (split)",
  rich_text: "Paragraph block",
  image: "Single image + caption",
  spacer: "Vertical spacer",
};

export const BLOCK_DESCRIPTIONS: Record<PageBlockType, string> = {
  hero: "Big image, headline, and up to two buttons. Usually your first block.",
  editorial_intro: "A bold quote on the left with supporting paragraphs.",
  feature_tiles:
    "A grid of image cards with a title and short description on each.",
  process_steps: "A numbered list — great for “how it works” sections.",
  testimonial: "A single large quote attributed to a family or guest.",
  cta_split: "A short headline on the left, a button on the right.",
  rich_text: "A plain, readable stack of paragraphs.",
  image: "One image with an optional caption.",
  spacer: "Adds breathing room between blocks.",
};
