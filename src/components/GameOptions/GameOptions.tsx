import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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

  // Height-tween plumbing: the settings sticker's content area glides to
  // whatever the mounted panel needs instead of snapping between mode
  // swaps (and follows in-panel reveals like the hint-type select).
  //
  // A callback ref (not an effect keyed on `selected`) is what makes this
  // correct under AnimatePresence mode="wait": the new panel mounts only
  // after the old one finishes exiting, so the ref fires at the moment a
  // measurable panel actually exists. ResizeObserver then tracks in-panel
  // growth. jsdom has no ResizeObserver — guard keeps tests at auto.
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | "auto">("auto");
  const reduceMotion = useReducedMotion();

  const attachPanel = useCallback((el: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => setPanelHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    resizeObserverRef.current = ro;
  }, []);

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

        {/* Expanded settings sticker — directly underneath the picked tile.
            The window tweens its height to the measured panel so mode
            switches glide; the floor keeps short panels from collapsing. */}
        <div className="mt-6 md:mt-8 bg-base-100 rounded-2xl border-4 border-base-content overflow-hidden">
          <MotionDiv
            animate={{ height: panelHeight }}
            initial={false}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.25, ease: "easeInOut" }
            }
            className="min-h-[22rem] overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <MotionDiv
                key={selected}
                ref={attachPanel}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
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
          </MotionDiv>
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
