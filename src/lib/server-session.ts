import { cookies, headers } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean | null;
};

export type ServerSession = {
  user: SessionUser;
  session: Record<string, unknown>;
};

export async function getAppOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function getServerSession(): Promise<ServerSession | null> {
  const origin = await getAppOrigin();
  const store = await cookies();
  const cookie = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const res = await fetch(`${origin}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (!o.user || typeof o.user !== "object") return null;
  return {
    user: o.user as SessionUser,
    session: (o.session as Record<string, unknown>) ?? {},
  };
}
