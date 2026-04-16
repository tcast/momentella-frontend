"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { authClient } from "@/lib/auth-client";

export default function SecurityPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { data: session, isPending } = authClient.useSession();

  function enableTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTotpUri(null);
    setBackupCodes(null);
    startTransition(async () => {
      const { data, error: err } = await authClient.twoFactor.enable({
        password,
      });
      if (err) {
        setError(err.message ?? "Could not enable 2FA");
        return;
      }
      if (!data?.totpURI) {
        setError("Could not load setup URI. Refresh and try again.");
        return;
      }
      setTotpUri(data.totpURI);
      setBackupCodes(data.backupCodes ?? null);
      setConfirmCode("");
    });
  }

  function confirmTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error: err } = await authClient.twoFactor.verifyTotp({
        code: confirmCode.replace(/\s/g, ""),
      });
      if (err) {
        setError(err.message ?? "Invalid code");
        return;
      }
      setTotpUri(null);
      setPassword("");
      setConfirmCode("");
      router.refresh();
    });
  }

  if (isPending) {
    return (
      <div className="px-5 py-24 text-center text-sm text-ink-muted">Loading…</div>
    );
  }

  if (!session?.user) {
    return (
      <AuthShell title="Security" subtitle="Sign in to manage two-factor authentication.">
        <p className="text-center text-sm text-ink-muted">
          <Link className="font-semibold text-ink hover:underline" href="/login?next=/account/security">
            Log in
          </Link>
        </p>
      </AuthShell>
    );
  }

  const qr = totpUri
    ? `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(totpUri)}`
    : null;

  const portalHome =
    (session.user.role ?? "client") === "admin" ? "/admin" : "/dashboard";

  return (
    <AuthShell
      title="Security"
      subtitle="Turn on two-factor authentication (TOTP) for your Momentella account."
    >
      <div className="space-y-6 text-sm text-ink-muted">
        <p>
          Signed in as{" "}
          <span className="font-semibold text-ink">{session.user.email}</span>
        </p>
        {session.user.twoFactorEnabled ? (
          <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-ink">
            Two-factor authentication is <strong>on</strong> for this account.
          </p>
        ) : totpUri ? null : (
          <form onSubmit={enableTotp} className="space-y-4">
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {error}
              </p>
            ) : null}
            <p>Confirm your password, then scan the QR in Google Authenticator, 1Password, or Authy.</p>
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
              {pending ? "Working…" : "Continue to QR code"}
            </button>
          </form>
        )}

        {!session.user.twoFactorEnabled && totpUri ? (
          <div className="space-y-5 border-t border-line pt-6">
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {error}
              </p>
            ) : null}
            <p className="text-ink">Scan this QR code, then enter a 6-digit code to finish setup.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr!} alt="QR code for authenticator app" className="mx-auto rounded-lg border border-line" />
            <p className="break-all text-xs text-ink-muted">{totpUri}</p>
            {backupCodes?.length ? (
              <div>
                <p className="font-semibold text-ink">Backup codes — save these somewhere safe</p>
                <ul className="mt-2 grid gap-1 font-mono text-xs text-ink">
                  {backupCodes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <form onSubmit={confirmTotp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Authenticator code
                </label>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm tracking-widest text-ink outline-none ring-gold/30 focus:ring-2"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-canvas transition hover:bg-accent-deep disabled:opacity-60"
              >
                {pending ? "Verifying…" : "Confirm and turn on 2FA"}
              </button>
            </form>
          </div>
        ) : null}

        <p>
          <Link href={portalHome} className="font-semibold text-accent hover:underline">
            ← Back to portal
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
