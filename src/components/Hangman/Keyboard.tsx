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
                className={`inline-flex cursor-pointer items-center justify-center rounded-md font-semibold leading-none border-2 w-10 h-14 max-w-7.5 md:max-w-8.5 lg:max-w-10${keyBorderClass} ${
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
