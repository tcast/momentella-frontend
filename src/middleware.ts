import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function readSession(request: NextRequest) {
  const url = new URL("/api/auth/get-session", request.url);
  const res = await fetch(url, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (!o.user || typeof o.user !== "object") return null;
  return o.user as { role?: string | null };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const user = await readSession(request);
  if (!user) {
    const next = `${pathname}${request.nextUrl.search}`;
    const login = new URL("/login", request.url);
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  const role = user.role ?? "client";

  if (pathname.startsWith("/dashboard") && role !== "client") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
