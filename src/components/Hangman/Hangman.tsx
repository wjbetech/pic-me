import { useState, useEffect, useRef } from "react";
import type { Animal } from "../../types/Animal";

interface HangmanSettings {
  lives?: number;
  rounds?: number | "all";
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Hangman({
  onBack,
  settings = { lives: 6 },
}: {
  onBack?: () => void;
  settings?: HangmanSettings;
}) {
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongLetters, setWrongLetters] = useState<Set<string>>(new Set());
  const [livesRemaining, setLivesRemaining] = useState(settings.lives ?? 6);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">(
    "playing"
  );

  const animalQueueRef = useRef<Animal[]>([]);
  const queueIndexRef = useRef(0);

  // Load all animals from JSON files
  useEffect(() => {
    const loadAllData = async () => {
      // @ts-expect-error - import.meta.glob types may not be declared
      const modules = import.meta.glob("../../data/*.json", { as: "json" });
      const loaders = Object.values(modules) as Array<() => Promise<Animal[]>>;
      try {
        const results = await Promise.all(loaders.map((fn) => fn()));
        const combined: Animal[] = results.flatMap((r) => {
          if (Array.isArray(r)) return r as Animal[];
          if (
            r &&
            typeof r === "object" &&
            Array.isArray((r as Record<string, unknown>).default)
          )
            return (r as Record<string, unknown>).default as Animal[];
          return [] as Animal[];
        });

        // Shuffle the animals
        const shuffled = combined.sort(() => Math.random() - 0.5);
        setAllAnimals(shuffled);
        animalQueueRef.current = shuffled;
        console.log(`Loaded ${shuffled.length} animals for Hangman`);

        // Load first animal
        loadNewAnimal(shuffled);
      } catch (err) {
        console.error("Failed to load animal data:", err);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNewAnimal = (animals?: Animal[]) => {
    const source = animals ?? allAnimals;
    if (!source || source.length === 0) {
      setTimeout(() => loadNewAnimal(), 200);
      return;
    }

    // Get next animal from queue
    const idx = queueIndexRef.current % source.length;
    const nextAnimal = source[idx];
    queueIndexRef.current = idx + 1;

    setCurrentAnimal(nextAnimal);
    setGuessedLetters(new Set());
    setWrongLetters(new Set());
    setLivesRemaining(settings.lives ?? 6);
    setGameState("playing");
    setRoundsPlayed((p) => p + 1);
  };

  const handleLetterGuess = (letter: string) => {
    if (gameState !== "playing" || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    const animalName = currentAnimal?.commonName.toUpperCase() ?? "";

    if (!animalName.includes(letter)) {
      // Wrong guess
      const newWrong = new Set(wrongLetters);
      newWrong.add(letter);
      setWrongLetters(newWrong);

      const newLives = livesRemaining - 1;
      setLivesRemaining(newLives);

      if (newLives === 0) {
        setGameState("lost");
      }
    } else {
      // Check if word is complete
      const allLetters = animalName.split("").filter((c) => /[A-Z]/.test(c));
      const allGuessed = allLetters.every((c) => newGuessed.has(c));

      if (allGuessed) {
        setGameState("won");
        setScore((s) => s + 1);
      }
    }
  };

  const handleNextRound = () => {
    loadNewAnimal();
  };

  const renderLetterBoxes = () => {
    if (!currentAnimal) return null;

    const name = currentAnimal.commonName.toUpperCase();

    return (
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {name.split("").map((char, idx) => {
          const isLetter = /[A-Z]/.test(char);
          const isGuessed = guessedLetters.has(char);
          const shouldShow = !isLetter || isGuessed || gameState !== "playing";

          return (
            <div
              key={idx}
              className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center border-2 rounded text-xl md:text-2xl font-bold ${
                isLetter
                  ? shouldShow
                    ? "bg-base-100 border-primary text-primary"
                    : "bg-base-200 border-base-300"
                  : "border-transparent"
              }`}
            >
              {shouldShow ? char : ""}
            </div>
          );
        })}
      </div>
    );
  };

  const renderKeyboard = () => {
    return (
      <div className="grid grid-cols-7 gap-2 max-w-xl mx-auto">
        {ALPHABET.map((letter) => {
          const isGuessed = guessedLetters.has(letter);
          const isWrong = wrongLetters.has(letter);

          return (
            <button
              key={letter}
              onClick={() => handleLetterGuess(letter)}
              disabled={isGuessed || gameState !== "playing"}
              className={`btn btn-sm md:btn-md ${
                isWrong
                  ? "btn-error text-error-content"
                  : isGuessed
                  ? "btn-success text-success-content"
                  : "btn-outline"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Hangman</h2>
          <div className="flex justify-center gap-6 text-lg">
            <p className="font-semibold">
              Lives: <span className="text-error">{livesRemaining}</span>
            </p>
            <p className="font-semibold">
              Score: <span className="text-success">{score}</span>
            </p>
            <p className="font-semibold opacity-70">Round: {roundsPlayed}</p>
          </div>
        </div>

        {/* Animal Image */}
        {currentAnimal && currentAnimal.images && currentAnimal.images[0] && (
          <div className="flex justify-center">
            <img
              src={currentAnimal.images[0].url}
              alt="Animal"
              className="w-64 h-48 md:w-80 md:h-60 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Hint */}
        {currentAnimal && (
          <p className="text-center opacity-60 text-sm">
            Hint: Lives in {currentAnimal.habitat.join(", ")}
          </p>
        )}

        {/* Letter Boxes */}
        {renderLetterBoxes()}

        {/* Game State Messages */}
        {gameState === "won" && (
          <div className="text-center">
            <p className="text-2xl font-bold text-success mb-4">
              🎉 Correct! It's {currentAnimal?.commonName}!
            </p>
            <button onClick={handleNextRound} className="btn btn-success">
              Next Animal
            </button>
          </div>
        )}

        {gameState === "lost" && (
          <div className="text-center">
            <p className="text-2xl font-bold text-error mb-4">
              💀 Game Over! The answer was {currentAnimal?.commonName}
            </p>
            <button onClick={handleNextRound} className="btn btn-error">
              Try Another
            </button>
          </div>
        )}

        {/* Keyboard */}
        {gameState === "playing" && renderKeyboard()}

        {/* Back Button */}
        <div className="flex justify-center mt-4">
          <button className="btn btn-ghost" onClick={() => onBack && onBack()}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
