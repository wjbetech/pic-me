import { describe, expect, it } from "vitest";
import {
  createPersistence,
  PROGRESS_TTL_MS,
  type StorageLike,
} from "./persistence";

function makeStorage(): StorageLike & { dump(): Record<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    dump: () => Object.fromEntries(map),
  };
}

interface Clock {
  now: () => number;
  advance: (ms: number) => void;
}

function makeClock(start = 1_000_000): Clock {
  let current = start;
  return {
    now: () => current,
    advance: (ms) => {
      current += ms;
    },
  };
}

describe("progress group", () => {
  it("round-trips a value within the TTL", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({ progressStorage: storage, now: clock.now });

    progress.save("hangman", { score: 3, lives: 2 });

    clock.advance(PROGRESS_TTL_MS - 1);
    expect(progress.load<{ score: number; lives: number }>("hangman")).toEqual({
      score: 3,
      lives: 2,
    });
  });

  it("returns null and removes the entry once the TTL has elapsed", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({ progressStorage: storage, now: clock.now });

    progress.save("hangman", { score: 1 });
    clock.advance(PROGRESS_TTL_MS + 1);

    expect(progress.load("hangman")).toBeNull();
    expect(storage.dump()).toEqual({});
  });

  it("refreshes the TTL clock on every save", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({ progressStorage: storage, now: clock.now });

    progress.save("hangman", { round: 1 });
    clock.advance(PROGRESS_TTL_MS - 5_000);
    progress.save("hangman", { round: 2 });
    clock.advance(PROGRESS_TTL_MS - 5_000);

    expect(progress.load<{ round: number }>("hangman")).toEqual({ round: 2 });
  });

  it("returns null and self-heals on corrupt JSON", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({ progressStorage: storage, now: clock.now });

    storage.setItem("picme.progress.hangman", "{not json");

    expect(progress.load("hangman")).toBeNull();
    expect(storage.dump()).toEqual({});
  });

  it("rejects envelopes without a numeric savedAt", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({ progressStorage: storage, now: clock.now });

    storage.setItem("picme.progress.hangman", JSON.stringify({ value: 42 }));

    expect(progress.load("hangman")).toBeNull();
    expect(storage.dump()).toEqual({});
  });

  it("honors a custom ttlMs override", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({
      progressStorage: storage,
      now: clock.now,
      ttlMs: 100,
    });

    progress.save("route", "play");
    clock.advance(101);

    expect(progress.load("route")).toBeNull();
  });

  it("isolates keys from each other", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { progress } = createPersistence({ progressStorage: storage, now: clock.now });

    progress.save("a", 1);
    progress.save("b", 2);
    progress.clear("a");

    expect(progress.load("a")).toBeNull();
    expect(progress.load("b")).toBe(2);
  });
});

describe("config group", () => {
  it("round-trips values regardless of elapsed time (durable)", () => {
    const storage = makeStorage();
    const clock = makeClock();
    const { config } = createPersistence({ configStorage: storage, now: clock.now });

    config.save("settings", { blur: 2, rounds: "all" });
    clock.advance(365 * 24 * 60 * 60 * 1000); // a year later

    expect(config.load<{ blur: number; rounds: string }>("settings")).toEqual({
      blur: 2,
      rounds: "all",
    });
  });

  it("returns null on corrupt JSON but leaves other keys intact", () => {
    const storage = makeStorage();
    const { config } = createPersistence({ configStorage: storage });

    config.save("settings", { ok: true });
    storage.setItem("picme.config.broken", "{{{");

    expect(config.load("broken")).toBeNull();
    expect(config.load<{ ok: boolean }>("settings")).toEqual({ ok: true });
  });

  it("raw methods preserve exact bytes for legacy keys (theme FOUC contract)", () => {
    const storage = makeStorage();
    const { config } = createPersistence({ configStorage: storage });

    config.saveRaw("picme.theme", "dracula");

    // Exact bytes — no quotes, no envelope. index.html reads this before React mounts.
    expect(storage.dump()["picme.theme"]).toBe("dracula");
    expect(config.loadRaw("picme.theme")).toBe("dracula");
  });

  it("prefixed JSON keys and raw keys do not collide", () => {
    const storage = makeStorage();
    const { config } = createPersistence({ configStorage: storage });

    config.saveRaw("picme.theme", "cmyk");
    config.save("theme", { token: "dracula" });

    expect(config.loadRaw("picme.theme")).toBe("cmyk");
    expect(config.load<{ token: string }>("theme")).toEqual({ token: "dracula" });
  });
});

describe("default instance", () => {
  it("falls back to in-memory storage off-browser and still works", async () => {
    const { persistence } = await import("./persistence");

    persistence.progress.save("smoke", { n: 7 });
    expect(persistence.progress.load<{ n: number }>("smoke")).toEqual({ n: 7 });

    persistence.config.saveRaw("picme.theme", "cmyk");
    expect(persistence.config.loadRaw("picme.theme")).toBe("cmyk");
  });
});
