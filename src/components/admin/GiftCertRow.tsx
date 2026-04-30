"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export interface CertRow {
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

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function GiftCertRow({ cert }: { cert: CertRow }) {
  const [copied, setCopied] = useState<"code" | "url" | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showMessage, setShowMessage] = useState(false);

  const redeemUrl = `${siteOrigin()}/redeem/${cert.code}`;
  const status: "redeemed" | "awaiting" | "pending" = cert.redeemedAt
    ? "redeemed"
    : cert.sentAt
      ? "awaiting"
      : "pending";

  function copy(text: string, kind: "code" | "url") {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function resend() {
    if (cert.redeemedAt) return;
    setResendMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/gift-certificates/${cert.id}/resend`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setResendMsg(
          j && typeof j === "object" && "error" in j
            ? `× ${(j as { error: unknown }).error}`
            : "× Could not resend",
        );
        return;
      }
      setResendMsg("✓ Sent — recipient should see it shortly");
      setTimeout(() => setResendMsg(null), 4000);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm">
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <code className="rounded-lg bg-canvas px-2.5 py-1 font-mono text-sm font-semibold text-ink">
              {cert.code}
            </code>
            <button
              type="button"
              onClick={() => copy(cert.code, "code")}
              className="text-[11px] font-semibold text-accent hover:underline"
            >
              {copied === "code" ? "Copied!" : "Copy code"}
            </button>
            <StatusPill status={status} />
          </div>
          <p className="text-sm font-semibold text-ink">
            {cert.order.product.name}
            <span className="ml-2 text-xs font-normal text-ink-muted">
              ${(cert.order.totalCents / 100).toFixed(2)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => copy(redeemUrl, "url")}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
          >
            {copied === "url" ? "Copied!" : "Copy redemption link"}
          </button>
          <Link
            href={`/redeem/${cert.code}`}
            target="_blank"
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
          >
            Preview as recipient ↗
          </Link>
          {!cert.redeemedAt ? (
            <button
              type="button"
              onClick={resend}
              disabled={pending}
              className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
            >
              {pending ? "Sending…" : "Resend gift email"}
            </button>
          ) : null}
        </div>
      </div>
      {resendMsg ? (
        <p
          className={`px-5 pb-3 text-xs ${resendMsg.startsWith("✓") ? "text-emerald-900" : "text-red-900"}`}
        >
          {resendMsg}
        </p>
      ) : null}

      <div className="grid gap-px bg-line/60 sm:grid-cols-3">
        <Cell label="Buyer">
          {cert.order.buyer ? (
            <Link
              href={`/admin/users/${cert.order.buyer.id}`}
              className="block hover:underline"
            >
              <p className="font-semibold text-ink">
                {cert.order.buyer.name || cert.order.buyerName || "—"}
              </p>
              <p className="text-xs text-ink-muted">
                {cert.order.buyer.email}
              </p>
            </Link>
          ) : (
            <>
              <p className="font-semibold text-ink">
                {cert.order.buyerName ?? "—"}
              </p>
              <p className="text-xs text-ink-muted">{cert.order.buyerEmail}</p>
            </>
          )}
          <p className="mt-1 text-[10px] text-ink-muted">
            Bought {fmtDateTime(cert.createdAt)}
          </p>
        </Cell>
        <Cell label={cert.redeemedBy ? "Recipient (account live)" : "Recipient"}>
          {cert.redeemedBy ? (
            <Link
              href={`/admin/users/${cert.redeemedBy.id}`}
              className="block hover:underline"
            >
              <p className="font-semibold text-ink">
                {cert.redeemedBy.name || cert.recipientName || "—"}
              </p>
              <p className="text-xs text-ink-muted">
                {cert.redeemedBy.email}
              </p>
            </Link>
          ) : (
            <>
              <p className="font-semibold text-ink">
                {cert.recipientName ?? "—"}
              </p>
              <p className="text-xs text-ink-muted">{cert.recipientEmail}</p>
            </>
          )}
          <p className="mt-1 text-[10px] text-ink-muted">
            {cert.sentAt
              ? `Email sent ${fmtDateTime(cert.sentAt)}`
              : "Email not sent yet"}
          </p>
        </Cell>
        <Cell label="Redemption">
          {cert.redeemedAt ? (
            <>
              <p className="font-semibold text-emerald-900">
                Redeemed {fmtDateTime(cert.redeemedAt)}
              </p>
              {cert.redeemedTrip ? (
                <Link
                  href={`/admin/trips/${cert.redeemedTrip.id}`}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Open trip → {cert.redeemedTrip.title}
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">Not yet redeemed</p>
              <p className="text-xs text-ink-muted">
                Recipient hasn't claimed this code.
              </p>
            </>
          )}
        </Cell>
      </div>

      {cert.message ? (
        <div className="border-t border-line/60 bg-canvas/30 px-5 py-3">
          <button
            type="button"
            onClick={() => setShowMessage((v) => !v)}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          >
            {showMessage ? "Hide personal note ▴" : "Show personal note ▾"}
          </button>
          {showMessage ? (
            <p className="mt-2 whitespace-pre-line rounded-lg border border-line bg-white px-3 py-2 text-sm italic text-ink">
              "{cert.message}"
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "redeemed" | "awaiting" | "pending";
}) {
  if (status === "redeemed") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
        Redeemed
      </span>
    );
  }
  if (status === "awaiting") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900">
        Awaiting redemption
      </span>
    );
  }
  return (
    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700">
      Pending send
    </span>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/70 px-5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      <div className="mt-1.5 text-sm">{children}</div>
    </div>
  );
}
