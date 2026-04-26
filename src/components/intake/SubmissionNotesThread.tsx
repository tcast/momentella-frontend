"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export type NoteEntry = {
  id: string;
  authorId: string | null;
  authorName: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name: string | null): string {
  const base = (name ?? "?").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function SubmissionNotesThread({
  submissionId,
  notes,
  endpointBase,
  title = "Internal notes",
  helper = "Running log for your team. Guests never see these.",
}: {
  /** Used as the resource id; must align with whatever `endpointBase` expects. */
  submissionId: string;
  notes: NoteEntry[];
  /** Override the default `/api/admin/intake-submissions/<id>/notes` route. */
  endpointBase?: string;
  title?: string;
  helper?: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [pending, startTransition] = useTransition();

  const baseUrl =
    endpointBase ??
    `/api/admin/intake-submissions/${submissionId}/notes`;

  function addNote() {
    setErr(null);
    const body = draft.trim();
    if (!body) return;
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}${baseUrl}`, {
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
            : "Could not add note",
        );
        return;
      }
      setDraft("");
      router.refresh();
    });
  }

  function beginEdit(n: NoteEntry) {
    setEditingId(n.id);
    setEditBody(n.body);
    setErr(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  function saveEdit(n: NoteEntry) {
    setErr(null);
    const body = editBody.trim();
    if (!body) {
      setErr("Note can’t be empty.");
      return;
    }
    if (body === n.body) {
      cancelEdit();
      return;
    }
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}${baseUrl}/${n.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        setErr("Could not save note");
        return;
      }
      cancelEdit();
      router.refresh();
    });
  }

  function remove(n: NoteEntry) {
    if (!confirm("Delete this note? This can’t be undone.")) return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}${baseUrl}/${n.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setErr("Could not delete note");
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {title}
          </h3>
          <p className="text-xs text-ink-muted">{helper}</p>
        </div>
        <span className="text-xs text-ink-muted">
          {notes.length} note{notes.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Add a note
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Follow-ups, call summary, next steps…"
          className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addNote}
            disabled={pending || !draft.trim()}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-50"
          >
            {pending ? "Saving…" : "Add note"}
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
          {err ? <span className="text-xs text-red-800">{err}</span> : null}
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-8 text-center text-sm text-ink-muted">
          No notes yet. Your first note will appear here.
        </p>
      ) : (
        <ol className="space-y-3">
          {notes.map((n) => {
            const editing = editingId === n.id;
            const edited =
              n.updatedAt &&
              n.createdAt &&
              new Date(n.updatedAt).getTime() -
                new Date(n.createdAt).getTime() >
                1500;
            return (
              <li
                key={n.id}
                className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent-deep"
                  >
                    {initials(n.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {n.authorName ?? "Unknown"}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatWhen(n.createdAt)}
                        {edited ? " · edited" : ""}
                      </p>
                    </div>
                    {editing ? (
                      <>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={3}
                          className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(n)}
                            disabled={pending}
                            className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={pending}
                            className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-ink-muted hover:bg-canvas"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                          {n.body}
                        </p>
                        <div className="mt-2 flex gap-4 text-[11px] font-semibold text-ink-muted">
                          <button
                            type="button"
                            onClick={() => beginEdit(n)}
                            className="hover:text-ink"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(n)}
                            className="hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
