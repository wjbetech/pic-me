import type { HintPreference } from "../game-core/hints";
import type { DifficultyFilter } from "../game-core/difficulty";

export interface HangmanSettings {
  lives?: number;
  rounds?: number | "all";
  /** Pool filter applied before rotation (settings-v2). */
  difficulty?: DifficultyFilter;
  /** Per-mode hint preference (HANDOFF §8 decision #2). */
  hangmanHints?: HintPreference;
}

export type GameState = "playing" | "won" | "lost" | "transition";
