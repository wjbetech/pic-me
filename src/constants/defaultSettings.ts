import type { Settings } from "../types/GameOptions";

/**
 * Canonical settings defaults — the single source of truth used by BOTH
 * GameOptions and App (whose two copies once drifted, leaving hint prefs
 * undefined on the App-level persistence path).
 */
export const DEFAULT_SETTINGS: Settings = {
  blur: 0,
  showDescription: false,
  rounds: 10,
  difficulty: "all",
  lives: 5,
  mcHints: { enabled: false, type: "habitat" },
  hangmanHints: { enabled: false, type: "habitat" },
};
