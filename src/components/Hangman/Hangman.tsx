import { useState, useEffect, useRef } from "react";
import type { Animal } from "../../types/Animal";

interface HangmanSettings {
  lives?: number;
  rounds?: number | "all";
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// local storage key for Hangman progress/settings (versioned)
const STORAGE_KEY = "picme-hangman-state-v1";

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
    "playing",
  );

  const [roundsTotal, setRoundsTotal] = useState<number | "all" | undefined>(
    settings.rounds ?? "all",
  );
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const animalQueueRef = useRef<Animal[]>([]);
  const queueIndexRef = useRef(0);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  // Load all animals from JSON files
  useEffect(() => {
    const loadAllData = async () => {
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

        // Attempt to restore saved state so reloads preserve progress
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const savedName = parsed.currentCommonName as string | undefined;
            const savedGuessed = Array.isArray(parsed.guessed)
              ? (parsed.guessed as string[])
              : [];
            const savedWrong = Array.isArray(parsed.wrong)
              ? (parsed.wrong as string[])
              : [];
            const savedLives =
              typeof parsed.livesRemaining === "number"
                ? parsed.livesRemaining
                : (settings.lives ?? 6);
            const savedScore =
              typeof parsed.score === "number" ? parsed.score : 0;
            const savedRoundsPlayed =
              typeof parsed.roundsPlayed === "number"
                ? parsed.roundsPlayed
                : undefined;
            const savedRoundsTotal =
              parsed.roundsTotal ?? settings.rounds ?? "all";
            const savedAllCompleted = Boolean(parsed.allRoundsCompleted);

            const foundIndex = savedName
              ? shuffled.findIndex((a) => a.commonName === savedName)
              : -1;
            if (foundIndex >= 0) {
              const found = shuffled[foundIndex];
              setCurrentAnimal(found);
              setGuessedLetters(
                new Set((savedGuessed || []).map((s) => s.toUpperCase())),
              );
              setWrongLetters(
                new Set((savedWrong || []).map((s) => s.toUpperCase())),
              );
              setLivesRemaining(savedLives);
              setScore(savedScore);
              if (typeof savedRoundsPlayed === "number")
                setRoundsPlayed(savedRoundsPlayed);
              setRoundsTotal(savedRoundsTotal as number | "all" | undefined);
              setAllRoundsCompleted(savedAllCompleted);
              queueIndexRef.current = (foundIndex + 1) % shuffled.length;
              // restored — skip default initialization below
              return;
            }
          }
        } catch (err) {
          console.warn("Failed to restore Hangman state:", err);
        }

        // Initialize first animal directly (avoid calling loadNewAnimal() here
        // to prevent duplicate increments in dev StrictMode). This sets up
        // the queue index and rounds counter deterministically.
        if (shuffled.length > 0) {
          queueIndexRef.current = 1; // next index to use
          const first = shuffled[0];
          setCurrentAnimal(first);
          setGuessedLetters(new Set());
          setWrongLetters(new Set());
          setLivesRemaining(settings.lives ?? 6);
          setGameState("playing");
          setRoundsPlayed(1);
          const roundsSetting = settings.rounds ?? "all";
          setRoundsTotal(roundsSetting);
        }
      } catch (err) {
        console.error("Failed to load animal data:", err);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Read any persisted Hangman data (keeps STORAGE_KEY referenced so TS doesn't warn)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // For now, just log persisted data; future work can restore state from this.
        console.debug("Loaded persisted Hangman data:", saved);
      }
    } catch (err) {
      /* ignore */
    }
  }, []);

  const loadNewAnimal = (animals?: Animal[]) => {
    const source = animals ?? allAnimals;
    if (!source || source.length === 0) {
      setTimeout(() => loadNewAnimal(), 200);
      return;
    }

    // If rounds is a number and we've already completed the requested rounds, stop here
    if (
      roundsTotal !== "all" &&
      typeof roundsTotal === "number" &&
      roundsPlayed >= roundsTotal
    ) {
      setAllRoundsCompleted(true);
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

  // Allow pressing Enter to advance when the round is won
  useEffect(() => {
    const onEnter = (e: KeyboardEvent) => {
      if (gameState === "won" && (e.key === "Enter" || e.key === "Return")) {
        e.preventDefault();
        handleNextRound();
      }
    };
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [gameState]);

  // Focus the Next button when round is won
  useEffect(() => {
    if (gameState === "won" && nextButtonRef.current) {
      try {
        nextButtonRef.current.focus();
      } catch {}
    }
  }, [gameState]);

  // Keyboard input: allow players to type letters to guess
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if game is not playing or modifier keys are pressed
      if (gameState !== "playing") return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        // Prevent unintended scrolling or other side-effects
        e.preventDefault();
        handleLetterGuess(key);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, handleLetterGuess]);

  // Persist relevant game state so reloads don't lose progress
  useEffect(() => {
    try {
      const toSave = {
        currentCommonName: currentAnimal?.commonName,
        queueIndex: queueIndexRef.current,
        guessed: Array.from(guessedLetters),
        wrong: Array.from(wrongLetters),
        livesRemaining,
        score,
        roundsPlayed,
        roundsTotal,
        allRoundsCompleted,
      } as const;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      /* ignore storage errors */
    }
  }, [
    currentAnimal,
    guessedLetters,
    wrongLetters,
    livesRemaining,
    score,
    roundsPlayed,
    roundsTotal,
    allRoundsCompleted,
  ]);

  const renderLetterBoxes = () => {
    if (!currentAnimal) return null;

    // Split the common name into words so multi-word names render on separate lines
    const raw = currentAnimal.commonName.toUpperCase();
    const words = raw.split(/\s+/).filter((w) => w.length > 0);

    // Determine longest word length (letters only) to scale box sizes
    const longest = Math.max(
      1,
      ...words.map((w) => w.replace(/[^A-Z]/g, "").length),
    );

    // Compute a reasonable box width (px) based on the longest word, clamped.
    // Use a slightly larger base divisor and max so medium-long single words
    // don't end up too small.
    const boxWidth = Math.min(
      64,
      Math.max(32, Math.floor(480 / Math.max(6, longest))),
    );
    const boxHeight = Math.round(boxWidth * 0.9);
    const fontSize = Math.max(14, Math.round(boxWidth * 0.36));

    return (
      <div className="flex flex-col gap-2 mb-8 items-center">
        {words.map((word, wi) => (
          <div key={wi} className="flex gap-2 justify-center">
            {word.split("").map((char, idx) => {
              const isLetter = /[A-Z]/.test(char);
              const isGuessed = guessedLetters.has(char);
              const shouldShow =
                !isLetter || isGuessed || gameState !== "playing";

              const boxClasses = isLetter
                ? shouldShow
                  ? "bg-base-100 border-primary text-primary"
                  : "bg-base-200 border-base-300"
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
                  className={`flex items-center justify-center border-2 rounded font-bold ${boxClasses}`}
                >
                  {shouldShow ? char : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderKeyboard = () => {
    // Create three rows that mimic keyboard staggering while keeping
    // alphabetical order: 10, 9, 7 letters (A-J, K-S, T-Z).
    const rows: string[][] = [
      ALPHABET.slice(0, 10),
      ALPHABET.slice(10, 19),
      ALPHABET.slice(19, 26),
    ];

    return (
      <div className="flex flex-col items-center gap-2 max-w-xl mx-auto w-full">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex justify-center gap-2 w-full ${
              rowIndex === 1
                ? "pl-3 md:pl-6"
                : rowIndex === 2
                  ? "pl-6 md:pl-12"
                  : ""
            }`}
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

              return (
                <button
                  key={letter}
                  onClick={() => handleLetterGuess(letter)}
                  className={`btn btn-sm md:btn-md w-10 md:w-14 ${
                    showAsWrong
                      ? "btn-error text-error-content"
                      : showAsCorrect
                        ? "btn-success text-success-content"
                        : "btn-outline"
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
            <div className="inline-block rounded-lg bg-transparent ring-2 ring-primary ring-offset-2 ring-glow">
              <button
                ref={nextButtonRef}
                onClick={handleNextRound}
                disabled={allRoundsCompleted}
                aria-disabled={allRoundsCompleted}
                className={`btn btn-success ${allRoundsCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next Animal
              </button>
            </div>
          </div>
        )}

        {gameState === "lost" && (
          <div className="text-center">
            <p className="text-2xl font-bold text-error mb-4">
              💀 Game Over! The answer was {currentAnimal?.commonName}
            </p>
            <div className="inline-block rounded-lg bg-transparent ring-2 ring-primary ring-offset-2 ring-glow">
              <button onClick={handleNextRound} className="btn btn-error">
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
              <button
                className="btn"
                onClick={() => {
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch {}
                  onBack && onBack();
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        {gameState === "playing" && renderKeyboard()}

        {/* Back Button */}
        {!allRoundsCompleted && (
          <div className="flex justify-center mt-4">
            <button
              className="btn btn-ghost"
              onClick={() => {
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch {}
                onBack && onBack();
              }}
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
