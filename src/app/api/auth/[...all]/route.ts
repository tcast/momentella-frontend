import type { NextRequest } from "next/server";
import { proxyToUpstream } from "@/lib/proxy-to-api";

type Ctx = { params: Promise<{ all: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { all } = await ctx.params;
  const path = `/api/auth/${(all ?? []).join("/")}`;
  return proxyToUpstream(request, path);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { all } = await ctx.params;
  const path = `/api/auth/${(all ?? []).join("/")}`;
  return proxyToUpstream(request, path);
}

export async function OPTIONS(request: NextRequest, ctx: Ctx) {
  const { all } = await ctx.params;
  const path = `/api/auth/${(all ?? []).join("/")}`;
  return proxyToUpstream(request, path);
}
