import { cookies, headers } from "next/headers";

/**
 * Server-only JSON fetch for `/api/client/*` and `/api/admin/*`.
 * Prefer `MOMENTELLA_API_URL` so we do not HTTP-loop to this app’s public URL
 * (often fails on Railway / container hairpin). Falls back to same-origin when unset (local dev).
 */
export async function serverFetchJson<T = unknown>(
  pathname: string,
): Promise<T | null> {
  const store = await cookies();
  const cookie = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const upstream = process.env.MOMENTELLA_API_URL?.replace(/\/$/, "");
  let url: string | null = null;
  if (upstream) {
    url = `${upstream}${pathname}`;
  } else {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) url = `${proto}://${host}${pathname}`;
  }

  if (!url) return null;

  try {
    const res = await fetch(url, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
