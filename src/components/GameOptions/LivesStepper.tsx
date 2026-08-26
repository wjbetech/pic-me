interface Props {
  lives: number;
  onChange: (lives: number) => void;
}

/**
 * Hangman's starting-lives stepper (5–15). Extracted from the old inline
 * settings panel so it can live on the dedicated hangman-config page.
 */
export default function LivesStepper({ lives, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium">Starting Lives</label>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onChange(Math.max(5, lives - 1))}
          disabled={lives <= 5}
        >
          −
        </button>
        <input
          type="number"
          min={5}
          max={15}
          step={1}
          value={lives}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            onChange(Math.min(15, Math.max(5, Math.trunc(n))));
          }}
          className="input input-sm w-16 text-center"
        />
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onChange(Math.min(15, lives + 1))}
          disabled={lives >= 15}
        >
          +
        </button>
      </div>
    </div>
  );
}
