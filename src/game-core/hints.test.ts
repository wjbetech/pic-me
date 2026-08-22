import { describe, expect, it } from "vitest";
import { getHintText, isHintType } from "./hints";
import type { Animal } from "./animal";

const animal: Animal = {
  id: "x-1",
  commonName: "Xanimal",
  latinName: "X",
  animalClass: "Mammal",
  description: ["First description line.", "Second line."],
  habitat: ["Forests", "Mountains"],
  difficulty: "Easy",
  food: ["Berries", "Leaves"],
  images: [{ url: "https://example.test/x.jpg" }],
};

describe("getHintText", () => {
  it("habitat hint lists habitats (legacy copy preserved)", () => {
    expect(getHintText(animal, "habitat")).toBe("Lives in Forests, Mountains");
  });

  it("diet hint lists food", () => {
    expect(getHintText(animal, "diet")).toBe("Eats Berries, Leaves");
  });

  it("description hint returns the first description entry only", () => {
    expect(getHintText(animal, "description")).toBe("First description line.");
  });

  it("description falls back to empty string when absent", () => {
    const bare = { ...animal, description: [] as string[] };
    expect(getHintText(bare, "description")).toBe("");
  });
});

describe("isHintType", () => {
  it("accepts known types and rejects junk", () => {
    expect(isHintType("habitat")).toBe(true);
    expect(isHintType("diet")).toBe(true);
    expect(isHintType("description")).toBe(true);
    expect(isHintType("smell")).toBe(false);
    expect(isHintType(undefined)).toBe(false);
    expect(isHintType(42)).toBe(false);
  });
});
