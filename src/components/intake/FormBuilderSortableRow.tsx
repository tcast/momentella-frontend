"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HTMLAttributes } from "react";

export function FormBuilderSortableRow({
  id,
  children,
}: {
  id: string;
  children: (dragProps: HTMLAttributes<HTMLButtonElement>) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const dragProps = {
    ...attributes,
    ...listeners,
  } as HTMLAttributes<HTMLButtonElement>;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-line bg-white/70 p-4 shadow-sm ${
        isDragging ? "z-20 ring-2 ring-accent/50" : ""
      }`}
    >
      {children(dragProps)}
    </li>
  );
}
