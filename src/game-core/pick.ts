/**
 * Random selection helpers over plain data.
 */
import type { Random } from "./random";

interface HasImages {
  images?: readonly { url: string }[] | undefined;
}

/**
 * Pick a random entry, preferring entries that have images (falls back to
 * the full pool when none do). Returns null only for an empty/absent pool.
 */
export function pickRandomAnimal<T extends HasImages>(
  animals: readonly T[] | undefined | null,
  random: Random,
): T | null {
  if (!animals || animals.length === 0) return null;
  const withImages = animals.filter((a) => a.images && a.images.length > 0);
  const source = withImages.length > 0 ? withImages : animals;
  const index = Math.floor(random() * source.length);
  return source[index] ?? null;
}
