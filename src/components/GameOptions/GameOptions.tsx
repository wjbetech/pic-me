import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// See Hero.tsx — framer-motion 13's strict types reject plain HTML props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;
import ModeStickers from "./ModeStickers";
import MultipleChoiceSettings from "./MultipleChoiceSettings";
import HangmanSettings from "./HangmanSettings";
import OpenAnswerSettings from "./OpenAnswerSettings";
import ActionRow from "./ActionRow";
import OPTIONS from "../../constants/gameModes";
import type { GameOptionsProps, Settings } from "../../types/GameOptions";
import { persistence } from "../../game-core/persistence";

const DEFAULT_SETTINGS: Settings = {
  blur: 0,
  showDescription: false,
  rounds: 10,
  difficulty: "all",
  lives: 5,
  mcHints: { enabled: false, type: "habitat" },
  hangmanHints: { enabled: false, type: "habitat" },
};

export default function GameOptions({
  onBack,
  onConfirm,
  initialMode,
}: GameOptionsProps) {
  // Preselect precedence: home card tap (initialMode) > persisted 'mode'
  // > first option. The tap must win on this mount; persistence still
  // covers refresh-without-card-context.
  const [selected, setSelected] = useState<string>(
    () => initialMode ?? persistence.progress.load<string>("mode") ?? OPTIONS[0].id,
  );

  const [settings, setSettings] = useState<Settings>(
    () => persistence.config.load<Settings>("settings") ?? DEFAULT_SETTINGS,
  );

  useEffect(() => {
    persistence.progress.save("mode", selected);
  }, [selected]);

  useEffect(() => {
    persistence.config.save("settings", settings);
  }, [settings]);

  // Panels own the canonical settings object; hand the whole thing over so
  // every mode receives exactly what the UI shows.
  const handleConfirm = () => {
    if (!selected) return;
    onConfirm?.(selected, settings);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl py-8 md:py-12">
        <h1 className="font-display text-4xl md:text-5xl text-center mb-8 md:mb-10">
          Pick a game mode!
        </h1>

        {/* Mode stickers — mirrors home ModeTiles; selection stuck-pressed */}
        <ModeStickers
          options={OPTIONS}
          selected={selected}
          onSelect={setSelected}
        />

        {/* Expanded settings sticker — directly underneath the picked tile */}
        <div className="mt-6 md:mt-8 bg-base-100 rounded-2xl border-4 border-base-content overflow-hidden">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6"
            >
              {selected === "multiple-choice" && (
                <MultipleChoiceSettings
                  settings={settings}
                  onChange={setSettings}
                />
              )}

              {selected === "hangman" && (
                <HangmanSettings settings={settings} onChange={setSettings} />
              )}

              {selected === "open-answer" && (
                <OpenAnswerSettings settings={settings} onChange={setSettings} />
              )}
            </MotionDiv>
          </AnimatePresence>
          {/* Action buttons — outside AnimatePresence so they never
              remount/animate when switching modes */}
          <div className="border-t-2 border-base-content/20 bg-base-200/50 px-6 py-4">
            <ActionRow onBack={onBack} onConfirm={handleConfirm} />
          </div>
        </div>
      </div>
    </div>
  );
}
