"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthNav() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
      },
    });
  }

  if (isPending) {
    return (
      <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-4 text-sm font-semibold">
        <Link className="text-ink-muted transition hover:text-ink" href="/login">
          Log in
        </Link>
        <Link
          className="rounded-full border border-line bg-canvas px-4 py-2 text-ink transition hover:border-accent/40 hover:bg-white"
          href="/signup"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const role = session.user.role ?? "client";

  return (
    <div className="flex items-center gap-4 text-sm font-semibold">
      {role === "admin" ? (
        <Link className="text-ink-muted transition hover:text-ink" href="/admin">
          Admin
        </Link>
      ) : (
        <Link className="text-ink-muted transition hover:text-ink" href="/dashboard">
          My trips
        </Link>
      )}
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-full bg-ink px-4 py-2 text-canvas transition hover:bg-accent-deep"
      >
        Sign out
      </button>
    </div>
  );
}
