"use client";

import { useEffect, useState } from "react";
import { IntakeFormRenderer } from "@/components/intake/IntakeFormRenderer";
import type { IntakeFormSchema } from "@/lib/intake-schema";
import { parseIntakeFormSchema } from "@/lib/intake-schema";
import { getPublicAppUrl } from "@/lib/env-public";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; msg: string }
  | { kind: "ready"; schema: IntakeFormSchema };

export function IntakeFormBlockView({
  slug,
  preview = false,
}: {
  slug: string;
  preview?: boolean;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ kind: "missing" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${getPublicAppUrl()}/api/public/intake-forms/${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setState({ kind: "missing" });
          } else if (!cancelled) {
            setState({ kind: "error", msg: `Form load failed (${res.status})` });
          }
          return;
        }
        const j = (await res.json().catch(() => null)) as
          | { version?: { schema?: unknown } }
          | null;
        const schema = parseIntakeFormSchema(j?.version?.schema ?? null);
        if (!schema) {
          if (!cancelled) setState({ kind: "missing" });
          return;
        }
        if (!cancelled) setState({ kind: "ready", schema });
      } catch {
        if (!cancelled) setState({ kind: "error", msg: "Network error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.kind === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-line bg-white/60 px-6 py-10 text-center text-sm text-ink-muted">
          Loading form…
        </div>
      </div>
    );
  }

  if (state.kind === "missing") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-sm text-amber-900">
          <strong>Form not configured.</strong>{" "}
          {slug ? (
            <>
              No published form found for slug{" "}
              <code className="rounded bg-white px-1 font-mono text-xs">
                {slug}
              </code>
              .
            </>
          ) : (
            <>Pick a form in the page builder.</>
          )}
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-900">
          {state.msg}
        </div>
      </div>
    );
  }

  return <IntakeFormRenderer slug={slug} schema={state.schema} preview={preview} />;
}
