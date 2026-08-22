import type { HintPreference } from "../game-core/hints";

export interface HangmanSettings {
  lives?: number;
  rounds?: number | "all";
  /** Per-mode hint preference (HANDOFF §8 decision #2). */
  hangmanHints?: HintPreference;
}

export type GameState = "playing" | "won" | "lost" | "transition";
