import type { Settings } from "../../types/GameOptions";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

export default function MultipleChoiceSettings({ settings, onChange }: Props) {
  const { hintsEnabled, hintType, rounds, blur, showDescription } = settings;

  return (
    <div>
      <h3 className="font-semibold mb-4">Game Settings</h3>

      <div className="mb-4">
        <div className="flex items-center gap-3">
          <input
            id="hints-enabled"
            type="checkbox"
            checked={!!hintsEnabled}
            onChange={(e) =>
              onChange({ ...settings, hintsEnabled: e.target.checked })
            }
            className="checkbox checkbox-sm"
          />
          <label
            htmlFor="hints-enabled"
            className="text-sm font-medium cursor-pointer"
          >
            Enable hints
          </label>
        </div>

        {hintsEnabled && (
          <div className="mt-3">
            <label className="text-sm font-medium">Hint type</label>
            <select
              value={hintType}
              onChange={(e) =>
                onChange({ ...settings, hintType: e.target.value })
              }
              className="select select-sm w-full mt-2"
            >
              <option value="habitat">Habitat</option>
              <option value="diet">Diet</option>
              <option value="description">Description</option>
            </select>
          </div>
        )}

        <div className="mt-4">
          <label className="text-sm font-medium">Rounds</label>
          <select
            value={String(rounds ?? "10")}
            onChange={(e) =>
              onChange({
                ...settings,
                rounds:
                  e.target.value === "all" ? "all" : Number(e.target.value),
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

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="blur-slider" className="text-sm font-medium">
            Image Blur
          </label>
          <span className="text-sm opacity-70">{(blur ?? 0) * 5}%</span>
        </div>
        <input
          id="blur-slider"
          type="range"
          min={0}
          max={5}
          value={blur ?? 0}
          onChange={(e) =>
            onChange({ ...settings, blur: Number(e.target.value) })
          }
          className="range range-sm w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="show-description"
          type="checkbox"
          checked={!!showDescription}
          onChange={(e) =>
            onChange({ ...settings, showDescription: e.target.checked })
          }
          className="checkbox checkbox-sm"
        />
        <label
          htmlFor="show-description"
          className="text-sm font-medium cursor-pointer"
        >
          Show description instead of image
        </label>
      </div>
    </div>
  );
}
