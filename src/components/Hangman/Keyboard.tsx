import type { Animal } from "../../types/Animal";
import type { GameState } from "../../types/Hangman";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Keyboard({
  guessedLetters,
  wrongLetters,
  keyDims,
  onGuess,
  currentAnimal,
  gameState,
}: {
  guessedLetters: Set<string>;
  wrongLetters: Set<string>;
  keyDims: { width: number; height: number };
  onGuess: (letter: string) => void;
  currentAnimal: Animal | null;
  gameState: GameState;
}) {
  const rows: string[][] = [
    ALPHABET.slice(0, 10),
    ALPHABET.slice(10, 19),
    ALPHABET.slice(19, 26),
  ];

  return (
    <div className="flex flex-col items-center gap-1 max-w-full mx-auto w-full px-3 sm:px-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`flex justify-center gap-2 w-full flex-nowrap sm:px-4`}
        >
          {row.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isWrong = wrongLetters.has(letter);
            const appearsInName = currentAnimal
              ? currentAnimal.commonName.toUpperCase().includes(letter)
              : false;

            const showAsWrong =
              isWrong || (gameState !== "playing" && !appearsInName);
            const showAsCorrect =
              isGuessed || (gameState !== "playing" && appearsInName);

            const keyBorderClass = "border-1 border-base-content/20";

            return (
              <button
                key={letter}
                onClick={() => onGuess(letter)}
                className={`inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-semibold leading-none border-2 ${keyBorderClass} ${
                  showAsWrong
                    ? "bg-error text-error-content"
                    : showAsCorrect
                      ? "bg-success text-success-content"
                      : "bg-transparent text-base-content"
                }`}
                style={{
                  minWidth: 0,
                  width: keyDims.width,
                  height: keyDims.height,
                  padding: 0,
                  margin: 0,
                  fontSize: Math.max(12, Math.round(keyDims.width * 0.45)),
                  lineHeight: `${keyDims.height}px`,
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
