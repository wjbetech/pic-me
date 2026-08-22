/**
 * Dataset assembly for the bundled animal JSON modules.
 *
 * Pure data plumbing: takes whatever shape the bundler handed back per file
 * and flattens to one Animal[]. Lives in game-core so loading logic is
 * testable without React; the actual import.meta.glob call stays outside
 * in the adapter layer (src/hooks/useAnimals.ts).
 */
import type { Animal } from "./animal";

export function combineAnimalModules(modules: readonly unknown[]): Animal[] {
  return modules.flatMap((mod) => {
    if (Array.isArray(mod)) return mod as Animal[];
    if (
      mod &&
      typeof mod === "object" &&
      Array.isArray((mod as { default?: unknown }).default)
    ) {
      return (mod as { default: Animal[] }).default;
    }
    // A single malformed file must not kill the whole dataset.
    console.warn("Unexpected data module format:", mod);
    return [];
  });
}
