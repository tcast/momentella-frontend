"use client";

import { useEffect, useRef } from "react";

/**
 * Uncontrolled-on-input, controlled-on-blur contentEditable wrapper.
 * Lets the cursor move freely while typing without React re-rendering
 * mid-keystroke; commits on blur. The parent's value still wins when the
 * field isn't focused (e.g. if another block edits it, undo, etc).
 */
export function EditableText({
  value,
  onChange,
  placeholder,
  multiline = false,
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if ((el.textContent ?? "") !== value) {
      el.textContent = value;
    }
    lastValueRef.current = value;
  }, [value]);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label={ariaLabel ?? placeholder}
      aria-multiline={multiline || undefined}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder ?? ""}
      onBlur={(e) => {
        const next = e.currentTarget.textContent ?? "";
        if (next !== lastValueRef.current) {
          lastValueRef.current = next;
          onChange(next);
        }
      }}
      onPaste={(e) => {
        // Plain-text paste: never inherit external HTML/styles.
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).blur();
        }
        if (e.key === "Escape") {
          (e.currentTarget as HTMLDivElement).blur();
        }
      }}
      className={`relative -mx-1 rounded-sm px-1 outline-none transition hover:bg-accent/5 focus:bg-accent/10 focus:ring-2 focus:ring-accent/40 focus:ring-offset-1 focus:ring-offset-canvas ${className}`}
      style={{ minHeight: "1em", whiteSpace: multiline ? "pre-wrap" : "normal" }}
    />
  );
}
