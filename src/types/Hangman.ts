export interface HangmanSettings {
  lives?: number;
  rounds?: number | "all";
}

export type GameState = "playing" | "won" | "lost" | "transition";
