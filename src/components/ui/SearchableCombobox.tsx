"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

/**
 * Generic type-ahead combobox. The parent owns fetching — we call `onSearch(q)`
 * (debounced) and receive a list of options. Pure presentation + keyboard nav.
 */
export interface ComboOption<T> {
  id: string;
  label: string;
  sub?: string;
  data: T;
}

export function SearchableCombobox<T>({
  value,
  onChange,
  onSearch,
  renderOption,
  placeholder,
  emptyLabel,
  clearable = true,
  disabled,
}: {
  value: ComboOption<T> | null;
  onChange: (v: ComboOption<T> | null) => void;
  onSearch: (q: string) => Promise<ComboOption<T>[]>;
  renderOption?: (o: ComboOption<T>) => ReactNode;
  placeholder?: string;
  emptyLabel?: string;
  clearable?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<ComboOption<T>[]>([]);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const ignoreNext = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (ignoreNext.current) {
      ignoreNext.current = false;
      return;
    }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const res = await onSearch(query);
        if (!cancelled) {
          setOptions(res);
          setHighlight(0);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open, onSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(o: ComboOption<T>) {
    ignoreNext.current = true;
    onChange(o);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      if (open && options[highlight]) {
        e.preventDefault();
        pick(options[highlight]!);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      {value ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {value.label}
            </p>
            {value.sub ? (
              <p className="truncate text-xs text-ink-muted">{value.sub}</p>
            ) : null}
          </div>
          {clearable && !disabled ? (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="shrink-0 rounded-lg border border-line px-2 py-1 text-xs font-semibold text-ink-muted hover:bg-canvas"
            >
              Change
            </button>
          ) : null}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          disabled={disabled}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Type to search…"}
          className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-base text-ink outline-none ring-gold/30 focus:ring-2"
        />
      )}

      {open && !value ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-lg"
        >
          {busy ? (
            <p className="px-3 py-2 text-sm text-ink-muted">Searching…</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-ink-muted">
              {emptyLabel ?? "No matches. Try different words."}
            </p>
          ) : (
            options.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`block w-full px-3 py-2 text-left text-sm transition ${
                  i === highlight ? "bg-accent/10" : "bg-white hover:bg-canvas"
                }`}
              >
                {renderOption ? (
                  renderOption(o)
                ) : (
                  <>
                    <p className="font-medium text-ink">{o.label}</p>
                    {o.sub ? (
                      <p className="text-xs text-ink-muted">{o.sub}</p>
                    ) : null}
                  </>
                )}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
