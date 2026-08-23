import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// See Hero.tsx — framer-motion 13's strict types reject plain HTML props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;
import ModeTabs from "./ModeTabs";
import OptionHeader from "./OptionHeader";
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
  lives: 5,
  mcHints: { enabled: false, type: "habitat" },
  hangmanHints: { enabled: false, type: "habitat" },
};

export default function GameOptions({ onBack, onConfirm }: GameOptionsProps) {
  // Same 'mode' progress key App reads — one encoding everywhere (mode-key bug fixed).
  const [selected, setSelected] = useState<string>(
    () => persistence.progress.load<string>("mode") ?? OPTIONS[0].id,
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

  const selectedOption = OPTIONS.find((o) => o.id === selected);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          Pick a game mode!
        </h1>
      </div>
      <div className="max-w-3xl w-full bg-base-100 rounded-lg border overflow-hidden">
        {/* Menu Header */}
        <ModeTabs
          options={OPTIONS}
          selected={selected}
          onSelect={setSelected}
        />

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
            <OptionHeader desc={selectedOption?.desc} />

            {selected === "multiple-choice" && (
              <MultipleChoiceSettings
                settings={settings}
                onChange={setSettings}
              />
            )}

            {selected === "hangman" && (
              <HangmanSettings settings={settings} onChange={setSettings} />
            )}

            {selected === "open-answer" && <OpenAnswerSettings />}
          </MotionDiv>
        </AnimatePresence>
        {/* Action Buttons */}
        <ActionRow onBack={onBack} onConfirm={handleConfirm} />
      </div>
    </div>
  );
}
