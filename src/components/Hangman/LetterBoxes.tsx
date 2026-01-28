import type { Animal } from "../../types/Animal";
import type { GameState } from "../../types/Hangman";

export default function LetterBoxes({
  currentAnimal,
  guessedLetters,
  gameState,
}: {
  currentAnimal: Animal | null;
  guessedLetters: Set<string>;
  gameState: GameState;
}) {
  if (!currentAnimal) return null;

  const raw = currentAnimal.commonName.toUpperCase();
  const words = raw.split(/\s+/).filter((w) => w.length > 0);

  return (
    <div className="flex flex-col gap-2 items-center">
      {words.map((word, wi) => (
        <div key={wi} className="flex gap-2 justify-center max-w-[99%]">
          {word.split("").map((char, idx) => {
            const isLetter = /[A-Z]/.test(char);
            const isGuessed = guessedLetters.has(char);
            const shouldShow =
              !isLetter || isGuessed || gameState !== "playing";

            let boxClasses = "";
            if (isLetter) {
              boxClasses = shouldShow
                ? "bg-success text-success-content"
                : "bg-base-200";
            } else {
              boxClasses = "bg-transparent";
            }

            const borderClass = isLetter
              ? "border-base-content/20"
              : "border-transparent";

            return (
              <div
                key={idx}
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border-2 rounded font-bold text-lg ${boxClasses} ${borderClass}`}
              >
                {shouldShow ? char : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
