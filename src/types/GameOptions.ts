export type Settings = {
  blur?: number;
  showDescription?: boolean;
  hintsEnabled?: boolean;
  hintType?: string;
  rounds?: number | "all";
  lives?: number;
};

export interface GameOptionsProps {
  onBack?: () => void;
  onConfirm?: (mode: string, settings?: Settings) => void;
}
