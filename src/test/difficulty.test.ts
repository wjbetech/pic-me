import { describe, expect, it } from "vitest";
import { filterByDifficulty } from "../game-core/difficulty";
import type { Animal } from "../game-core/animal";

function animal(id: string, difficulty: Animal["difficulty"]): Animal {
  return {
    id,
    commonName: id,
    latinName: id,
    animalClass: "Mammalia",
    description: [`A ${id}.`],
    habitat: ["grassland"],
    difficulty,
    food: ["seeds"],
    images: [{ url: `https://example.com/${id}.jpg` }],
  };
}

const POOL = [
  animal("quoll", "Medium"),
  animal("quokka", "Easy"),
  animal("quagga", "Hard"),
  animal("qinling-panda", "Easy"),
];

describe("filterByDifficulty", () => {
  it('returns every animal for "all"', () => {
    expect(filterByDifficulty(POOL, "all")).toHaveLength(4);
  });

  it("filters by a single level, preserving input order", () => {
    const easy = filterByDifficulty(POOL, "easy");
    expect(easy.map((a) => a.id)).toEqual(["quokka", "qinling-panda"]);
  });

  it.each(["medium", "hard"] as const)("filters %s", (level) => {
    const picked = filterByDifficulty(POOL, level);
    expect(picked).toHaveLength(1);
    expect(picked[0].difficulty.toLowerCase()).toBe(level);
  });

  it("treats undefined as all (legacy settings blobs)", () => {
    expect(filterByDifficulty(POOL, undefined)).toHaveLength(4);
  });

  it("handles empty input", () => {
    expect(filterByDifficulty([], "easy")).toEqual([]);
  });

  it("returns empty when nothing matches", () => {
    const onlyEasy = [animal("quokka", "Easy")];
    expect(filterByDifficulty(onlyEasy, "hard")).toEqual([]);
  });
});
