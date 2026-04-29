import Link from "next/link";
import { notFound } from "next/navigation";
import { RedeemClient } from "@/components/commerce/RedeemClient";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getUpstreamApiUrl } from "@/lib/api-origin";

export const dynamic = "force-dynamic";

interface PublicGift {
  code: string;
  recipientEmail: string;
  recipientName: string | null;
  message: string | null;
  redeemedAt: string | null;
  buyer: { name: string; email: string } | null;
  buyerName: string | null;
  product: {
    name: string;
    slug: string;
    itineraryDays: number | null;
    description: string | null;
  };
}

async function fetchGift(code: string): Promise<PublicGift | null> {
  try {
    const res = await fetch(
      `${getUpstreamApiUrl()}/api/public/gift-certificates/${encodeURIComponent(code)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicGift;
  } catch {
    return null;
  }
}

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const gift = await fetchGift(code);
  if (!gift) notFound();

  const fromName = gift.buyer?.name ?? gift.buyerName ?? "A friend";
  const alreadyRedeemed = !!gift.redeemedAt;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[6.25rem] md:pt-[4.25rem]">
        <div className="mx-auto max-w-xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage">
            A gift for you
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
            {fromName} sent you {gift.product.name}
          </h1>
          {gift.product.description ? (
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              {gift.product.description}
            </p>
          ) : null}
          {gift.message ? (
            <blockquote className="mt-6 rounded-2xl border-l-2 border-gold bg-canvas px-5 py-4 font-display text-lg italic text-ink">
              &ldquo;{gift.message}&rdquo;
              <footer className="mt-2 text-xs not-italic text-ink-muted">
                — {fromName}
              </footer>
            </blockquote>
          ) : null}

          {alreadyRedeemed ? (
            <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5">
              <p className="font-display text-lg font-semibold text-emerald-900">
                This gift has already been redeemed.
              </p>
              <p className="mt-1 text-sm text-emerald-900/90">
                If that wasn't you, ask {fromName} to get in touch with us.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
              >
                Sign in to your portal
              </Link>
            </div>
          ) : (
            <RedeemClient
              code={gift.code}
              defaultEmail={gift.recipientEmail}
              defaultName={gift.recipientName}
              productName={gift.product.name}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
