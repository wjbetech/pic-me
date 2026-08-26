import type { Settings } from "../../types/GameOptions";
import BackButton from "../BackButton/BackButton";
import HintControls from "../GameOptions/HintControls";
import LivesStepper from "../GameOptions/LivesStepper";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  /** Drill in to the dedicated hangman-config page. */
  onBack: () => void;
  onPlay: () => void;
}

/**
 * Dedicated per-mode setup page for Hangman (route: hangman-config).
 * Shows ONLY hangman-specific settings — starting lives and the hangman
 * hint preference — so the main configure page stays a stable height.
 * Centered like the configure page; Play starts Hangman directly.
 */
export default function HangmanConfig({
  settings,
  onChange,
  onBack,
  onPlay,
}: Props) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md py-8">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-8">
          Hangman setup
        </h1>

        <div className="bg-base-100 rounded-2xl border-4 border-base-content p-6">
          <HintControls
            idPrefix="hangman"
            pref={settings.hangmanHints}
            onChange={(hangmanHints) =>
              onChange({ ...settings, hangmanHints })
            }
          />
          <LivesStepper
            lives={settings.lives ?? 5}
            onChange={(lives) => onChange({ ...settings, lives })}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <BackButton onBack={onBack} className="btn-ghost" />
          <button
            data-testid="hangman-config-play"
            onClick={onPlay}
            className="btn btn-primary font-semibold border-base-content rounded-xl px-10 h-14 font-display text-xl text-primary-content"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
