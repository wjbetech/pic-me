/**
 * Round-limit semantics shared by all game modes.
 */

export type RoundsSetting = number | "all" | undefined;

/**
 * True when the requested number of rounds has been played.
 * `"all"`/`undefined` never exhaust (endless session).
 */
export function isExhausted(total: RoundsSetting, played: number): boolean {
  return total !== "all" && typeof total === "number" && played >= total;
}
