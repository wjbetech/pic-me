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
    settings?: { blur: number; showDescription: boolean }
  ) => void;
}) {
  const [selected, setSelected] = useState<string>(OPTIONS[0].id);
  const [blur, setBlur] = useState<number>(0);
  const [showDescription, setShowDescription] = useState<boolean>(false);

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
              if (selected === "multiple-choice") {
                onConfirm?.(selected, { blur, showDescription });
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
