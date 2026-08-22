import { describe, expect, it } from "vitest";
import { pickRandomAnimal } from "./pick";
import type { Random } from "./random";

interface Specimen {
  id: string;
  images?: readonly { url: string }[];
}

const withImage = (id: string): Specimen => ({
  id,
  images: [{ url: `https://example.test/${id}.jpg` }],
});
const withoutImage = (id: string): Specimen => ({ id });

/** Always picks index 0 — makes the chosen source pool observable. */
const first: Random = () => 0;

describe("pickRandomAnimal", () => {
  it("prefers entries that have images", () => {
    const pool = [withoutImage("a"), withImage("b"), withoutImage("c")];

    expect(pickRandomAnimal(pool, first)?.id).toBe("b");
  });

  it("falls back to the full pool when nothing has images", () => {
    const pool = [withoutImage("a"), withoutImage("b")];

    expect(pickRandomAnimal(pool, first)?.id).toBe("a");
  });

  it("returns null for empty or absent pools", () => {
    expect(pickRandomAnimal([], first)).toBeNull();
    expect(pickRandomAnimal(undefined, first)).toBeNull();
    expect(pickRandomAnimal(null, first)).toBeNull();
  });

  it("stays in range across many draws", () => {
    const pool = [withImage("a"), withImage("b"), withImage("c")];
    let seed = 12345;
    const rng: Random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    for (let i = 0; i < 500; i++) {
      const picked = pickRandomAnimal(pool, rng);
      expect(picked).not.toBeNull();
      expect(pool.map((p) => p.id)).toContain(picked?.id);
    }
  });
});
