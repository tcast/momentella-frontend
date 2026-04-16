"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function CreateIntakeFormButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("family-trip");
  const [name, setName] = useState("Family trip intake");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function create() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/admin/intake-forms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          startWithTemplate: template,
        }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          json && typeof json === "object" && "error" in json
            ? String((json as { error: unknown }).error)
            : "Could not create",
        );
        return;
      }
      const form =
        json && typeof json === "object" && "form" in json
          ? (json as { form: { id: string } }).form
          : null;
      setOpen(false);
      if (form?.id) router.push(`/admin/intake/${form.id}`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
      >
        New intake form
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-canvas p-6 shadow-xl">
            <h4 className="font-display text-lg font-semibold text-ink">
              New intake form
            </h4>
            <label className="mt-4 block text-xs font-semibold uppercase text-ink-muted">
              URL slug
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold uppercase text-ink-muted">
              Display name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold uppercase text-ink-muted">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={template}
                onChange={(e) => setTemplate(e.target.checked)}
              />
              Start from family-trip template
            </label>
            {error ? (
              <p className="mt-2 text-sm text-red-800">{error}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="text-sm font-semibold text-ink-muted hover:text-ink"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending || !slug || !name}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60"
                onClick={() => void create()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
