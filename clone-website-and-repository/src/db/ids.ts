/** Database-friendly identifiers and timestamps. */

export function generateId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isIso(v: unknown): v is string {
  return typeof v === "string" && v.length >= 10 && !Number.isNaN(Date.parse(v));
}

/** Coerce anything into a valid ISO timestamp, falling back to `fallback`. */
export function toIso(v: unknown, fallback: string): string {
  if (isIso(v)) return new Date(v).toISOString();
  return fallback;
}
