import type { HintPreference } from "../../game-core/hints";
import { HINT_TYPES } from "../../game-core/hints";

interface Props {
  /** Unique prefix for input ids within the settings panel. */
  idPrefix: string;
  pref: HintPreference | undefined;
  onChange: (pref: HintPreference) => void;
}

/**
 * Shared per-mode hint controls (enable toggle + aspect selector).
 * Each mode's settings panel embeds its own instance — preferences never
 * cross modes (HANDOFF §8 decision #2).
 */
export default function HintControls({ idPrefix, pref, onChange }: Props) {
  const enabled = !!pref?.enabled;
  const type = pref?.type ?? "habitat";

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <input
          id={`${idPrefix}-hints-enabled`}
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange({ enabled: e.target.checked, type })}
          className="checkbox checkbox-sm"
        />
        <label
          htmlFor={`${idPrefix}-hints-enabled`}
          className="text-sm font-medium cursor-pointer"
        >
          Enable hints
        </label>
      </div>

      {enabled && (
        <div className="mt-3">
          <label className="text-sm font-medium">Hint type</label>
          <select
            value={type}
            onChange={(e) =>
              onChange({
                enabled,
                type: e.target.value as HintPreference["type"],
              })
            }
            className="select select-sm w-full mt-2"
          >
            {HINT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
