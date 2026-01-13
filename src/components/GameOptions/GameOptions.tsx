import { useState } from "react";

const OPTIONS = [
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    desc: "Choose the correct name from a list of options.",
  },
  {
    id: "open-answer",
    title: "Open Answer",
    desc: "Type the animal name yourself for a freer challenge.",
  },
  {
    id: "hangman",
    title: "Hangman",
    desc: "Guess letters to reveal the animal name.",
  },
];

export default function GameOptions({
  onBack,
  onConfirm,
}: {
  onBack?: () => void;
  onConfirm?: (mode: string) => void;
}) {
  const [selected, setSelected] = useState<string>(OPTIONS[0].id);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Choose a game mode
        </h2>
        <p className="mb-6 opacity-80">
          Pick one of the modes below to start playing.
        </p>

        <div className="space-y-3">
          {OPTIONS.map((o) => (
            <label
              key={o.id}
              className={`card cursor-pointer border transition-colors ${
                selected === o.id ? "border-2 border-primary" : "border-transparent"
              }`}
            >
              <div className="card-body flex-row items-center gap-4 p-4">
                <input
                  type="radio"
                  name="game-mode"
                  className="radio"
                  checked={selected === o.id}
                  onChange={() => setSelected(o.id)}
                />
                <div>
                  <div className="font-semibold">{o.title}</div>
                  <div className="text-sm opacity-70">{o.desc}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn btn-ghost" onClick={() => onBack && onBack()}>
            Back
          </button>
          <button
            className="btn btn-primary ml-auto"
            onClick={() => onConfirm && onConfirm(selected)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
