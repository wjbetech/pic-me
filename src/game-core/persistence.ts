/**
 * Central persistence for pic-me.
 *
 * Two explicit groups with different lifetimes:
 * - `progress` — session-scoped game state (route, mode, per-game progress).
 *   Backed by sessionStorage and expired after PROGRESS_TTL_MS: refreshing
 *   within the TTL resumes where the player left off; after it, stale state
 *   is discarded and callers fall back (e.g., to Home).
 * - `config` — durable user preferences (settings, theme). Backed by
 *   localStorage, never expires.
 *
 * Rules of ownership:
 * - All app storage goes through this module. No raw localStorage/
 *   sessionStorage calls elsewhere.
 * - JSON methods auto-prefix keys (`picme.progress.<key>`, `picme.config.<key>`).
 * - Raw methods exist solely for legacy-format keys that must keep their exact
 *   on-disk format — currently `picme.theme`, read by the anti-FOUC script in
 *   index.html before React mounts. Do not add new raw keys.
 * - The factory accepts injected Storage/clock so tests are deterministic.
 *   A future API-backed adapter can replace the implementation without
 *   touching call sites.
 */

export const PROGRESS_TTL_MS = 10 * 60 * 1000;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface CreatePersistenceOptions {
  /** Backend for the `progress` group. Defaults to sessionStorage (memory fallback off-browser). */
  progressStorage?: StorageLike;
  /** Backend for the `config` group. Defaults to localStorage (memory fallback off-browser). */
  configStorage?: StorageLike;
  /** Clock for TTL math. Defaults to Date.now. */
  now?: () => number;
  /** Expiry window for the `progress` group. Defaults to PROGRESS_TTL_MS. */
  ttlMs?: number;
}

export interface ProgressGroup {
  /** Returns the stored value, or null if missing/expired/corrupt. Expired and corrupt entries are removed. */
  load<T>(key: string): T | null;
  /** Writes the value, (re)starting the TTL clock. Write failures are swallowed (quota/private mode). */
  save<T>(key: string, value: T): void;
  /** Removes the entry. Safe to call when absent. */
  clear(key: string): void;
}

export interface ConfigGroup {
  load<T>(key: string): T | null;
  save<T>(key: string, value: T): void;
  clear(key: string): void;
  /** Reads a legacy raw-string key (exact bytes, no JSON envelope). */
  loadRaw(key: string): string | null;
  /** Writes a legacy raw-string key (exact bytes). Required for `picme.theme` (FOUC script contract). */
  saveRaw(key: string, value: string): void;
  removeRaw(key: string): void;
}

export interface Persistence {
  progress: ProgressGroup;
  config: ConfigGroup;
}

const PROGRESS_PREFIX = "picme.progress.";
const CONFIG_PREFIX = "picme.config.";

interface Envelope<T> {
  savedAt: number;
  value: T;
}

function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function resolveBrowserStorage(name: "sessionStorage" | "localStorage"): StorageLike {
  try {
    if (typeof window !== "undefined") {
      const storage = name === "sessionStorage" ? window.sessionStorage : window.localStorage;
      if (storage) return storage;
    }
  } catch {
    // private mode / disabled storage → fall through to memory
  }
  return memoryStorage();
}

function safeGet(storage: StorageLike, fullKey: string): string | null {
  try {
    return storage.getItem(fullKey);
  } catch {
    return null;
  }
}

function safeSet(storage: StorageLike, fullKey: string, value: string): void {
  try {
    storage.setItem(fullKey, value);
  } catch {
    // quota exceeded / storage blocked — drop silently; games must not crash
  }
}

function safeRemove(storage: StorageLike, fullKey: string): void {
  try {
    storage.removeItem(fullKey);
  } catch {
    // ignore
  }
}

export function createPersistence(options: CreatePersistenceOptions = {}): Persistence {
  const progressStorage = options.progressStorage ?? resolveBrowserStorage("sessionStorage");
  const configStorage = options.configStorage ?? resolveBrowserStorage("localStorage");
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? PROGRESS_TTL_MS;

  const progress: ProgressGroup = {
    load<T>(key: string): T | null {
      const fullKey = PROGRESS_PREFIX + key;
      const raw = safeGet(progressStorage, fullKey);
      if (raw === null) return null;

      let envelope: Envelope<T>;
      try {
        envelope = JSON.parse(raw) as Envelope<T>;
      } catch {
        safeRemove(progressStorage, fullKey);
        return null;
      }

      if (
        !envelope ||
        typeof envelope.savedAt !== "number" ||
        typeof envelope.value === "undefined"
      ) {
        safeRemove(progressStorage, fullKey);
        return null;
      }

      if (now() - envelope.savedAt > ttlMs) {
        safeRemove(progressStorage, fullKey);
        return null;
      }

      return envelope.value;
    },

    save<T>(key: string, value: T): void {
      const envelope: Envelope<T> = { savedAt: now(), value };
      safeSet(progressStorage, PROGRESS_PREFIX + key, JSON.stringify(envelope));
    },

    clear(key: string): void {
      safeRemove(progressStorage, PROGRESS_PREFIX + key);
    },
  };

  const config: ConfigGroup = {
    load<T>(key: string): T | null {
      const raw = safeGet(configStorage, CONFIG_PREFIX + key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    save<T>(key: string, value: T): void {
      safeSet(configStorage, CONFIG_PREFIX + key, JSON.stringify(value));
    },

    clear(key: string): void {
      safeRemove(configStorage, CONFIG_PREFIX + key);
    },

    loadRaw(key: string): string | null {
      return safeGet(configStorage, key);
    },

    saveRaw(key: string, value: string): void {
      safeSet(configStorage, key, value);
    },

    removeRaw(key: string): void {
      safeRemove(configStorage, key);
    },
  };

  return { progress, config };
}

/** Default instance wired to real browser storage. */
export const persistence: Persistence = createPersistence();
