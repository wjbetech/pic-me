import type { Animal } from "../../types/Animal";
import computeLetterBoxDimensions from "../../utils/letterBox";
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

  const longest = Math.max(
    1,
    ...words.map((w) => w.replace(/[^A-Z]/g, "").length),
  );

  const { boxWidth, boxHeight, fontSize } = computeLetterBoxDimensions(longest);

  return (
    <div className="flex flex-col gap-2 mb-8 items-center">
      {words.map((word, wi) => (
        <div key={wi} className="flex gap-2 justify-center">
          {word.split("").map((char, idx) => {
            const isLetter = /[A-Z]/.test(char);
            const isGuessed = guessedLetters.has(char);
            const shouldShow =
              !isLetter || isGuessed || gameState !== "playing";

            let boxClasses = "";
            if (isLetter) {
              boxClasses = shouldShow
                ? "bg-base-100 text-primary"
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
                style={{
                  width: `${boxWidth}px`,
                  height: `${boxHeight}px`,
                  fontSize: `${fontSize}px`,
                  lineHeight: `${boxHeight}px`,
                }}
                className={`flex items-center justify-center border-2 rounded font-bold ${boxClasses} ${borderClass}`}
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
