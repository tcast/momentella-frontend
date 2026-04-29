import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

interface CertRow {
  id: string;
  code: string;
  recipientEmail: string;
  recipientName: string | null;
  message: string | null;
  sentAt: string | null;
  redeemedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    totalCents: number;
    product: { name: string; slug: string };
    buyer: { id: string; name: string; email: string } | null;
    buyerName: string | null;
    buyerEmail: string;
  };
  redeemedBy: { id: string; name: string; email: string } | null;
  redeemedTrip: { id: string; title: string } | null;
}

export default async function AdminGiftCertificatesPage() {
  const data = await serverFetchJson<{ giftCertificates: CertRow[] }>(
    "/api/admin/gift-certificates",
  );
  const certs = data?.giftCertificates ?? [];

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
          Gift certificates
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Every gift purchase generates a code the recipient redeems at{" "}
          <code className="rounded bg-canvas px-1">/redeem/&lt;code&gt;</code>.
          Once redeemed, a trip is created in their account.
        </p>
      </div>

      {certs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
          No gift certificates yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-canvas/60">
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Recipient</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Trip</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-line/70 align-top transition-colors last:border-b-0 hover:bg-canvas/40"
                  >
                    <td className="px-4 py-4 font-mono text-xs">
                      <p className="text-sm font-semibold text-ink">
                        {c.code}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink">
                      {c.order.product.name}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {c.order.buyer ? (
                        <Link
                          href={`/admin/users/${c.order.buyer.id}`}
                          className="block hover:underline"
                        >
                          <p className="font-medium text-ink">
                            {c.order.buyer.name || c.order.buyerName || "—"}
                          </p>
                          <p className="text-ink-muted">{c.order.buyer.email}</p>
                        </Link>
                      ) : (
                        <>
                          <p className="font-medium text-ink">
                            {c.order.buyerName ?? "—"}
                          </p>
                          <p className="text-ink-muted">{c.order.buyerEmail}</p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {c.redeemedBy ? (
                        <Link
                          href={`/admin/users/${c.redeemedBy.id}`}
                          className="block hover:underline"
                        >
                          <p className="font-medium text-ink">
                            {c.redeemedBy.name || c.recipientName || "—"}
                          </p>
                          <p className="text-ink-muted">
                            {c.redeemedBy.email}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="font-medium text-ink">
                            {c.recipientName ?? "—"}
                          </p>
                          <p className="text-ink-muted">{c.recipientEmail}</p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {c.redeemedAt ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900">
                          Redeemed
                        </span>
                      ) : c.sentAt ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
                          Awaiting redemption
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-semibold text-stone-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {c.redeemedTrip ? (
                        <Link
                          href={`/admin/trips/${c.redeemedTrip.id}`}
                          className="font-semibold text-accent hover:underline"
                        >
                          {c.redeemedTrip.title} →
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
