import { describe, expect, it } from "vitest";
import type { Random } from "./random";
import { MathRandom } from "./random";

/** Deterministic LCG so shuffle order is fully reproducible in tests. */
function lcg(seed: number): Random {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

describe("MathRandom", () => {
  it("is bound to Math.random and stays in range", () => {
    for (let i = 0; i < 100; i++) {
      const v = MathRandom();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffled", () => {
  it("returns a permutation (same multiset, new array)", async () => {
    const { shuffled } = await import("./rotation");
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffled(input, lcg(42));

    expect(out).not.toBe(input);
    expect([...out].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));
  });

  it("is deterministic for a given seed", async () => {
    const { shuffled } = await import("./rotation");
    const input = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

    expect(shuffled(input, lcg(7))).toEqual(shuffled(input, lcg(7)));
  });

  it("handles empty and single-item inputs", async () => {
    const { shuffled } = await import("./rotation");
    expect(shuffled([], lcg(1))).toEqual([]);
    expect(shuffled(["x"], lcg(1))).toEqual(["x"]);
  });
});

describe("createRotation", () => {
  it("returns the full shuffled pool for 'all' or undefined", async () => {
    const { createRotation } = await import("./rotation");
    const pool = Array.from({ length: 10 }, (_, i) => i);

    expect(createRotation(pool, "all", lcg(3))).toHaveLength(10);
    expect(createRotation(pool, undefined, lcg(3))).toHaveLength(10);
  });

  it("samples n unique items without replacement", async () => {
    const { createRotation } = await import("./rotation");
    const pool = Array.from({ length: 10 }, (_, i) => i);

    const queue = createRotation(pool, 4, lcg(9));
    expect(queue).toHaveLength(4);
    expect(new Set(queue).size).toBe(4);
    for (const item of queue) expect(pool).toContain(item);
  });

  it("clamps requests larger than the pool to the full shuffle", async () => {
    const { createRotation } = await import("./rotation");
    const pool = [1, 2, 3];

    expect(createRotation(pool, 99, lcg(5))).toHaveLength(3);
  });

  it("returns [] for an empty pool", async () => {
    const { createRotation } = await import("./rotation");
    expect(createRotation([], "all", lcg(2))).toEqual([]);
    expect(createRotation([], 5, lcg(2))).toEqual([]);
  });

  it("clamps zero/negative rounds to an empty queue", async () => {
    const { createRotation } = await import("./rotation");
    const pool = [1, 2, 3];

    expect(createRotation(pool, 0, lcg(4))).toEqual([]);
    expect(createRotation(pool, -3, lcg(4))).toEqual([]);
  });
});
