import { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import GameOptions from "./components/GameOptions/GameOptions";
import MultiChoice from "./components/MultiChoice/MultiChoice";
import Hangman from "./components/Hangman/Hangman";
import OpenAnswer from "./components/OpenAnswer/OpenAnswer";
import { persistence } from "./game-core/persistence";
import type { Settings } from "./types/GameOptions";

type Route = "home" | "options" | "play";

interface NavigationState {
  route: Route;
  mode: string | null;
}

const DEFAULT_SETTINGS: Settings = { blur: 0, showDescription: false };
const VALID_ROUTES: readonly Route[] = ["home", "options", "play"];

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

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-base-300 text-base-content">
      <Navbar onHome={() => setRoute("home")} />
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {route === "home" && <Main onStart={() => setRoute("options")} />}
        {route === "options" && (
          <GameOptions
            onBack={() => setRoute("home")}
            onConfirm={(selected, next) => {
              // GameOptions owns the canonical settings object (persisted
              // durably there); App just mirrors it for prop passing.
              setMode(selected);
              if (next) setGameSettings(next);
              setRoute("play");
            }}
          />
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
    </div>
  );
}

export default App;
