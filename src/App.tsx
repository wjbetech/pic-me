import { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import GameOptions from "./components/GameOptions/GameOptions";
import MultiChoice from "./components/MultiChoice/MultiChoice";
import Hangman from "./components/Hangman/Hangman";

type Route = "home" | "options" | "play";

interface GameSettings {
  blur: number;
  showDescription: boolean;
  hintsEnabled?: boolean;
  hintType?: string;
  rounds?: number | "all";
  lives?: number;
}

const STORAGE_KEYS = {
  route: "pic-me:route",
  mode: "pic-me:mode",
  settings: "pic-me:settings",
};

function App() {
  const [route, setRoute] = useState<Route>(() => {
    const savedRoute = localStorage.getItem(STORAGE_KEYS.route);
    return (savedRoute as Route) || "home";
  });

  const [mode, setMode] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.mode);
  });

  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.settings);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { blur: 0, showDescription: false };
      }
    }
    return { blur: 0, showDescription: false };
  });

  // Persist route to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.route, route);
  }, [route]);

  // Persist mode to localStorage
  useEffect(() => {
    if (mode) {
      localStorage.setItem(STORAGE_KEYS.mode, mode);
    } else {
      localStorage.removeItem(STORAGE_KEYS.mode);
    }
  }, [mode]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(gameSettings));
  }, [gameSettings]);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-base-300 text-base-content">
      <Navbar />
      <div className="flex-1 overflow-hidden relative">
        {route === "home" && <Main onStart={() => setRoute("options")} />}
        {route === "options" && (
          <GameOptions
            onBack={() => setRoute("home")}
            onConfirm={(selected, settings) => {
              console.log("GameOptions onConfirm called:", selected, settings);
              setMode(selected);
              if (settings) {
                setGameSettings(settings);
              }
              setRoute("play");
            }}
          />
        )}

        {route === "play" && mode === "multiple-choice" && (
          <MultiChoice
            onBack={() => setRoute("options")}
            settings={gameSettings}
          />
        )}

        {route === "play" && mode === "hangman" && (
          <Hangman onBack={() => setRoute("options")} settings={gameSettings} />
        )}

        {route === "play" &&
          (() => {
            console.log(
              "Play route - mode:",
              mode,
              "gameSettings:",
              gameSettings
            );
            return null;
          })()}

        {route === "play" &&
          mode !== "multiple-choice" &&
          mode !== "hangman" && (
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
