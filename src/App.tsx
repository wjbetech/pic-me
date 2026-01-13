import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import GameOptions from "./components/GameOptions/GameOptions";

type Route = "home" | "options" | "play";

function App() {
  const [route, setRoute] = useState<Route>("home");
  const [mode, setMode] = useState<string | null>(null);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-base-300 text-base-content">
      <Navbar />
      <div className="flex-1 overflow-hidden relative">
        {route === "home" && <Main onStart={() => setRoute("options")} />}
        {route === "options" && (
          <GameOptions
            onBack={() => setRoute("home")}
            onConfirm={(selected) => {
              setMode(selected);
              setRoute("play");
            }}
          />
        )}

        {route === "play" && (
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
