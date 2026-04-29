"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

export function RedeemClient({
  code,
  defaultEmail,
  defaultName,
  productName,
}: {
  code: string;
  defaultEmail: string;
  defaultName: string | null;
  productName: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setErr(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Please enter a valid email.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/public/gift-certificates/${encodeURIComponent(code)}/redeem`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: name.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setErr(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not redeem",
        );
        return;
      }
      const j = (await res.json()) as { tripId: string };
      // We've created the account; bounce them to login (they'll get a
      // magic-link email shortly to set a password). For now, drop them on
      // the login page with the email prefilled.
      router.push(
        `/login?email=${encodeURIComponent(email.trim().toLowerCase())}&trip=${encodeURIComponent(j.tripId)}`,
      );
    });
  }

  return (
    <div className="mt-10 rounded-2xl border border-line bg-white/80 p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-ink">
        Claim your {productName}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        We'll set up an account and email you a sign-in link. You'll see your
        new trip on your dashboard right away.
      </p>
      <div className="mt-5 space-y-3">
        <Field label="Your name (optional)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Your email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </Field>
        {err ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}
      </div>
      <div className="mt-5">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Redeeming…" : "Redeem and create my account"}
        </button>
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
