import type { HintPreference } from "../game-core/hints";
import type { DifficultyFilter } from "../game-core/difficulty";

/**
 * Durable per-mode game configuration.
 *
 * Hint preferences are PER MODE by owner decision (docs/HANDOFF.md §8 #2):
 * toggling hints for one mode never affects another. Legacy inert fields
 * (hintsEnabled/hintType) were removed — they never affected gameplay.
 */
export type Settings = {
  blur?: number;
  showDescription?: boolean;
  rounds?: number | "all";
  /** Pool filter applied before rotation (settings-v2). Shared across modes,
   * mirroring rounds' existing shared-edit pattern. */
  difficulty?: DifficultyFilter;
  lives?: number;
  mcHints?: HintPreference;
  hangmanHints?: HintPreference;
};

export interface GameOptionsProps {
  onBack?: () => void;
  onConfirm?: (mode: string, settings?: Settings) => void;
  /** Mode preselected by the home card tap; falls back to persisted value. */
  initialMode?: string;
  /** Drill in to the dedicated hangman setup page. */
  onOpenHangmanConfig?: () => void;
}
