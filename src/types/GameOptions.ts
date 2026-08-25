import type { HintPreference } from "../game-core/hints";

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
  lives?: number;
  mcHints?: HintPreference;
  hangmanHints?: HintPreference;
};

export interface GameOptionsProps {
  onBack?: () => void;
  onConfirm?: (mode: string, settings?: Settings) => void;
  /** Mode preselected by the home card tap; falls back to persisted value. */
  initialMode?: string;
}
