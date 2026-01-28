import { useState, useEffect, useRef, useCallback } from "react";
import BackButton from "../BackButton/BackButton";
import ConfirmBackModal from "../ConfirmBackModal/ConfirmBackModal";
import type { Animal } from "../../types/Animal";
import type { HangmanSettings, GameState } from "../../types/Hangman";
import LetterBoxes from "./LetterBoxes";
import Keyboard from "./Keyboard";
import Header from "./Header";
import GameMessages from "./GameMessages";
import AnimalImage from "./AnimalImage";

// local storage key for Hangman progress/settings (versioned)
const STORAGE_KEY = "picme-hangman-state-v1";

export default function Hangman({
  onBack,
  onHome,
  settings = { lives: 6 },
}: {
  onBack?: () => void;
  onHome?: () => void;
  settings?: HangmanSettings;
}) {
  const [showBackModal, setShowBackModal] = useState(false);
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [wonAnimalName, setWonAnimalName] = useState<string | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongLetters, setWrongLetters] = useState<Set<string>>(new Set());
  const [livesRemaining, setLivesRemaining] = useState(settings.lives ?? 6);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");

  const [roundsTotal, setRoundsTotal] = useState<number | "all" | undefined>(
    settings.rounds ?? "all",
  );
  const [allRoundsCompleted, setAllRoundsCompleted] = useState(false);

  const animalQueueRef = useRef<Animal[]>([]);
  const queueIndexRef = useRef(0);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextRoundTimeoutRef = useRef<number | null>(null);
  const [keyDims, setKeyDims] = useState<{ width: number; height: number }>({
    width: 30,
    height: 36,
  });

  // Update keyboard key dimensions responsively based on viewport width
  useEffect(() => {
    const computeKeyDims = () => {
      const viewport = typeof window !== "undefined" ? window.innerWidth : 640;
      const maxContainer = Math.min(viewport, 1024);
      const reserved = 64; // padding/margins
      const gapPx = 6; // gap-1 ~ 4-6px
      const numKeys = 10; // largest row length

      const available = Math.max(200, maxContainer - reserved);
      const proposed = Math.floor(
        (available - (numKeys - 1) * gapPx) / numKeys,
      );

      const width = Math.max(22, Math.min(52, proposed));
      const height = Math.max(28, Math.round(width * 1.2));

      setKeyDims({ width, height });
    };

    computeKeyDims();
    window.addEventListener("resize", computeKeyDims);
    return () => window.removeEventListener("resize", computeKeyDims);
  }, []);

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
        console.log(`Loaded ${shuffled.length} animals for Hangman`);

        // Attempt to restore saved state so reloads preserve progress
        let didRestore = false;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
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
            const savedGameState =
              parsed.gameState === "won" ||
              parsed.gameState === "lost" ||
              parsed.gameState === "playing"
                ? (parsed.gameState as "won" | "lost" | "playing")
                : "playing";

            // Prefer restoring the full saved animal object if present
            const savedAnimal = parsed.currentAnimal as Animal | undefined;
            if (savedAnimal) {
              console.log("Restoring saved animal:", savedAnimal.commonName);

              // Ensure the saved animal exists in the shuffled list; if not, put it at the front.
              let foundIndex = shuffled.findIndex(
                (a) => a.commonName === savedAnimal.commonName,
              );
              if (foundIndex < 0) {
                shuffled.unshift(savedAnimal);
                foundIndex = 0;
                console.log(
                  "Saved animal not in shuffled list, added at front",
                );
              }

              // Update refs and state with modified shuffled array
              setAllAnimals(shuffled);
              animalQueueRef.current = shuffled;

              const found = shuffled[foundIndex];
              setCurrentAnimal(found);
              setWonAnimalName(
                savedGameState === "won" ? found.commonName : null,
              );
              setGuessedLetters(
                new Set((savedGuessed || []).map((s) => s.toUpperCase())),
              );
              setWrongLetters(
                new Set((savedWrong || []).map((s) => s.toUpperCase())),
              );
              setLivesRemaining(savedLives);
              setScore(savedScore);
              setGameState(savedGameState);
              if (typeof savedRoundsPlayed === "number")
                setRoundsPlayed(savedRoundsPlayed);
              setRoundsTotal(savedRoundsTotal as number | "all" | undefined);
              setAllRoundsCompleted(savedAllCompleted);
              queueIndexRef.current = (foundIndex + 1) % shuffled.length;

              didRestore = true;
              console.log("Successfully restored game state:", savedGameState);
            }
          }
        } catch (err) {
          console.warn("Failed to restore Hangman state:", err);
        }

        // Only initialize first animal if we didn't restore saved state
        if (!didRestore) {
          setAllAnimals(shuffled);

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
            console.log("Started new game with:", first.commonName);
          }
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
    } catch (error) {
      console.debug("Failed to read persisted Hangman data:", error);
    }
  }, []);

  const loadNewAnimal = useCallback(
    (animals?: Animal[]) => {
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

      setGameState("playing");
      setCurrentAnimal(nextAnimal);
      setGuessedLetters(new Set());
      setWrongLetters(new Set());
      setLivesRemaining(settings.lives ?? 6);
      setRoundsPlayed((p) => p + 1);
    },
    [allAnimals, roundsTotal, roundsPlayed, settings.lives],
  );

  const handleLetterGuess = useCallback(
    (letter: string) => {
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
          setWonAnimalName(currentAnimal?.commonName ?? null);
          setGameState("won");
          setScore((s) => s + 1);
        }
      }
    },
    [gameState, guessedLetters, wrongLetters, livesRemaining, currentAnimal],
  );

  const handleNextRound = useCallback(() => {
    if (nextRoundTimeoutRef.current) {
      window.clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }

    setGameState("transition");
    nextRoundTimeoutRef.current = window.setTimeout(() => {
      loadNewAnimal();
      nextRoundTimeoutRef.current = null;
    }, 180);
  }, [loadNewAnimal]);

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
  }, [gameState, handleNextRound]);

  // Cleanup any pending next-round timer on unmount
  useEffect(() => {
    return () => {
      if (nextRoundTimeoutRef.current) {
        window.clearTimeout(nextRoundTimeoutRef.current);
        nextRoundTimeoutRef.current = null;
      }
    };
  }, []);

  // Keep the won animal name stable while the win message animates out
  useEffect(() => {
    if (gameState === "won" && currentAnimal && !wonAnimalName) {
      setWonAnimalName(currentAnimal.commonName);
      return;
    }

    if (gameState !== "won" && wonAnimalName) {
      const timeout = window.setTimeout(() => {
        setWonAnimalName(null);
      }, 320);

      return () => window.clearTimeout(timeout);
    }
  }, [gameState, currentAnimal, wonAnimalName]);

  // Focus the Next button when round is won
  useEffect(() => {
    if (gameState === "won" && nextButtonRef.current) {
      try {
        nextButtonRef.current.focus();
      } catch (error) {
        console.debug("Failed to focus next button:", error);
      }
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
    // Don't persist until we have a current animal loaded
    if (!currentAnimal) return;

    try {
      const toSave = {
        // Save full current animal object when available to ensure
        // exact restoration across reloads (avoids mismatches from shuffling).
        currentAnimal: currentAnimal,
        currentCommonName: currentAnimal.commonName,
        queueIndex: queueIndexRef.current,
        guessed: Array.from(guessedLetters),
        wrong: Array.from(wrongLetters),
        livesRemaining,
        score,
        roundsPlayed,
        roundsTotal,
        allRoundsCompleted,
        gameState,
      } as const;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      console.log(
        "Persisted game state:",
        currentAnimal.commonName,
        "guessed:",
        guessedLetters.size,
        "wrong:",
        wrongLetters.size,
      );
    } catch (err) {
      console.error("Failed to persist state:", err);
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
    gameState,
  ]);

  // render helpers moved to separate components in ./

  return (
    <div className="h-full w-full flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        <Header lives={livesRemaining} score={score} round={roundsPlayed} />

        <AnimalImage animal={currentAnimal} />

        {currentAnimal && (
          <p className="text-center opacity-60 text-sm">
            Hint: Lives in {currentAnimal.habitat.join(", ")}
          </p>
        )}

        <LetterBoxes
          currentAnimal={currentAnimal}
          guessedLetters={guessedLetters}
          gameState={gameState}
        />

        <GameMessages
          gameState={gameState}
          wonAnimalName={wonAnimalName}
          allRoundsCompleted={allRoundsCompleted}
          score={score}
          currentAnimal={currentAnimal}
          nextButtonRef={nextButtonRef}
          onNext={handleNextRound}
          onBack={onBack}
        />

        {/* Keyboard */}
        {gameState === "playing" && (
          <Keyboard
            guessedLetters={guessedLetters}
            wrongLetters={wrongLetters}
            keyDims={keyDims}
            onGuess={handleLetterGuess}
            currentAnimal={currentAnimal}
            gameState={gameState}
          />
        )}

        {/* Back Button */}
        {!allRoundsCompleted && (
          <div className="flex justify-center mt-4">
            <div>
              <BackButton
                label="Back to Menu"
                className="btn-ghost"
                onBack={() => setShowBackModal(true)}
              />

              <ConfirmBackModal
                isOpen={showBackModal}
                onClose={() => setShowBackModal(false)}
                onHome={() => {
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch (error) {
                    console.debug("Failed to clear Hangman storage:", error);
                  }
                  if (onHome) onHome();
                  else if (onBack) onBack();
                }}
                onSettings={() => {
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch (error) {
                    console.debug("Failed to clear Hangman storage:", error);
                  }
                  if (onBack) onBack();
                }}
                title="Leave this game?"
                description="You can return to Hangman settings or go back to the home page."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
