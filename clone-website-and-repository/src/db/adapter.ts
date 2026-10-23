/**
 * Storage adapters.
 *
 * The store only ever talks to this interface, so persistence can move from
 * localStorage to IndexedDB, the File System Access API, or a remote database
 * by implementing a new adapter — no UI or repository code changes.
 */

export class StorageQuotaError extends Error {
  constructor(message = "Storage quota exceeded") {
    super(message);
    this.name = "StorageQuotaError";
  }
}

export interface StorageAdapter {
  /** Human-readable adapter name (shown on the Data page). */
  readonly name: string;
  /** Primary key under which the snapshot is stored. */
  readonly key: string;
  /** Read raw serialized snapshot for `key` (defaults to the primary key). */
  read(key?: string): string | null;
  /** Write raw serialized snapshot. Throws StorageQuotaError when out of space. */
  write(raw: string, key?: string): void;
  remove(key?: string): void;
  /** Approximate bytes used by this app's keys. */
  bytesUsed(): number;
  /** Best-effort quota in bytes. */
  quotaBytes(): number;
  /** Called when another tab/window changes the primary key. Returns unsubscribe. */
  subscribe(onExternalChange: () => void): () => void;
}

const APP_PREFIX = "consultancy-";

export class LocalStorageAdapter implements StorageAdapter {
  readonly name = "localStorage";
  constructor(readonly key: string) {}

  read(key = this.key): string | null {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }

  write(raw: string, key = this.key): void {
    try {
      window.localStorage.setItem(key, raw);
    } catch (e) {
      const err = e as { name?: string; code?: number };
      if (err?.name === "QuotaExceededError" || err?.name === "NS_ERROR_DOM_QUOTA_REACHED" || err?.code === 22 || err?.code === 1014) {
        throw new StorageQuotaError();
      }
      throw e;
    }
  }

  remove(key = this.key): void {
    try { window.localStorage.removeItem(key); } catch { /* ignore */ }
  }

  bytesUsed(): number {
    let total = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (!k || !k.startsWith(APP_PREFIX)) continue;
        const v = window.localStorage.getItem(k) ?? "";
        total += (k.length + v.length) * 2; // UTF-16 code units
      }
    } catch { /* ignore */ }
    return total;
  }

  quotaBytes(): number {
    return 5 * 1024 * 1024; // conservative browser default
  }

  subscribe(onExternalChange: () => void): () => void {
    const handler = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key === null || e.key === this.key) onExternalChange();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
}

/** In-memory adapter for tests, SSR, or privacy modes where localStorage is unavailable. */
export class MemoryAdapter implements StorageAdapter {
  readonly name = "memory";
  private map = new Map<string, string>();
  constructor(readonly key: string) {}
  read(key = this.key) { return this.map.get(key) ?? null; }
  write(raw: string, key = this.key) { this.map.set(key, raw); }
  remove(key = this.key) { this.map.delete(key); }
  bytesUsed() { let t = 0; this.map.forEach((v, k) => { t += (k.length + v.length) * 2; }); return t; }
  quotaBytes() { return Number.POSITIVE_INFINITY; }
  subscribe() { return () => {}; }
}

export function createDefaultAdapter(key: string): StorageAdapter {
  try {
    const probe = APP_PREFIX + "probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return new LocalStorageAdapter(key);
  } catch {
    return new MemoryAdapter(key);
  }
}
