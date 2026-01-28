import BackButton from "../BackButton/BackButton";
import type { Animal } from "../../types/Animal";
import type { GameState } from "../../types/Hangman";
import type { MutableRefObject } from "react";

export default function GameMessages({
  gameState,
  wonAnimalName,
  allRoundsCompleted,
  score,
  currentAnimal,
  nextButtonRef,
  onNext,
  onBack,
}: {
  gameState: GameState;
  wonAnimalName: string | null;
  allRoundsCompleted: boolean;
  score: number;
  currentAnimal: Animal | null;
  nextButtonRef: MutableRefObject<HTMLButtonElement | null>;
  onNext: () => void;
  onBack?: () => void;
}) {
  return (
    <>
      <div
        className={`text-center overflow-hidden transition-[opacity,transform,max-height] duration-300 ease-out p-0 ${
          gameState === "won"
            ? "opacity-100 translate-y-0 max-h-56 p-3 sm:p-4"
            : "opacity-0 -translate-y-2 max-h-0 pointer-events-none"
        }`}
        aria-hidden={gameState !== "won"}
      >
        <p className="text-2xl font-bold text-success mb-4">
          🎉 Correct! It's {wonAnimalName ?? ""}!
        </p>
        <div className="inline-block rounded-lg bg-transparent ring-2 ring-primary ring-offset-2 ring-glow">
          <button
            ref={nextButtonRef}
            onClick={onNext}
            className={`btn btn-success`}
          >
            Next Animal
          </button>
        </div>
      </div>

      {gameState === "lost" && (
        <div className="text-center">
          <p className="text-2xl font-bold text-error mb-4">
            💀 Game Over! The answer was {currentAnimal?.commonName}
          </p>
          <div className="inline-block rounded-lg bg-transparent ring-2 ring-primary ring-offset-2 ring-glow">
            <button onClick={onNext} className="btn btn-error">
              Try Again
            </button>
          </div>
        </div>
      )}

      {allRoundsCompleted && (
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">All rounds completed!</p>
          <p className="mb-4">
            Final score: <span className="font-semibold">{score}</span>
          </p>
          <div className="flex justify-center gap-3">
            <BackButton
              label="Back to Menu"
              onBack={() => {
                try {
                  localStorage.removeItem("picme-hangman-state-v1");
                } catch {}
                if (onBack) onBack();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
