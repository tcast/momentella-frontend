"use client";

import { useState, useTransition } from "react";
import type { PublicProduct } from "./ProductGrid";
import { formatPrice } from "@/lib/commerce-display";
import { getPublicAppUrl } from "@/lib/env-public";

export function CheckoutForm({
  product,
  asGiftDefault = false,
  onClose,
}: {
  product: PublicProduct;
  asGiftDefault?: boolean;
  onClose: () => void;
}) {
  const [isGift, setIsGift] = useState(asGiftDefault);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setErr(null);
    if (!buyerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      setErr("Please enter a valid email.");
      return;
    }
    if (isGift) {
      if (
        !recipientEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)
      ) {
        setErr("Please enter a valid recipient email.");
        return;
      }
      if (
        recipientEmail.trim().toLowerCase() ===
        buyerEmail.trim().toLowerCase()
      ) {
        setErr(
          "Recipient and buyer email match — uncheck 'a gift' if this is for you.",
        );
        return;
      }
    }
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/public/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          buyerEmail: buyerEmail.trim(),
          buyerName: buyerName.trim() || undefined,
          isGift,
          recipientEmail: isGift ? recipientEmail.trim() : undefined,
          recipientName: isGift ? recipientName.trim() || undefined : undefined,
          giftMessage: isGift ? message.trim() || undefined : undefined,
        }),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not start checkout",
        );
        return;
      }
      const j = (await res.json()) as { url: string };
      window.location.assign(j.url);
    });
  }

  const cleanName = product.name.replace(/^Gift:\s*/i, "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-line bg-white px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {isGift ? "Send the gift of" : "You're getting"}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            {cleanName}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {formatPrice(product.priceCents)} · one-time
          </p>
        </header>

        <div className="space-y-4 px-6 py-5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
              className="h-4 w-4 rounded border-line text-accent"
            />
            <span className="text-sm font-medium text-ink">
              This is a gift for someone
            </span>
          </label>

          <Field label={isGift ? "Your name (the gift sender)" : "Your name"}>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className={inputCls}
              placeholder="Optional — but nice to know"
            />
          </Field>
          <Field label={isGift ? "Your email" : "Your email"}>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </Field>

          {isGift ? (
            <>
              <Field label="Recipient's name (optional)">
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={inputCls}
                  placeholder="So we can address them"
                />
              </Field>
              <Field label="Recipient's email">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className={inputCls}
                  placeholder="them@example.com"
                />
              </Field>
              <Field label="A note for them (optional)">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="A line or two — they'll see this in the gift email."
                />
              </Field>
            </>
          ) : null}

          {err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {err}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-line bg-white px-6 py-4">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
          >
            {pending
              ? "Redirecting to Stripe…"
              : isGift
                ? `Pay ${formatPrice(product.priceCents)} and send`
                : `Pay ${formatPrice(product.priceCents)}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink-muted hover:bg-canvas"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-ink-muted">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink";
