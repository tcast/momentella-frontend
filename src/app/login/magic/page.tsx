"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { authClient } from "@/lib/auth-client";
import { getPublicAppUrl } from "@/lib/env-public";

export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const callbackURL = `${getPublicAppUrl()}/dashboard`;
      const { error: err } = await authClient.signIn.magicLink({
        email,
        callbackURL,
      });
      if (err) {
        setError(err.message ?? "Could not send link");
        return;
      }
      setMessage("Check your email for a sign-in link. You can close this tab.");
    });
  }

  return (
    <AuthShell
      title="Magic link"
      subtitle="We’ll email you a one-time link—no password needed for this step."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink">
            {message}
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
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send magic link"}
        </button>
        <p className="text-center text-sm text-ink-muted">
          <Link className="font-semibold text-ink hover:underline" href="/login">
            Back to password login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
