/** Safe id / option value from human text (lowercase, underscores). */
export function slugifyFieldId(input: string, fallback: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return s || fallback;
}
