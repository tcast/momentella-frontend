import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-5 pb-20 pt-28 sm:pt-32 md:pt-28 md:px-10">
        <div className="mb-10 flex flex-col gap-4 border-b border-line/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Internal
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Admin console
            </h1>
          </div>
          <Link
            href="/account/security"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Security &amp; 2FA
          </Link>
        </div>
        <nav className="mb-10 flex flex-wrap gap-6 border-b border-line pb-4 text-sm font-semibold text-ink-muted">
          <Link className="hover:text-ink" href="/admin">
            Overview
          </Link>
          <Link className="hover:text-ink" href="/admin/users">
            Users
          </Link>
          <Link className="hover:text-ink" href="/admin/pages">
            Pages
          </Link>
          <Link className="hover:text-ink" href="/admin/trips">
            Trips
          </Link>
          <Link className="hover:text-ink" href="/admin/intake">
            Trip intakes
          </Link>
          <Link className="hover:text-ink" href="/admin/intake/submissions">
            Submissions
          </Link>
          <Link className="hover:text-ink" href="/admin/airports">
            Airports
          </Link>
          <Link className="hover:text-ink" href="/admin/destinations">
            Destinations
          </Link>
        </nav>
        {children}
      </main>
    </>
  );
}
