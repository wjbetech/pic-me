import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv: any = motion.div;
const MotionNav: any = motion.nav;

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

type Settings = {
  blur?: number;
  showDescription?: boolean;
  hintsEnabled?: boolean;
  hintType?: string;
  rounds?: number | "all";
  lives?: number;
};

interface Props {
  onBack?: () => void;
  onConfirm?: (mode: string, settings?: Settings) => void;
}

export default function GameOptions({ onBack, onConfirm }: Props) {
  const [selected, setSelected] = useState<string>(OPTIONS[0].id);
  const [blur, setBlur] = useState<number>(0);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [hintsEnabled, setHintsEnabled] = useState<boolean>(false);
  const [hintType, setHintType] = useState<string>("habitat");
  const [rounds, setRounds] = useState<string>("10");
  const [lives, setLives] = useState<number>(5);

  const handleConfirm = () => {
    const roundsValue: number | "all" =
      rounds === "all" ? "all" : Number(rounds);
    if (selected === "multiple-choice") {
      onConfirm?.(selected, {
        blur,
        showDescription,
        hintsEnabled,
        hintType: hintsEnabled ? hintType : undefined,
        rounds: roundsValue,
      });
    } else if (selected === "hangman") {
      onConfirm?.(selected, { lives: Number(lives), rounds: roundsValue });
    } else {
      onConfirm?.(selected);
    }
  };

  const selectedOption = OPTIONS.find((o) => o.id === selected);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full bg-base-100 rounded-lg border overflow-hidden">
        {/* Menu Header */}
        <div className="flex border-b bg-base-200">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              className={`flex-1 px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
                selected === o.id
                  ? "bg-base-100 border-b-2 border-primary"
                  : "hover:bg-base-100/50"
              }`}
              aria-pressed={selected === o.id}
            >
              {o.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <MotionDiv
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            <p className="mb-6 text-sm opacity-80">{selectedOption?.desc}</p>

            {selected === "multiple-choice" && (
              <div>
                <h3 className="font-semibold mb-4">Game Settings</h3>

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
                    min={0}
                    max={5}
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="range range-sm w-full"
                  />
                </div>

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

            {selected === "hangman" && (
              <div>
                <h3 className="font-semibold mb-4">Game Settings</h3>

                <div className="mb-4">
                  <label className="text-sm font-medium">Starting Lives</label>
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

            {selected === "open-answer" && (
              <div>
                <p className="text-sm opacity-80">
                  Open Answer has no additional settings yet.
                </p>
              </div>
            )}
          </MotionDiv>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button className="btn btn-ghost" onClick={() => onBack && onBack()}>
            Back
          </button>
          <button className="btn btn-primary ml-auto" onClick={handleConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
