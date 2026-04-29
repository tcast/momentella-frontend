import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getUpstreamApiUrl } from "@/lib/api-origin";
import { formatPrice } from "@/lib/commerce-display";

export const dynamic = "force-dynamic";

interface Status {
  status: string;
  isGift: boolean;
  product: { name: string; slug: string; itineraryDays: number | null } | null;
  trip: { id: string; title: string; clientId: string } | null;
  giftCertificate: {
    id: string;
    code: string;
    recipientEmail: string;
    recipientName: string | null;
  } | null;
  buyerEmail: string | null;
  buyerName: string | null;
  totalCents: number;
}

async function fetchStatus(sessionId: string): Promise<Status | null> {
  try {
    const url = `${getUpstreamApiUrl()}/api/public/checkout/status?session_id=${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Status;
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 pt-[8rem]">
          <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
            <p className="text-sm text-ink-muted">No checkout session found.</p>
            <Link
              href="/services"
              className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas"
            >
              Back to services
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const data = await fetchStatus(session_id);
  const paid = data?.status === "PAID";
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[8rem]">
        <div className="mx-auto max-w-xl px-5 py-16 text-center sm:px-8">
          {!data ? (
            <>
              <h1 className="font-display text-3xl font-medium text-ink">
                Hang tight — your order is processing
              </h1>
              <p className="mt-3 text-sm text-ink-muted">
                Stripe sometimes takes a few seconds to confirm. Refresh in a
                moment, or check your email.
              </p>
            </>
          ) : paid ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage">
                {data.isGift ? "Your gift is on its way" : "Order confirmed"}
              </p>
              <h1 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
                Thank you{data.buyerName ? `, ${data.buyerName.split(/\s+/)[0]}` : ""}.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                {data.isGift && data.giftCertificate ? (
                  <>
                    We just emailed{" "}
                    <strong>
                      {data.giftCertificate.recipientName ??
                        data.giftCertificate.recipientEmail}
                    </strong>{" "}
                    with the gift and a redemption link. We'll let you know when
                    they redeem.
                  </>
                ) : (
                  <>
                    Your designer will start on the {data.product?.name} right
                    away. Watch your inbox — we'll send the first questions
                    shortly.
                  </>
                )}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                Total {formatPrice(data.totalCents)} · receipt in your email.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {data.trip ? (
                  <Link
                    href={`/dashboard/trips/${data.trip.id}`}
                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas hover:bg-accent-deep"
                  >
                    Open your trip
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas hover:bg-accent-deep"
                  >
                    Open your portal
                  </Link>
                )}
                <Link
                  href="/services"
                  className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
                >
                  Back to services
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-medium text-ink">
                We're still confirming your payment
              </h1>
              <p className="mt-3 text-sm text-ink-muted">
                Status: {data.status}. Refresh in a few seconds — Stripe will
                notify us right after the charge clears.
              </p>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
