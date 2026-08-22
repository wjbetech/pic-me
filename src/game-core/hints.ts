/**
 * Hint text derivation from the animal schema.
 *
 * Pure logic so hint content is unit-testable and shared by every mode's
 * hint surface. Presentation (JSX) lives in the adapter layer.
 */
import type { Animal } from "./animal";

export type HintType = "habitat" | "diet" | "description";

export const HINT_TYPES: readonly HintType[] = [
  "habitat",
  "diet",
  "description",
];

export function isHintType(v: unknown): v is HintType {
  return typeof v === "string" && (HINT_TYPES as readonly string[]).includes(v);
}

/** Human-readable hint sentence for the requested aspect of the animal. */
export function getHintText(animal: Animal, type: HintType): string {
  switch (type) {
    case "diet":
      return `Eats ${animal.food.join(", ")}`;
    case "description":
      return animal.description[0] ?? "";
    default:
      return `Lives in ${animal.habitat.join(", ")}`;
  }
}

export interface HintPreference {
  enabled: boolean;
  type: HintType;
}
