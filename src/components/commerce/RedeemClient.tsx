"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

interface RedeemResponse {
  tripId: string;
  signInState: "already_signed_in" | "magic_link_sent";
  redeemerEmail: string;
}

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
  const [done, setDone] = useState<RedeemResponse | null>(null);

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
      const j = (await res.json()) as RedeemResponse;
      if (j.signInState === "already_signed_in") {
        // Already authenticated → straight to their new trip.
        router.push(`/dashboard/trips/${j.tripId}`);
        return;
      }
      setDone(j);
    });
  }

  if (done) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-6 shadow-sm">
        <p className="font-display text-xl font-semibold text-emerald-950">
          Your {productName} is ready ✓
        </p>
        <p className="mt-2 text-sm text-emerald-900">
          We just emailed{" "}
          <span className="font-semibold">{done.redeemerEmail}</span> a
          one-tap sign-in link. Open it from your inbox and you'll land on
          your trip.
        </p>
        <p className="mt-2 text-xs text-emerald-900/80">
          Don't see it in 30 seconds? Check spam, or come back here and click
          Resend below.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/login?email=${encodeURIComponent(done.redeemerEmail)}`}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-accent-deep"
          >
            Sign in with password instead
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(null);
              submit();
            }}
            disabled={pending}
            className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"
          >
            Resend the sign-in link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl border border-line bg-white/80 p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-ink">
        Claim your {productName}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        We'll set up an account and email you a one-tap sign-in link.
        You'll see your new trip on your portal right away.
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
