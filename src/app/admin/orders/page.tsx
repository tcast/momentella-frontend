import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";
import { formatPrice, orderStatusBadge } from "@/lib/commerce-display";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  buyerEmail: string;
  buyerName: string | null;
  totalCents: number;
  status: string;
  isGift: boolean;
  paidAt: string | null;
  createdAt: string;
  product: { name: string; slug: string };
  buyer: { id: string; name: string; email: string } | null;
  giftCertificate: {
    id: string;
    code: string;
    recipientEmail: string;
    recipientName: string | null;
    redeemedAt: string | null;
  } | null;
  trips: { id: string; title: string }[];
};

export default async function AdminOrdersPage() {
  const data = await serverFetchJson<{ orders: OrderRow[] }>(
    "/api/admin/orders",
  );
  const orders = data?.orders ?? [];

  const totals = orders.reduce(
    (acc, o) => {
      if (o.status === "PAID") acc.paid += o.totalCents;
      acc.all += o.totalCents;
      return acc;
    },
    { paid: 0, all: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Overview
        </Link>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          Orders
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Every purchase from{" "}
          <code className="rounded bg-canvas px-1">/services</code>. Self-
          purchases create a Trip; gifts create a redemption code that
          becomes a Trip when the recipient claims it.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="flex flex-wrap gap-3 rounded-xl border border-line bg-canvas/40 px-4 py-3 text-xs">
          <span className="font-semibold text-ink">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </span>
          <span className="text-ink-muted">·</span>
          <span>
            <span className="font-semibold text-emerald-700">
              {formatPrice(totals.paid)}
            </span>{" "}
            paid
          </span>
        </div>
      ) : null}

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-canvas/60">
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Fulfillment</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const sb = orderStatusBadge(o.status);
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-line/70 align-top transition-colors last:border-b-0 hover:bg-canvas/40"
                    >
                      <td className="px-4 py-4 text-xs text-ink-muted">
                        {new Date(o.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        {o.buyer ? (
                          <Link
                            href={`/admin/users/${o.buyer.id}`}
                            className="block hover:opacity-80"
                          >
                            <p className="font-medium text-ink hover:underline">
                              {o.buyer.name || o.buyerName || "—"}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {o.buyer.email}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <p className="font-medium text-ink">
                              {o.buyerName ?? "—"}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {o.buyerEmail}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-ink">
                        {o.product.name}
                      </td>
                      <td className="px-4 py-4 font-semibold text-ink">
                        {formatPrice(o.totalCents)}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {o.isGift ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 font-semibold text-violet-900">
                            Gift
                          </span>
                        ) : (
                          <span className="text-ink-muted">Self</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={sb.className}>{sb.label}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-ink-muted">
                        {o.giftCertificate ? (
                          o.giftCertificate.redeemedAt ? (
                            "Redeemed"
                          ) : (
                            <>
                              Awaiting:{" "}
                              {o.giftCertificate.recipientName ??
                                o.giftCertificate.recipientEmail}
                            </>
                          )
                        ) : o.trips[0] ? (
                          <Link
                            href={`/admin/trips/${o.trips[0].id}`}
                            className="font-semibold text-accent hover:underline"
                          >
                            Trip →
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
