import Link from "next/link";
import { CreatePageButton } from "@/components/page/CreatePageButton";
import { PagesAdminList } from "@/components/page/PagesAdminList";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

export type AdminPageVersion = {
  id: string;
  version: number;
  label: string | null;
  published: boolean;
  updatedAt: string;
};

export type AdminPage = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  archived: boolean;
  updatedAt: string;
  versions: AdminPageVersion[];
};

export default async function AdminPagesPage() {
  const data = await serverFetchJson<{ pages: AdminPage[] }>(
    "/api/admin/pages",
  );
  const pages = data?.pages ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Overview
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Marketing pages
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Visually edit the <strong>homepage</strong> and any other
              marketing page — no code required. Drop in blocks (hero banner,
              quote, feature tiles, steps, testimonial, buttons, paragraphs,
              images) and publish when you’re happy. Changes go live the moment
              you hit <strong>Publish</strong>.
            </p>
          </div>
          <CreatePageButton />
        </div>
      </div>
      <PagesAdminList pages={pages} />
    </div>
  );
}
