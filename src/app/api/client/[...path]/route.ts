import type { NextRequest } from "next/server";
import { proxyToUpstream } from "@/lib/proxy-to-api";

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const suffix = (path ?? []).join("/");
  return proxyToUpstream(request, `/api/client/${suffix}`);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
