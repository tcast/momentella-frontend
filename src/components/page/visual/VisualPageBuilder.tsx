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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type HTMLAttributes } from "react";
import { PageBlockPickerModal } from "@/components/page/PageBlockPicker";
import type { PageBlock, PageBlockType } from "@/lib/page-schema";
import { BlockInsertZone } from "./BlockInsertZone";
import { BlockSettingsDrawer } from "./BlockSettingsDrawer";
import { BlockToolbar } from "./BlockToolbar";
import { EditableBlock } from "./EditableBlocks";

export function VisualPageBuilder({
  blocks,
  onReorder,
  onPatch,
  onRemove,
  onDuplicate,
  onMove,
  onInsertAt,
}: {
  blocks: PageBlock[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  onPatch: (id: string, patch: Partial<PageBlock>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onInsertAt: (index: number, type: PageBlockType) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [emptyPicking, setEmptyPicking] = useState(false);
  const drawerBlock = drawerId
    ? blocks.find((b) => b.id === drawerId) ?? null
    : null;

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(oldIndex, newIndex);
  }

  if (blocks.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setEmptyPicking(true)}
          className="grid w-full place-items-center rounded-3xl border-2 border-dashed border-line bg-canvas/50 py-24 text-center"
        >
          <div>
            <p className="font-display text-2xl font-medium text-ink">
              Your page is blank
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Click anywhere to drop in your first block — usually a Hero.
            </p>
            <span className="mt-6 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas">
              + Add your first block
            </span>
          </div>
        </button>
        {emptyPicking ? (
          <PageBlockPickerModal
            onPick={(t) => {
              onInsertAt(0, t);
              setEmptyPicking(false);
            }}
            onClose={() => setEmptyPicking(false)}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-line bg-white/60 shadow-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <BlockInsertZone
              onPick={(t) => onInsertAt(0, t)}
              alwaysVisible
            />
            {blocks.map((block, i) => (
              <div key={block.id}>
                <SortableBlock
                  block={block}
                  index={i}
                  total={blocks.length}
                  onPatch={(patch) => onPatch(block.id, patch)}
                  onRemove={() => onRemove(block.id)}
                  onDuplicate={() => onDuplicate(block.id)}
                  onMoveUp={() => onMove(block.id, -1)}
                  onMoveDown={() => onMove(block.id, 1)}
                  onOpenSettings={() => setDrawerId(block.id)}
                />
                <BlockInsertZone
                  onPick={(t) => onInsertAt(i + 1, t)}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <BlockSettingsDrawer
        block={drawerBlock}
        onPatch={(patch) => {
          if (drawerId) onPatch(drawerId, patch);
        }}
        onClose={() => setDrawerId(null)}
      />
    </>
  );
}

function SortableBlock({
  block,
  index,
  total,
  onPatch,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onOpenSettings,
}: {
  block: PageBlock;
  index: number;
  total: number;
  onPatch: (patch: Partial<PageBlock>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenSettings: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const dragProps = {
    ...attributes,
    ...listeners,
  } as HTMLAttributes<HTMLButtonElement>;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative isolate ${
        isDragging ? "z-30 opacity-95 shadow-2xl" : ""
      }`}
    >
      {/* Selection ring on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-md ring-0 ring-accent/40 transition group-hover:ring-2"
      />
      <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <BlockToolbar
          block={block}
          index={index}
          total={total}
          dragProps={dragProps}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onRemove={() => {
            if (confirm("Remove this block?")) onRemove();
          }}
          onOpenSettings={onOpenSettings}
        />
      </div>
      <EditableBlock block={block} onPatch={onPatch} />
    </div>
  );
}
