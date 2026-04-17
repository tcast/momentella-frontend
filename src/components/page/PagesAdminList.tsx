"use client";

import Link from "next/link";
import type { AdminPage } from "@/app/admin/pages/page";

export function PagesAdminList({ pages }: { pages: AdminPage[] }) {
  if (pages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
        No marketing pages yet. Click <strong>New page</strong> to create one.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {pages.map((p) => {
        const live = p.versions.find((v) => v.published);
        const latest = p.versions[0];
        const publicHref = p.slug === "home" ? "/" : `/p/${p.slug}`;
        return (
          <div
            key={p.id}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-white/70 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {p.name}
                </h3>
                {p.archived ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-ink-muted">
                    Archived
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900">
                    Live
                  </span>
                )}
                <Link
                  href={publicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-xs font-semibold text-accent hover:underline"
                >
                  {publicHref} ↗
                </Link>
              </div>
              {p.description ? (
                <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-ink-muted">
                {p.versions.length} version{p.versions.length === 1 ? "" : "s"}
                {live ? ` • v${live.version} published` : " • no live version yet"}
                {latest && latest.id !== live?.id
                  ? ` • latest draft: v${latest.version}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/pages/${p.id}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas"
              >
                Manage versions
              </Link>
              {latest ? (
                <Link
                  href={`/admin/pages/${p.id}/v/${latest.id}`}
                  className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:bg-accent-deep"
                >
                  Open builder
                </Link>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
