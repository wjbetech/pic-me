import type { Settings } from "../../types/GameOptions";
import DifficultyControl from "./DifficultyControl";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

/**
 * Open Answer's settings panel (settings-v2): rounds + difficulty, the same
 * taxonomy siblings the other panels show. Rounds already reached the game
 * via GameOptions — the control just makes it visible here.
 */
export default function OpenAnswerSettings({ settings, onChange }: Props) {
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
    </div>
  );
}
