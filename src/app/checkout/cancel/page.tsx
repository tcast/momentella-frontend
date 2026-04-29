import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function CheckoutCancelPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[8rem]">
        <div className="mx-auto max-w-xl px-5 py-16 text-center sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            No charge made
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            You stepped back from checkout
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            That's fine. Whenever you're ready, the catalog is right here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/services"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas hover:bg-accent-deep"
            >
              Back to services
            </Link>
            <Link
              href="/connect"
              className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
            >
              Or talk to us
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
