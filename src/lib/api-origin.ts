/** Upstream Momentella API (Fastify) — server-only. */
export function getUpstreamApiUrl(): string {
  const raw = process.env.MOMENTELLA_API_URL;
  if (!raw) {
    throw new Error(
      "MOMENTELLA_API_URL is not set (e.g. https://api-production-xxxx.up.railway.app)",
    );
  }
  return raw.replace(/\/$/, "");
}
