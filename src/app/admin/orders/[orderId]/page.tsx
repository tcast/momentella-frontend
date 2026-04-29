import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetailActions } from "@/components/admin/OrderDetailActions";
import { serverFetchJson } from "@/lib/server-fetch";
import { formatPrice, orderStatusBadge } from "@/lib/commerce-display";

export const dynamic = "force-dynamic";

interface AdminOrder {
  id: string;
  buyerId: string | null;
  buyerEmail: string;
  buyerName: string | null;
  totalCents: number;
  status: string;
  isGift: boolean;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    name: string;
    slug: string;
    priceCents: number;
    itineraryDays: number | null;
  };
  buyer: { id: string; name: string; email: string } | null;
  giftCertificate: {
    id: string;
    code: string;
    recipientEmail: string;
    recipientName: string | null;
    message: string | null;
    sentAt: string | null;
    redeemedAt: string | null;
    redeemedById: string | null;
    redeemedTripId: string | null;
  } | null;
  trips: { id: string; title: string; status: string; clientId: string }[];
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const data = await serverFetchJson<{ order: AdminOrder }>(
    `/api/admin/orders/${orderId}`,
  );
  if (!data?.order) notFound();
  const o = data.order;
  const sb = orderStatusBadge(o.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <Link href="/admin/orders" className="hover:text-ink">
          Orders
        </Link>
        <span>/</span>
        <span className="text-ink">#{o.id.slice(-8)}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {o.product.name}
            </h2>
            <span className={sb.className}>{sb.label}</span>
            {o.isGift ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-900">
                Gift
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            Created {new Date(o.createdAt).toLocaleString()}
            {o.paidAt
              ? ` · paid ${new Date(o.paidAt).toLocaleString()}`
              : ""}
            {o.refundedAt
              ? ` · refunded ${new Date(o.refundedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-semibold text-ink">
            {formatPrice(o.totalCents)}
          </p>
          <OrderDetailActions
            orderId={o.id}
            status={o.status}
            canRefund={!!o.stripePaymentIntentId && o.status === "PAID"}
          />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card label="Buyer">
          {o.buyer ? (
            <Link
              href={`/admin/users/${o.buyer.id}`}
              className="font-semibold text-ink hover:underline"
            >
              {o.buyer.name || o.buyer.email}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{o.buyerName ?? "—"}</span>
          )}
          <p className="mt-1 text-xs text-ink-muted">{o.buyerEmail}</p>
        </Card>
        <Card label="Product">
          <p className="font-semibold text-ink">{o.product.name}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {o.product.itineraryDays
              ? `${o.product.itineraryDays} day${o.product.itineraryDays === 1 ? "" : "s"} included`
              : "—"}
          </p>
        </Card>
        <Card label="Stripe">
          <p className="font-mono text-[11px] text-ink-muted">
            {o.stripeCheckoutSessionId ?? "—"}
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink-muted">
            {o.stripePaymentIntentId ?? "—"}
          </p>
        </Card>
        {o.isGift && o.giftCertificate ? (
          <Card label="Gift certificate">
            <p className="font-mono text-sm font-semibold text-ink">
              {o.giftCertificate.code}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              For:{" "}
              {o.giftCertificate.recipientName ??
                o.giftCertificate.recipientEmail}{" "}
              · {o.giftCertificate.recipientEmail}
            </p>
            {o.giftCertificate.message ? (
              <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-ink">
                "{o.giftCertificate.message}"
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-ink-muted">
              {o.giftCertificate.redeemedAt
                ? `Redeemed ${new Date(o.giftCertificate.redeemedAt).toLocaleString()}`
                : o.giftCertificate.sentAt
                  ? `Sent ${new Date(o.giftCertificate.sentAt).toLocaleString()} · awaiting redemption`
                  : "Pending delivery"}
            </p>
            {o.giftCertificate.redeemedTripId ? (
              <Link
                href={`/admin/trips/${o.giftCertificate.redeemedTripId}`}
                className="mt-2 inline-flex text-xs font-semibold text-accent hover:underline"
              >
                Open redeemed trip →
              </Link>
            ) : null}
          </Card>
        ) : null}
        {o.trips.length > 0 ? (
          <Card label="Fulfilled trip">
            {o.trips.map((t) => (
              <Link
                key={t.id}
                href={`/admin/trips/${t.id}`}
                className="block font-semibold text-accent hover:underline"
              >
                {t.title} →
              </Link>
            ))}
          </Card>
        ) : null}
      </section>
    </div>
  );
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
