import { FaArrowRight } from "react-icons/fa";
import type { Settings } from "../../types/GameOptions";
import DifficultyControl from "./DifficultyControl";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  /** Drill in to the dedicated hangman-config page (lives + hints). */
  onMore?: () => void;
}

/**
 * Hangman's slice of the configure page: the shared taxonomy only
 * (rounds + difficulty). Mode-specific settings — starting lives and the
 * hangman hint preference — live on hangman-config so this page never
 * changes height when modes switch.
 */
export default function HangmanSettings({ settings, onChange, onMore }: Props) {
  return (
    <div>
      <h3 className="font-semibold mb-4">Game Settings</h3>

      <div className="mb-4">
        <label className="text-sm font-medium">Rounds</label>
        <select
          value={String(settings.rounds ?? "10")}
          onChange={(e) =>
            onChange({
              ...settings,
              rounds: e.target.value === "all" ? "all" : Number(e.target.value),
            })
          }
          className="select select-sm w-full mt-2"
        >
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="all">All</option>
        </select>
      </div>

      <DifficultyControl
        value={settings.difficulty}
        onChange={(difficulty) => onChange({ ...settings, difficulty })}
      />

      {onMore && (
        <button
          type="button"
          onClick={onMore}
          data-testid="hangman-more-options"
          className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-base-content bg-base-200 px-4 py-2.5 text-sm font-semibold cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
        >
          Lives &amp; hints
          <FaArrowRight aria-hidden />
        </button>
      )}
    </div>
  );
}
