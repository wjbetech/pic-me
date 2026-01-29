import type { Animal } from "../../types/Animal";
import type { GameState } from "../../types/Hangman";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Keyboard({
  guessedLetters,
  wrongLetters,
  onGuess,
  currentAnimal,
  gameState,
}: {
  guessedLetters: Set<string>;
  wrongLetters: Set<string>;
  onGuess: (letter: string) => void;
  currentAnimal: Animal | null;
  gameState: GameState;
}) {
  const rows: string[][] = [
    ALPHABET.slice(0, 9),
    ALPHABET.slice(9, 18),
    ALPHABET.slice(18, 26),
  ];
  const maxCols = Math.max(...rows.map((row) => row.length));
  const rowStyle = {
    "--key-cols": maxCols,
    "--key-gap": "0.5rem",
    gap: "var(--key-gap)",
  } as React.CSSProperties;

  return (
    <div className="flex flex-col items-center gap-2 max-w-full mx-auto w-full px-3 sm:px-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex w-full max-w-md mx-auto justify-center px-1 sm:px-2"
          style={rowStyle}
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
                style={{
                  width:
                    "calc((100% - (var(--key-cols) - 1) * var(--key-gap)) / var(--key-cols))",
                }}
                className={`inline-flex h-10 sm:h-12 md:h-12 lg:h-10 cursor-pointer items-center justify-center rounded-md font-semibold leading-none border-2 text-sm sm:text-base lg:text-sm ${keyBorderClass} ${
                  showAsWrong
                    ? "bg-error text-error-content"
                    : showAsCorrect
                      ? "bg-success text-success-content"
                      : "bg-transparent text-base-content"
                }`}
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
