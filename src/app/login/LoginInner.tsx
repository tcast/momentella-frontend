"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { authClient } from "@/lib/auth-client";

export function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error: err, data } = await authClient.signIn.email({
        email,
        password,
        callbackURL: next,
      });
      if (err) {
        setError(err.message ?? "Could not sign in");
        return;
      }
      const twoFactor = (data as { twoFactorRedirect?: boolean } | undefined)
        ?.twoFactorRedirect;
      if (twoFactor) {
        router.push("/two-factor");
        return;
      }
      router.push(next);
      router.refresh();
    });
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Client portal for trips and requests. Admins use the same login—role routes you to the right place."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Email
          </label>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none ring-gold/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Password
          </label>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none ring-gold/30 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Continue"}
        </button>
        <div className="space-y-2 text-center text-sm text-ink-muted">
          <p>
            <Link className="font-semibold text-accent underline-offset-4 hover:underline" href="/login/magic">
              Email me a magic link
            </Link>
          </p>
          <p>
            New here?{" "}
            <Link className="font-semibold text-ink hover:underline" href="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
