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
      className={`list-none ${isDragging ? "z-30 opacity-95 shadow-xl ring-2 ring-accent/40" : ""}`}
    >
      {children(dragProps)}
    </li>
  );
}
