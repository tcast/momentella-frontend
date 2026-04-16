"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { authClient } from "@/lib/auth-client";
import { getPublicAppUrl } from "@/lib/env-public";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const callbackURL = `${getPublicAppUrl()}/dashboard`;
      const { error: err } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL,
      });
      if (err) {
        setError(err.message ?? "Could not create account");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Family clients start here. You’ll land in your trip dashboard once you’re in."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Name
          </label>
          <input
            required
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none ring-gold/30 focus:ring-2"
          />
        </div>
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
            autoComplete="new-password"
            minLength={8}
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
          {pending ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link className="font-semibold text-ink hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
