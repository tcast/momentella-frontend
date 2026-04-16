import { cookies, headers } from "next/headers";

export async function serverFetchJson<T = unknown>(
  pathname: string,
): Promise<T | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return null;
  const origin = `${proto}://${host}`;
  const store = await cookies();
  const cookie = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const res = await fetch(`${origin}${pathname}`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}
