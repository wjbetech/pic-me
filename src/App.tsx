import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import GameOptions from "./components/GameOptions/GameOptions";
import HangmanConfig from "./components/HangmanConfig/HangmanConfig";
import MultiChoice from "./components/MultiChoice/MultiChoice";
import Hangman from "./components/Hangman/Hangman";
import OpenAnswer from "./components/OpenAnswer/OpenAnswer";
import { persistence } from "./game-core/persistence";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Settings } from "./types/GameOptions";

// See Hero.tsx — framer-motion 13's strict Motion prop types reject plain
// HTML props like className without a generic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;

type Route = "home" | "options" | "hangman-config" | "play";

interface NavigationState {
  route: Route;
  mode: string | null;
}

import { DEFAULT_SETTINGS } from "./constants/defaultSettings";
const VALID_ROUTES: readonly Route[] = [
  "home",
  "options",
  "hangman-config",
  "play",
];

// Slideshow push between the configure page and hangman-config (and back):
// entering page slides in from the travel direction while the outgoing one
// slides out the far side. Reduced motion collapses to a fade.
const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%", opacity: 0.4 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%", opacity: 0.4 }),
};

function App() {
  // Session-scoped navigation: shares the progress TTL, so a stale route/mode
  // falls back to Home exactly like expired game state (HANDOFF §3).
  const [{ route, mode }, setNavigation] = useState<NavigationState>(() => {
    const saved = persistence.progress.load<NavigationState>("navigation");
    if (saved && VALID_ROUTES.includes(saved.route)) {
      return { route: saved.route, mode: saved.mode ?? null };
    }
    return { route: "home", mode: null };
  });

  const setRoute = (next: Route) =>
    setNavigation((prev) => ({ ...prev, route: next }));
  const setMode = (next: string | null) =>
    setNavigation((prev) => ({ ...prev, mode: next }));

  // Durable user preferences: never expires (HANDOFF §3).
  const [gameSettings, setGameSettings] = useState<Settings>(
    () => persistence.config.load<Settings>("settings") ?? DEFAULT_SETTINGS,
  );

  // Session-scoped navigation: expires with game progress after the TTL.
  useEffect(() => {
    persistence.progress.save("navigation", { route, mode });
  }, [route, mode]);

  // Durable user preferences.
  useEffect(() => {
    persistence.config.save("settings", gameSettings);
  }, [gameSettings]);

  // Home scroll container — the overlay navbar watches it to switch from
  // transparent-over-photo to glass past the hero (.scratch/home-navbar).
  const homeScrollRef = useRef<HTMLDivElement>(null);

  // +1 drilling deeper (configure → hangman-config), −1 coming back.
  const [configDirection, setConfigDirection] = useState(1);
  const [sliding, setSliding] = useState(false);
  const reduceMotionHook = useReducedMotion();

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-base-300 text-base-content">
      {route === "home" ? (
        // Home: navbar floats over the hero photo (transparent → glass on
        // scroll); the scroll container owns the full height.
        <div className="flex-1 min-h-0 relative">
          <Navbar onHome={() => setRoute("home")} overlay scrollTarget={homeScrollRef} />
          <div ref={homeScrollRef} className="h-full overflow-y-auto scrollbar-hidden">
            <Main
              onStart={(modeId) => {
                // Home card carries mode intent forward so GameOptions
                // preselects the tapped tile (fixes 02-mode-preselect).
                setMode(modeId);
                setRoute("options");
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <Navbar onHome={() => setRoute("home")} />
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* Slideshow push between the two config pages only; arrivals
                from home/play snap (initial/exit disabled unless sliding). */}
            {(route === "options" || route === "hangman-config") && (
              <AnimatePresence
                initial={false}
                custom={configDirection}
              >
              <MotionDiv
                key={route}
                custom={configDirection}
                variants={slideVariants}
                initial={sliding ? "enter" : false}
                animate="center"
                exit={sliding ? "exit" : false}
                onAnimationComplete={() => setSliding(false)}
                transition={
                  reduceMotionHook
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
                }
                className="absolute inset-0"
              >
                {route === "options" ? (
                  <GameOptions
                    initialMode={mode ?? undefined}
                    onBack={() => setRoute("home")}
                    onConfirm={(selected, next) => {
                      // GameOptions owns the canonical settings object (persisted
                      // durably there); App just mirrors it for prop passing.
                      setMode(selected);
                      if (next) setGameSettings(next);
                      setRoute("play");
                    }}
                    onOpenHangmanConfig={() => {
                      setConfigDirection(1);
                      setSliding(true);
                      setRoute("hangman-config");
                    }}
                  />
                ) : (
                  <HangmanConfig
                    settings={gameSettings}
                    onChange={setGameSettings}
                    onBack={() => {
                      setConfigDirection(-1);
                      setSliding(true);
                      setRoute("options");
                    }}
                    onPlay={() => {
                      setMode("hangman");
                      setRoute("play");
                    }}
                  />
                )}
              </MotionDiv>
              </AnimatePresence>
            )}

        {route === "play" && mode === "multiple-choice" && (
          <MultiChoice
            onBack={() => setRoute("options")}
            onHome={() => setRoute("home")}
            settings={gameSettings}
          />
        )}

        {route === "play" && mode === "hangman" && (
          <Hangman
            onBack={() => setRoute("options")}
            onHome={() => setRoute("home")}
            settings={gameSettings}
          />
        )}

        {route === "play" && mode === "open-answer" && (
          <OpenAnswer
            onBack={() => setRoute("options")}
            onHome={() => setRoute("home")}
            settings={gameSettings}
          />
        )}

        {route === "play" &&
          mode !== "multiple-choice" &&
          mode !== "hangman" &&
          mode !== "open-answer" && (
            <div className="h-full w-full flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-2">Ready to play</h2>
                <p className="mb-4">Selected mode: {mode}</p>
                <p className="opacity-70">Game implementation coming soon.</p>
                <div className="mt-6 flex justify-center">
                  <button className="btn" onClick={() => setRoute("options")}>
                    Change Mode
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
