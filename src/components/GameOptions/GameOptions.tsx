import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import BackButton from "../BackButton/BackButton";

// Use a loose MotionDiv alias to avoid strict Motion prop type issues
// when passing standard HTML props like `className` in TSX.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;

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
  const STORAGE_MODE = "pic-me:mode";
  const STORAGE_SETTINGS = "pic-me:settings";

  const [selected, setSelected] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE);
      if (saved && OPTIONS.some((o) => o.id === saved)) return saved;
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return OPTIONS[0].id;
  });

  const [blur, setBlur] = useState<number>(() => {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS);
      if (s) {
        const j = JSON.parse(s);
        return typeof j.blur === "number" ? j.blur : 0;
      }
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return 0;
  });
  const [showDescription, setShowDescription] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS);
      if (s) {
        const j = JSON.parse(s);
        return typeof j.showDescription === "boolean"
          ? j.showDescription
          : false;
      }
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return false;
  });
  const [hintsEnabled, setHintsEnabled] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS);
      if (s) {
        const j = JSON.parse(s);
        return typeof j.hintsEnabled === "boolean" ? j.hintsEnabled : false;
      }
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return false;
  });
  const [hintType, setHintType] = useState<string>(() => {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS);
      if (s) {
        const j = JSON.parse(s);
        return typeof j.hintType === "string" ? j.hintType : "habitat";
      }
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return "habitat";
  });
  const [rounds, setRounds] = useState<string>(() => {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS);
      if (s) {
        const j = JSON.parse(s);
        return j.rounds === "all" ? "all" : String(j.rounds ?? "10");
      }
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return "10";
  });
  const [lives, setLives] = useState<number>(() => {
    try {
      const s = localStorage.getItem(STORAGE_SETTINGS);
      if (s) {
        const j = JSON.parse(s);
        return typeof j.lives === "number" ? j.lives : 5;
      }
    } catch (error) {
      console.log("Error reading saved mode from localStorage", error);
    }
    return 5;
  });

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

  // persist selected mode when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODE, selected);
    } catch (error) {
      console.log("Error saving selected mode to localStorage", error);
    }
  }, [selected]);

  const selectedOption = OPTIONS.find((o) => o.id === selected);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
          Pick a game mode!
        </h1>
      </div>
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
                  ? "bg-accent border-b-2 border-primary"
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
            <p className="mb-6 text-lg font-semibold opacity-80">
              {selectedOption?.desc}
            </p>

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
          <BackButton className="btn-ghost" onBack={onBack} />
          <button className="btn btn-primary ml-auto" onClick={handleConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
