import type { Animal } from "../types/Animal";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Create a rotation queue of animals with no repeats until queue exhausted.
 * - if `rounds` === "all" → returns full shuffled list
 * - if rounds is a number N → returns N unique animals sampled without repeat
 */
export function createRotation(
  animals: Animal[],
  rounds: number | "all" | undefined
): Animal[] {
  if (!animals || animals.length === 0) return [];

  if (rounds === "all" || rounds === undefined) {
    return shuffle(animals);
  }

  const n = Math.max(0, Math.min(rounds, animals.length));
  // If requesting full or more than available, just return full shuffled
  if (n >= animals.length) return shuffle(animals);

  // Sample without replacement
  const pool = shuffle(animals);
  return pool.slice(0, n);
}

export default createRotation;
