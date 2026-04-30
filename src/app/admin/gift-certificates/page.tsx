import Link from "next/link";
import { serverFetchJson } from "@/lib/server-fetch";
import { GiftCertRow, type CertRow } from "@/components/admin/GiftCertRow";

export const dynamic = "force-dynamic";

export default async function AdminGiftCertificatesPage() {
  const data = await serverFetchJson<{ giftCertificates: CertRow[] }>(
    "/api/admin/gift-certificates",
  );
  const certs = data?.giftCertificates ?? [];
  const awaiting = certs.filter((c) => !c.redeemedAt).length;
  const redeemed = certs.filter((c) => c.redeemedAt).length;

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
          Once redeemed, a trip is created in their account and they're sent a
          one-tap sign-in link.
        </p>
        <div className="mt-3 flex gap-4 text-xs text-ink-muted">
          <span>
            <strong className="text-ink">{certs.length}</strong> total
          </span>
          <span>
            <strong className="text-amber-900">{awaiting}</strong> awaiting
          </span>
          <span>
            <strong className="text-emerald-900">{redeemed}</strong> redeemed
          </span>
        </div>
      </div>

      {certs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
          No gift certificates yet.
        </p>
      ) : (
        <div className="space-y-4">
          {certs.map((c) => (
            <GiftCertRow key={c.id} cert={c} />
          ))}
        </div>
      )}
    </div>
  );
}
