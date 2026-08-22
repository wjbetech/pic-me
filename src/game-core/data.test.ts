import { afterEach, describe, expect, it, vi } from "vitest";
import { combineAnimalModules } from "./data";
import type { Animal } from "./animal";

const animal = (id: string): Animal => ({
  id,
  commonName: `Name ${id}`,
  latinName: "Latinus",
  animalClass: "Mammal",
  description: ["desc"],
  habitat: ["plains"],
  difficulty: "Easy",
  food: ["grass"],
  images: [{ url: "https://example.test/x.jpg" }],
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("combineAnimalModules", () => {
  it("passes raw array modules through", () => {
    const result = combineAnimalModules([[animal("a")], [animal("b")]]);

    expect(result).toHaveLength(2);
    expect(result.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("unwraps { default: [...] } module shapes", () => {
    const result = combineAnimalModules([{ default: [animal("a")] }]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("a");
  });

  it("handles mixed shapes and preserves order", () => {
    const result = combineAnimalModules([
      [animal("a")],
      { default: [animal("b"), animal("c")] },
      [animal("d")],
    ]);

    expect(result.map((x) => x.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("skips malformed modules with a warning instead of throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = combineAnimalModules([
      [animal("a")],
      "garbage" as unknown,
      null,
      42,
    ]);

    expect(result.map((x) => x.id)).toEqual(["a"]);
    expect(warn).toHaveBeenCalledTimes(3);
  });
});
