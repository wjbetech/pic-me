import { AnimatePresence } from "framer-motion";
import ModeTabs from "./ModeTabs";
import OptionHeader from "./OptionHeader";
import MultipleChoiceSettings from "./MultipleChoiceSettings";
import HangmanSettings from "./HangmanSettings";
import OpenAnswerSettings from "./OpenAnswerSettings";
import ActionRow from "./ActionRow";
import useLocalJSON from "../../utils/useLocalJSON";
import MotionDiv from "../common/MotionDiv";
import OPTIONS from "../../constants/gameModes";
import type { GameOptionsProps, Settings } from "../../types/GameOptions";

export default function GameOptions({ onBack, onConfirm }: GameOptionsProps) {
  const STORAGE_MODE = "pic-me:mode";
  const STORAGE_SETTINGS = "pic-me:settings";

  const [selected, setSelected] = useLocalJSON<string>(
    STORAGE_MODE,
    OPTIONS[0].id,
  );

  const [settings, setSettings] = useLocalJSON<Settings>(STORAGE_SETTINGS, {
    blur: 0,
    showDescription: false,
    hintsEnabled: false,
    hintType: "habitat",
    rounds: 10,
    lives: 5,
  });

  const handleConfirm = () => {
    if (selected === "multiple-choice") {
      onConfirm?.(selected, {
        blur: settings.blur,
        showDescription: settings.showDescription,
        hintsEnabled: settings.hintsEnabled,
        hintType: settings.hintsEnabled ? settings.hintType : undefined,
        rounds: settings.rounds,
      });
    } else if (selected === "hangman") {
      onConfirm?.(selected, {
        lives: Number(settings.lives),
        rounds: settings.rounds,
      });
    } else {
      onConfirm?.(selected);
    }
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
