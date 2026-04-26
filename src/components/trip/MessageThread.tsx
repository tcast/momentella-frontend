"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export type MessageEntry = {
  id: string;
  authorId: string | null;
  authorName: string | null;
  authorRole: string;
  body: string;
  createdAt: string;
};

function initials(name: string | null): string {
  const base = (name ?? "?").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Shared message thread used by both admin and client portals. */
export function MessageThread({
  tripId,
  messages,
  endpointBase,
  meRole,
}: {
  tripId: string;
  messages: MessageEntry[];
  /** Resource base, e.g. "/api/admin/trips/<id>/messages". */
  endpointBase: string;
  /** "admin" or "client" — drives bubble alignment. */
  meRole: "admin" | "client";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    const body = draft.trim();
    if (!body) return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}${endpointBase}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not send",
        );
        return;
      }
      setDraft("");
      router.refresh();
    });
  }

  return (
    <section
      className="space-y-4"
      // Hide tripId from a11y but keep it on the DOM for QA/inspectors.
      data-trip-id={tripId}
    >
      <header>
        <h3 className="font-display text-lg font-semibold text-ink">Messages</h3>
        <p className="text-xs text-ink-muted">
          {meRole === "admin"
            ? "The family sees this thread on their portal."
            : "Anything you write here goes straight to your trip designer."}
        </p>
      </header>

      <div className="space-y-3 rounded-2xl border border-line bg-white/60 p-4 shadow-sm">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-canvas/40 px-6 py-6 text-center text-sm text-ink-muted">
            No messages yet. Send the first one below.
          </p>
        ) : (
          <ol className="space-y-3">
            {messages.map((m) => {
              const mine = m.authorRole === meRole;
              return (
                <li
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    mine ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    aria-hidden
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      mine
                        ? "bg-ink text-canvas"
                        : "bg-accent/15 text-accent-deep"
                    }`}
                  >
                    {initials(m.authorName)}
                  </div>
                  <div
                    className={`min-w-0 max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      mine
                        ? "bg-ink text-canvas"
                        : "bg-canvas/80 text-ink"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold ${
                        mine ? "text-canvas/70" : "text-ink-muted"
                      }`}
                    >
                      {m.authorName ?? "Unknown"} ·{" "}
                      <span className="font-normal">{formatWhen(m.createdAt)}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                      {m.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder={
            meRole === "admin"
              ? "Reply to the family…"
              : "Ask a question or share a thought…"
          }
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={send}
            disabled={pending || !draft.trim()}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send message"}
          </button>
          {draft ? (
            <button
              type="button"
              onClick={() => setDraft("")}
              className="text-xs font-semibold text-ink-muted hover:text-ink"
            >
              Clear
            </button>
          ) : null}
          {err ? <p className="text-xs text-red-800">{err}</p> : null}
        </div>
      </div>
    </section>
  );
}
