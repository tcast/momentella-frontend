import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUpstreamApiUrl } from "./api-origin";

function stripCookieDomain(cookie: string): string {
  return cookie.replace(/;\s*Domain=[^;]*/gi, "");
}

function forwardSetCookies(from: Headers, to: NextResponse) {
  const list = typeof from.getSetCookie === "function" ? from.getSetCookie() : [];
  for (const raw of list) {
    to.headers.append("Set-Cookie", stripCookieDomain(raw));
  }
}

/** Forward browser → Next → upstream `/api/...` with cookies. */
export async function proxyToUpstream(
  request: NextRequest,
  upstreamPathname: string,
): Promise<NextResponse> {
  const upstreamBase = getUpstreamApiUrl();
  const incoming = new URL(request.url);
  const target = new URL(`${upstreamBase}${upstreamPathname}${incoming.search}`);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      ["host", "connection", "content-length", "transfer-encoding"].includes(
        lower,
      )
    ) {
      return;
    }
    headers.set(key, value);
  });

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  const res = await fetch(target, init);
  const out = new NextResponse(res.body, { status: res.status });

  const hopByHop = new Set([
    "connection",
    "transfer-encoding",
    "content-encoding",
    "keep-alive",
  ]);
  res.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "set-cookie") return;
    if (hopByHop.has(k)) return;
    out.headers.append(key, value);
  });
  forwardSetCookies(res.headers, out);
  return out;
}
