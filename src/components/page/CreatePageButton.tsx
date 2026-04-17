"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function CreatePageButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setSlug("");
    setDescription("");
    setErr(null);
    setOpen(false);
  }

  function submit() {
    setErr(null);
    if (!name.trim()) {
      setErr("Please give the page a name.");
      return;
    }
    const finalSlug = slug.trim() || slugify(name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setErr("Slug may only contain lowercase letters, numbers, and hyphens.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/admin/pages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: finalSlug,
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not create page",
        );
        return;
      }
      const j = (await res.json().catch(() => null)) as
        | { page?: { id: string } }
        | null;
      reset();
      if (j?.page?.id) {
        router.push(`/admin/pages/${j.page.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
      >
        + New page
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-line bg-canvas p-6 shadow-2xl">
            <h3 className="font-display text-xl font-semibold text-ink">
              New marketing page
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Give it a friendly name. The URL slug auto-fills; you can edit it.
              The page will live at <code className="rounded bg-canvas px-1">/p/your-slug</code>.
            </p>
            {err ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {err}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-ink-muted">
                Page name
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. About us"
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-ink-muted">
                URL slug
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="about-us"
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="block text-xs font-semibold text-ink-muted">
                Short internal description (optional)
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
              >
                Create
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink-muted hover:bg-canvas"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
