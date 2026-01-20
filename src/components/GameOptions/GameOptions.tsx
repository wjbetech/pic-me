import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const MotionDiv: any = motion.div;
const MotionNav: any = motion.nav;
const MotionHeader: any = motion.header;
const MotionSection: any = motion.section;

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
      <div className="max-w-3xl w-full">
        <MotionDiv
          className="flex flex-col"
          layout
          transition={{ layout: { duration: 0.22, ease: "easeInOut" } }}
        >
          <MotionNav
            className="flex gap-2 bg-base-200 rounded-lg p-2 mb-4"
            layout
            transition={{ layout: { duration: 0.24, ease: "easeInOut" } }}
          >
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelected(o.id)}
                className={`btn btn-ghost flex-1 text-sm md:text-base justify-start px-4 py-2 ${
                  selected === o.id ? "btn-active bg-base-100 border" : ""
                }`}
                aria-pressed={selected === o.id}
              >
                <div className="font-semibold">{o.title}</div>
              </button>
            ))}
          </MotionNav>

          <MotionHeader
            className="mb-3"
            layout
            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          >
            <h2 className="text-xl md:text-2xl font-bold">
              {OPTIONS.find((o) => o.id === selected)?.title}
            </h2>
            <p className="text-sm opacity-70">
              {OPTIONS.find((o) => o.id === selected)?.desc}
            </p>
          </MotionHeader>

          <MotionSection
            className="bg-base-200 rounded-lg p-4 border border-base-300"
            layout
            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <MotionDiv
                key={selected}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Multiple Choice Settings */}
                {selected === "multiple-choice" && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm">
                      Game Settings
                    </h3>
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
                          <label className="text-sm font-medium">
                            Hint type
                          </label>
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
                        min="0"
                        max="5"
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

                {/* Hangman Settings */}
                {selected === "hangman" && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm">
                      Game Settings
                    </h3>
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

                {/* Open Answer has no extra settings for now */}
                {selected === "open-answer" && (
                  <div>
                    <p className="text-sm opacity-80">
                      Open Answer has no additional settings yet.
                    </p>
                  </div>
                )}
              </MotionDiv>
            </AnimatePresence>
          </MotionSection>

          <div className="mt-6 flex gap-3">
            <button
              className="btn btn-ghost"
              onClick={() => onBack && onBack()}
            >
              Back
            </button>
            <button
              className="btn btn-primary ml-auto"
              onClick={() => {
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
                  const settingsObj = {
                    blur: 0,
                    showDescription: false,
                    lives: Number(lives),
                    rounds: roundsValue,
                  };
                  onConfirm?.(selected, settingsObj);
                } else {
                  onConfirm?.(selected);
                }
              }}
            >
              Continue
            </button>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
