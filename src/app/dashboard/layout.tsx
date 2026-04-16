import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Your trips",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-5 pb-20 pt-28 sm:pt-32 md:pt-28">
        <div className="mb-10 flex flex-col gap-4 border-b border-line/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Client portal
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Your trips
            </h1>
          </div>
          <Link
            href="/account/security"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Security &amp; 2FA
          </Link>
        </div>
        {children}
      </main>
    </>
  );
}
