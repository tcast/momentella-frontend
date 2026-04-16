import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginInner } from "./LoginInner";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-24 text-center text-sm text-ink-muted">Loading…</div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
