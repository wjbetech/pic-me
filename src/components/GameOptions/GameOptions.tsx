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
  onConfirm?: (
    mode: string,
    settings?: {
      blur: number;
      showDescription: boolean;
      hintsEnabled?: boolean;
      hintType?: string;
      rounds?: number | "all";
      lives?: number;
    },
  ) => void;
}) {
  const [selected, setSelected] = useState<string>(OPTIONS[0].id);
  const [blur, setBlur] = useState<number>(0);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [hintsEnabled, setHintsEnabled] = useState<boolean>(false);
  const [hintType, setHintType] = useState<string>("habitat");
  const [rounds, setRounds] = useState<string>("10");
  const [lives, setLives] = useState<number>(5);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          Choose a game mode
        </h2>
        <p className="mb-6 opacity-80 text-center">
          Pick one of the modes below to start playing.
        </p>

        <div className="space-y-3">
          {OPTIONS.map((o) => (
            <div key={o.id}>
              <label
                className={`card cursor-pointer border transition-colors ${
                  selected === o.id
                    ? "border-2 border-primary bg-base-100 shadow-lg"
                    : "border-transparent bg-transparent"
                }`}
              >
                <div className="card-body flex-row items-center gap-4 p-4">
                  <input
                    type="radio"
                    name="game-mode"
                    className={`radio ${
                      selected === o.id ? "radio-success" : ""
                    }`}
                    checked={selected === o.id}
                    onChange={() => setSelected(o.id)}
                  />
                  <div>
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-sm opacity-70">{o.desc}</div>
                  </div>
                </div>
              </label>

              {/* Multiple Choice Settings Popup */}
              {selected === "multiple-choice" && o.id === "multiple-choice" && (
                <div className="mt-3 p-4 bg-base-200 rounded-lg border border-base-300">
                  <h3 className="font-semibold mb-4 text-sm">Game Settings</h3>

                  {/* Hints Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        id="hints-enabled"
                        type="checkbox"
                        checked={hintsEnabled}
                        onChange={(e) => setHintsEnabled(e.target.checked)}
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
                          onChange={(e) => setHintType(e.target.value)}
                          className="select select-sm w-full mt-2"
                        >
                          <option value="habitat">Habitat</option>
                          <option value="diet">Diet</option>
                          <option value="description">Description</option>
                        </select>
                      </div>
                    )}

                    {/* Rounds Dropdown */}
                    <div className="mt-4">
                      <label className="text-sm font-medium">Rounds</label>
                      <select
                        value={rounds}
                        onChange={(e) => setRounds(e.target.value)}
                        className="select select-sm w-full mt-2"
                      >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="all">All</option>
                      </select>
                    </div>
                  </div>

                  {/* Blur Slider */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="blur-slider"
                        className="text-sm font-medium"
                      >
                        Image Blur
                      </label>
                      <span className="text-sm opacity-70">{blur * 5}%</span>
                    </div>
                    <input
                      id="blur-slider"
                      type="range"
                      min="0"
                      max="5"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="range range-sm w-full"
                    />
                    <div className="flex justify-between text-xs opacity-60 mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>15%</span>
                      <span>20%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  {/* Show Description Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      id="show-description"
                      type="checkbox"
                      checked={showDescription}
                      onChange={(e) => setShowDescription(e.target.checked)}
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
              )}

              {/* Hangman Settings Popup */}
              {selected === "hangman" && o.id === "hangman" && (
                <div className="mt-3 p-4 bg-base-200 rounded-lg border border-base-300">
                  <h3 className="font-semibold mb-4 text-sm">Game Settings</h3>

                  {/* Lives Dropdown */}
                  <div className="mb-4">
                    <label className="text-sm font-medium">
                      Starting Lives
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setLives((v) => Math.max(5, v - 1))}
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
                          setLives(Math.min(15, Math.max(5, Math.trunc(n))));
                        }}
                        className="input input-sm w-16 text-center"
                      />

                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setLives((v) => Math.min(15, v + 1))}
                        disabled={lives >= 15}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rounds Dropdown */}
                  <div>
                    <label className="text-sm font-medium">Rounds</label>
                    <select
                      value={rounds}
                      onChange={(e) => setRounds(e.target.value)}
                      className="select select-sm w-full mt-2"
                    >
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn btn-ghost" onClick={() => onBack && onBack()}>
            Back
          </button>
          <button
            className="btn btn-primary ml-auto"
            onClick={() => {
              console.log("Selected mode:", selected);
              console.log("Lives:", lives);
              console.log("Rounds:", rounds);

              if (selected === "multiple-choice") {
                const roundsValue: number | "all" =
                  rounds === "all" ? "all" : Number(rounds);
                onConfirm?.(selected, {
                  blur,
                  showDescription,
                  hintsEnabled,
                  hintType: hintsEnabled ? hintType : undefined,
                  rounds: roundsValue,
                });
              } else if (selected === "hangman") {
                const roundsValue: number | "all" =
                  rounds === "all" ? "all" : Number(rounds);
                const settings = {
                  blur: 0,
                  showDescription: false,
                  lives: Number(lives),
                  rounds: roundsValue,
                };
                console.log("Hangman settings:", settings);
                onConfirm?.(selected, settings);
              } else {
                onConfirm?.(selected);
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
