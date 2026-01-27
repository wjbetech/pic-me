import type { Settings } from "../../types/GameOptions";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

export default function HangmanSettings({ settings, onChange }: Props) {
  return (
    <div>
      <h3 className="font-semibold mb-4">Game Settings</h3>

      <div className="mb-4">
        <label className="text-sm font-medium">Starting Lives</label>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              onChange({
                ...settings,
                lives: Math.max(5, (settings.lives ?? 5) - 1),
              })
            }
            disabled={(settings.lives ?? 5) <= 5}
          >
            −
          </button>
          <input
            type="number"
            min={5}
            max={15}
            step={1}
            value={settings.lives ?? 5}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isNaN(n)) return;
              onChange({
                ...settings,
                lives: Math.min(15, Math.max(5, Math.trunc(n))),
              });
            }}
            className="input input-sm w-16 text-center"
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              onChange({
                ...settings,
                lives: Math.min(15, (settings.lives ?? 5) + 1),
              })
            }
            disabled={(settings.lives ?? 5) >= 15}
          >
            +
          </button>
        </div>
      </div>

      <div>
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
    </div>
  );
}
