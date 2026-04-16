"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { authClient } from "@/lib/auth-client";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error: err } = await authClient.twoFactor.verifyTotp({
        code: code.replace(/\s/g, ""),
      });
      if (err) {
        setError(err.message ?? "Invalid code");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <AuthShell
      title="Two-factor verification"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Authenticator code
          </label>
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm tracking-widest text-ink outline-none ring-gold/30 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Verifying…" : "Verify and continue"}
        </button>
        <p className="text-center text-sm text-ink-muted">
          <Link className="font-semibold text-ink hover:underline" href="/login">
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
