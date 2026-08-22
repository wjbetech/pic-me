/**
 * Rotation queues: the shared "no repeats until exhausted" ordering used by
 * every game mode. Pure functions over plain arrays — no React, no storage.
 */
import type { Random } from "./random";

/**
 * Fisher–Yates shuffle. Returns a new array; the input is not mutated.
 * Deterministic for a given `random`.
 */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type RoundsLimit = number | "all" | undefined;

/**
 * Build a rotation queue with no repeats until exhausted:
 * - `rounds === "all"` or undefined → the full list, shuffled
 * - `rounds === n` → n unique items sampled without replacement
 *   (clamped to the pool size; an "all"-sized request returns the full shuffle)
 */
export function createRotation<T>(
  animals: readonly T[],
  rounds: RoundsLimit,
  random: Random,
): T[] {
  if (!animals || animals.length === 0) return [];

  if (rounds === "all" || rounds === undefined) {
    return shuffled(animals, random);
  }

  const n = Math.max(0, Math.min(rounds, animals.length));
  if (n >= animals.length) return shuffled(animals, random);

  // Sample without replacement
  return shuffled(animals, random).slice(0, n);
}
