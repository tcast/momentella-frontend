"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

type Version = {
  id: string;
  version: number;
  label: string | null;
  published: boolean;
  updatedAt: string;
};

export function PageVersionsClient({
  pageId,
  slug,
  name,
  description,
  archived,
  versions,
}: {
  pageId: string;
  slug: string;
  name: string;
  description: string | null;
  archived: boolean;
  versions: Version[];
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editName, setEditName] = useState(name);
  const [editSlug, setEditSlug] = useState(slug);
  const [editDesc, setEditDesc] = useState(description ?? "");

  function newVersion(copyFromVersionId?: string) {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/pages/${pageId}/versions`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ copyFromVersionId }),
        },
      );
      if (!res.ok) {
        setErr("Could not create version");
        return;
      }
      const j = (await res.json()) as { version: { id: string } };
      router.push(`/admin/pages/${pageId}/v/${j.version.id}`);
    });
  }

  function savePage() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/admin/pages/${pageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          description: editDesc || null,
        }),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not save",
        );
        return;
      }
      router.refresh();
    });
  }

  function toggleArchive() {
    setErr(null);
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/admin/pages/${pageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !archived }),
      });
      if (!res.ok) {
        setErr("Could not update");
        return;
      }
      router.refresh();
    });
  }

  function deletePage() {
    if (!confirm(`Delete page "${name}" and all its versions?`)) return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/admin/pages/${pageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setErr("Could not delete");
        return;
      }
      router.push("/admin/pages");
    });
  }

  return (
    <div className="space-y-8">
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      ) : null}

      <div className="rounded-2xl border border-line bg-white/70 p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink">
          Page settings
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-ink-muted sm:col-span-2">
            Name
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-ink-muted">
            URL slug
            <input
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="text-xs font-semibold text-ink-muted">
            Internal description
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={savePage}
            disabled={pending}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
          >
            Save settings
          </button>
          <button
            type="button"
            onClick={toggleArchive}
            disabled={pending}
            className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas"
          >
            {archived ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            onClick={deletePage}
            disabled={pending}
            className="ml-auto rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            Delete page
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">
            Versions
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => newVersion()}
              disabled={pending}
              className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas"
            >
              + New blank version
            </button>
            {versions[0] ? (
              <button
                type="button"
                onClick={() => newVersion(versions[0]!.id)}
                disabled={pending}
                className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
              >
                + Duplicate latest
              </button>
            ) : null}
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {versions.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/80 p-4"
            >
              <div>
                <p className="font-semibold text-ink">
                  Version {v.version}
                  {v.published ? (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-900">
                      Live
                    </span>
                  ) : (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                      Draft
                    </span>
                  )}
                </p>
                {v.label ? (
                  <p className="text-xs text-ink-muted">{v.label}</p>
                ) : null}
                <p className="text-[10px] text-ink-muted">
                  Updated {new Date(v.updatedAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/admin/pages/${pageId}/v/${v.id}`}
                className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
              >
                Open builder
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
