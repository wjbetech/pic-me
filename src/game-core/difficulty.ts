/**
 * Difficulty pool filter (settings-v2 taxonomy, ticket 01).
 *
 * Pure logic over the animal dataset so it stays unit-testable and shared
 * by every mode's pool construction. Presentation (the settings select)
 * lives in the adapter layer.
 */
import type { Animal } from "./animal";

export type DifficultyFilter = "all" | "easy" | "medium" | "hard";

/** Select options in kid-reading order; "all" last, mirroring rounds. */
export const DIFFICULTY_FILTERS: readonly DifficultyFilter[] = [
  "easy",
  "medium",
  "hard",
  "all",
];

/**
 * Keep only the animals whose dataset difficulty matches `filter`.
 * Dataset values are capitalized ("Easy"|"Medium"|"Hard"); filter values
 * are lowercase like the rest of the settings vocabulary. "all"/undefined
 * passes the whole pool through. Input order is preserved — shuffle
 * remains rotation's job.
 */
export function filterByDifficulty(
  animals: readonly Animal[],
  filter: DifficultyFilter | undefined,
): Animal[] {
  if (!filter || filter === "all") return [...animals];
  const wanted = filter.toLowerCase();
  return animals.filter((a) => a.difficulty.toLowerCase() === wanted);
}
