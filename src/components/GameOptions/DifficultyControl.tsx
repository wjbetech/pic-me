import {
  DIFFICULTY_FILTERS,
  type DifficultyFilter,
} from "../../game-core/difficulty";

interface Props {
  value?: DifficultyFilter;
  onChange: (d: DifficultyFilter) => void;
}

/**
 * Shared difficulty pool control (settings-v2 taxonomy). Rendered once per
 * mode panel — only the selected mode's panel mounts at a time, so a single
 * id is safe. Values are lowercase; labels read Title-case.
 */
export default function DifficultyControl({ value, onChange }: Props) {
  return (
    <div className="mb-5">
      <label htmlFor="difficulty-select" className="text-sm font-medium">
        Animal difficulty
      </label>
      <select
        id="difficulty-select"
        data-testid="difficulty-select"
        value={value ?? "all"}
        onChange={(e) => onChange(e.target.value as DifficultyFilter)}
        className="select select-sm w-full mt-2"
      >
        {DIFFICULTY_FILTERS.map((d) => (
          <option key={d} value={d}>
            {d[0].toUpperCase() + d.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
