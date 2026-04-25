"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { PageRenderer } from "@/components/page/PageRenderer";
import { VisualPageBuilder } from "@/components/page/visual/VisualPageBuilder";
import {
  newBlockId,
  type PageBlock,
  type PageBlockType,
  type PageSchema,
} from "@/lib/page-schema";
import { getPublicAppUrl } from "@/lib/env-public";

function makeBlock(type: PageBlockType): PageBlock {
  switch (type) {
    case "hero":
      return {
        id: newBlockId("hero"),
        type: "hero",
        imageUrl: "",
        imageAlt: "",
        eyebrow: "",
        headline: "Your headline here",
        headlineMuted: "",
        body: "",
        primaryCta: { label: "Start a conversation", href: "/connect" },
        height: "tall",
      };
    case "editorial_intro":
      return {
        id: newBlockId("intro"),
        type: "editorial_intro",
        quote: "A bold opening line.",
        quoteMuted: "",
        paragraphs: [""],
      };
    case "feature_tiles":
      return {
        id: newBlockId("tiles"),
        type: "feature_tiles",
        eyebrow: "",
        title: "Section title",
        body: "",
        tiles: [
          {
            id: newBlockId("tile"),
            title: "Tile one",
            body: "",
            imageUrl: "",
            imageAlt: "",
          },
          {
            id: newBlockId("tile"),
            title: "Tile two",
            body: "",
            imageUrl: "",
            imageAlt: "",
          },
        ],
      };
    case "process_steps":
      return {
        id: newBlockId("steps"),
        type: "process_steps",
        eyebrow: "",
        title: "How it works",
        body: "",
        steps: [
          { id: newBlockId("step"), number: "01", title: "Step one", body: "" },
          { id: newBlockId("step"), number: "02", title: "Step two", body: "" },
        ],
      };
    case "testimonial":
      return {
        id: newBlockId("testi"),
        type: "testimonial",
        quote: "A wonderful quote about our work.",
      };
    case "cta_split":
      return {
        id: newBlockId("cta"),
        type: "cta_split",
        title: "Let’s plan something together",
        cta: { label: "Start a conversation", href: "/connect" },
      };
    case "rich_text":
      return {
        id: newBlockId("text"),
        type: "rich_text",
        maxWidth: "normal",
        paragraphs: [""],
      };
    case "image":
      return {
        id: newBlockId("img"),
        type: "image",
        imageUrl: "",
        imageAlt: "",
        maxWidth: "normal",
      };
    case "spacer":
      return { id: newBlockId("spacer"), type: "spacer", size: "medium" };
    case "intake_form":
      return {
        id: newBlockId("form"),
        type: "intake_form",
        slug: "",
        eyebrow: "",
        title: "Tell us about your trip",
        body: "",
      };
    default: {
      const _ex: never = type;
      return _ex;
    }
  }
}

function duplicateBlock(b: PageBlock): PageBlock {
  const copy = JSON.parse(JSON.stringify(b)) as PageBlock;
  copy.id = newBlockId(b.type.slice(0, 4));
  if (copy.type === "feature_tiles") {
    copy.tiles = copy.tiles.map((t) => ({ ...t, id: newBlockId("tile") }));
  }
  if (copy.type === "process_steps") {
    copy.steps = copy.steps.map((s) => ({ ...s, id: newBlockId("step") }));
  }
  return copy;
}

export function PageBuilderClient({
  pageId,
  slug,
  versionId,
  versionLabel,
  initialSchema,
}: {
  pageId: string;
  slug: string;
  versionId: string;
  versionLabel: string | null;
  initialSchema: PageSchema;
}) {
  const router = useRouter();
  const [schema, setSchema] = useState<PageSchema>(initialSchema);
  const [label, setLabel] = useState(versionLabel ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [pending, startTransition] = useTransition();

  const blocks = useMemo(() => schema.blocks, [schema.blocks]);

  function patchBlock(id: string, patch: Partial<PageBlock>) {
    setSchema((s) => {
      const idx = s.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return s;
      const copy = [...s.blocks];
      copy[idx] = { ...copy[idx]!, ...patch } as PageBlock;
      return { ...s, blocks: copy };
    });
  }

  function removeBlock(id: string) {
    setSchema((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
  }

  function duplicateBlockById(id: string) {
    setSchema((s) => {
      const idx = s.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return s;
      const copy = [...s.blocks];
      copy.splice(idx + 1, 0, duplicateBlock(copy[idx]!));
      return { ...s, blocks: copy };
    });
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setSchema((s) => {
      const idx = s.blocks.findIndex((b) => b.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= s.blocks.length) return s;
      const copy = [...s.blocks];
      const tmp = copy[idx]!;
      copy[idx] = copy[next]!;
      copy[next] = tmp;
      return { ...s, blocks: copy };
    });
  }

  function reorderBlocks(oldIndex: number, newIndex: number) {
    setSchema((s) => {
      const copy = [...s.blocks];
      const [moved] = copy.splice(oldIndex, 1);
      if (!moved) return s;
      copy.splice(newIndex, 0, moved);
      return { ...s, blocks: copy };
    });
  }

  function insertAt(index: number, type: PageBlockType) {
    setSchema((s) => {
      const copy = [...s.blocks];
      copy.splice(index, 0, makeBlock(type));
      return { ...s, blocks: copy };
    });
  }

  function save() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/pages/${pageId}/versions/${versionId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema, label: label || null }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Save failed",
        );
        return;
      }
      router.refresh();
    });
  }

  function publish() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/pages/${pageId}/versions/${versionId}/publish`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        setErr("Could not publish");
        return;
      }
      router.refresh();
    });
  }

  const publicHref = slug === "home" ? "/" : `/p/${slug}`;

  return (
    <div className="space-y-6">
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {err}
        </p>
      ) : null}

      <div className="rounded-2xl border border-line bg-gradient-to-b from-white to-canvas/80 p-6 shadow-sm">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
          <strong>Hover any section</strong> to drag it, duplicate it, or remove
          it. <strong>Click any text or image</strong> to edit it in place. Use
          the <strong>+ Add block</strong> spacers to drop in something new.
          Nothing is saved until you hit <strong>Save</strong> or{" "}
          <strong>Publish</strong>.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink">
              Version name{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1.5 w-full min-w-[14rem] rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm sm:max-w-sm"
              placeholder="e.g. Spring 2026 refresh"
            />
          </div>
          <button
            type="button"
            onClick={() => save()}
            disabled={pending}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas shadow-sm hover:bg-accent-deep disabled:opacity-60"
          >
            Save my changes
          </button>
          <button
            type="button"
            onClick={() => publish()}
            disabled={pending}
            className="rounded-full border-2 border-accent bg-white px-6 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-accent/5 disabled:opacity-60"
          >
            Publish — go live
          </button>
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs font-semibold text-accent hover:underline"
          >
            Open {publicHref} in new tab ↗
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full border border-line bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "edit"
              ? "bg-ink text-canvas shadow"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Edit page
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
          Preview as visitor
        </button>
      </div>

      {tab === "preview" ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="border-b border-line bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-950">
            Preview — this is how the live page will look after you Publish.
          </div>
          <PageRenderer schema={schema} />
        </div>
      ) : (
        <VisualPageBuilder
          blocks={blocks}
          onReorder={reorderBlocks}
          onPatch={patchBlock}
          onRemove={removeBlock}
          onDuplicate={duplicateBlockById}
          onMove={moveBlock}
          onInsertAt={insertAt}
        />
      )}
    </div>
  );
}
