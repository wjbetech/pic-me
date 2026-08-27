import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Animal } from "../../game-core/animal";
import "./MultiChoice.css";
import { MathRandom } from "../../game-core/random";
import { createRotation } from "../../game-core/rotation";
import { filterByDifficulty } from "../../game-core/difficulty";
import { isExhausted } from "../../game-core/rounds";
import { persistence } from "../../game-core/persistence";
import { useAnimals } from "../../hooks/useAnimals";
import type { Settings } from "../../types/GameOptions";
import AnswerGrid from "./AnswerGrid/AnswerGrid";
import DisplayCard from "./DisplayCard/DisplayCard";
import BackButton from "../BackButton/BackButton";
import ConfirmBackModal from "../ConfirmBackModal/ConfirmBackModal";

export default function MultiChoice({
  onBack,
  onHome,
  settings = { blur: 0, showDescription: false },
}: {
  onBack?: () => void;
  onHome?: () => void;
  settings?: Settings;
}) {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  // Single source of truth: the session rotation queue (no repeats until exhausted).
  const animalQueueRef = useRef<Animal[]>([]);
  // Mirror of the full dataset, used for answer-option sampling.
  const allAnimalsRef = useRef<Animal[]>([]);
  const queueIndexRef = useRef(0);
  // A numeric id that increments with each load request; used to ignore stale loads
  const loadRequestIdRef = useRef(0);
  // Store the timeout id so in-flight timeouts can be cancelled when a new load is requested
  const loadTimeoutRef = useRef<number | null>(null);

  // Dataset arrives via the shared loader (cached app-wide).
  const animals = useAnimals();

  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showBackModal, setShowBackModal] = useState(false);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  // rounds controls how many rounds to play: 'all' for a fixed shuffled queue, or a number
  // for a limited number of rounds where each round is sampled randomly from the full dataset.
  const [roundsTotal, setRoundsTotal] = useState<number | "all" | undefined>(
    undefined,
  );
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);

  const allRoundsCompleted = isExhausted(roundsTotal, roundsPlayed);

  // Helper: build up to 4 answer options (including correct) for a given animal
  const buildOptionsForAnimal = (
    target: Animal,
    animals: Animal[],
  ): { correct: string; options: string[] } => {
    const otherAnimals = animals.filter((a) => a.id !== target.id);
    const optionSet = new Set<string>();
    optionSet.add(target.commonName);

    const pool = [...otherAnimals];
    while (optionSet.size < 4 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool.splice(idx, 1)[0];
      if (picked && picked.commonName) optionSet.add(picked.commonName);
    }

    const fallback = animals.filter(
      (a) => a.id !== target.id && !optionSet.has(a.commonName),
    );
    while (optionSet.size < 4 && fallback.length > 0) {
      const idx = Math.floor(Math.random() * fallback.length);
      const picked = fallback.splice(idx, 1)[0];
      if (picked && picked.commonName) optionSet.add(picked.commonName);
    }

    const finalOptions = Array.from(optionSet);
    while (finalOptions.length < 4)
      finalOptions.push(finalOptions[0] ?? "Unknown");
    const shuffled = finalOptions.sort(() => Math.random() - 0.5);
    return { correct: target.commonName, options: shuffled };
  };

  // Build and apply answer options for a restored animal (best-effort).
  const applyOptions = (target: Animal, pool: Animal[]) => {
    try {
      const built = buildOptionsForAnimal(target, pool);
      setCorrectAnswer(built.correct);
      setAnswerOptions(built.options);
    } catch (e) {
      console.warn("Failed to build options for restored animal:", e);
    }
  };

  const loadNewAnimal = () => {
    const dataset = allAnimalsRef.current;
    if (!dataset || dataset.length === 0) {
      return;
    }
    // Reset animation state
    setSelectedAnswer(null);
    setIsAnswered(false);
    setDisabledOptions([]);

    // If rounds is a number and we've already completed the requested rounds, stop here
    if (isExhausted(roundsTotal, roundsPlayed)) {
      return;
    }
    // Increment the load request id and schedule the actual pick after the swipe delay.
    loadRequestIdRef.current += 1;
    const requestId = loadRequestIdRef.current;

    // Cancel any pending timeout for prior requests
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Schedule the pick
    loadTimeoutRef.current = window.setTimeout(() => {
      // clear stored timeout id
      loadTimeoutRef.current = null;

      // If this callback is stale (a newer request was started), ignore it
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      // Pick next animal from the shuffled rotation queue (no repeats until exhausted)
      const sourceQueue = animalQueueRef.current;
      if (!sourceQueue || sourceQueue.length === 0) {
        console.warn("No animals available in queue or source to pick from");
        return;
      }

      const idx = queueIndexRef.current ?? 0;
      const randomAnimal: Animal = sourceQueue[idx % sourceQueue.length];

      // advance index in the shared queue index so we don't repeat too soon
      queueIndexRef.current = (idx + 1) % sourceQueue.length;

      // Pick a random image from that animal if available
      let imageUrl = "";
      if (
        randomAnimal &&
        randomAnimal.images &&
        randomAnimal.images.length > 0
      ) {
        const randomImageObj =
          randomAnimal.images[
            Math.floor(Math.random() * randomAnimal.images.length)
          ];
        imageUrl = randomImageObj?.url || "";
      }

      if (imageUrl) {
        // Preload the image to avoid rendering lag and show a spinner.
        // Root cause (see .scratch/bugs/issues/01-mc-images.md): 20
        // `plus.unsplash.com/premium_photo` entries in the in-game dataset can
        // hang indefinitely (neither onload nor onerror fires), leaving the
        // spinner stuck. Homepage was decoupled to `homePhotos` in #40 but
        // games still draw from the full dataset — so every round must
        // guarantee termination to image or fallback within a bounded time.
        setIsImageLoading(true);
        const img = new Image();
        let settled = false;
        const imageTimeout = window.setTimeout(() => {
          if (settled) return;
          settled = true;
          console.warn("Image load timed out, picking another.", imageUrl);
          if (requestId !== loadRequestIdRef.current) return;
          setIsImageLoading(false);
          persistence.progress.save("multichoice.current", randomAnimal.id);
          if (animalQueueRef.current.length > 0) {
            animalQueueRef.current = animalQueueRef.current.filter(
              (a) => a.id !== randomAnimal.id,
            );
          }
          loadNewAnimal();
        }, 5000);
        img.onload = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(imageTimeout);
          // Ensure the request is still current before applying
          if (requestId !== loadRequestIdRef.current) {
            return;
          }
          setCurrentAnimal(randomAnimal);
          setCurrentImage(imageUrl);
          setCorrectAnswer(randomAnimal.commonName);
          setIsImageLoading(false);
          persistence.progress.save("multichoice.current", randomAnimal.id);
          // Count this loaded round (for numeric rounds)
          setRoundsPlayed((p) => p + 1);
        };
        img.onerror = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(imageTimeout);
          // Ensure the request is still current before reacting
          if (requestId !== loadRequestIdRef.current) {
            return;
          }
          console.warn("Failed to load image, picking another.", imageUrl);
          setIsImageLoading(false);
          persistence.progress.save("multichoice.current", randomAnimal.id);
          // If image fails, try next in queue (if any)
          // remove the failing animal from queue to avoid infinite loop
          if (animalQueueRef.current.length > 0) {
            animalQueueRef.current = animalQueueRef.current.filter(
              (a) => a.id !== randomAnimal.id,
            );
          }
          loadNewAnimal();
          return;
        };
        img.src = imageUrl;
      } else {
        // No image available for this animal: still select it so sampling covers all animals
        // Ensure request is still current
        if (requestId !== loadRequestIdRef.current) {
          return;
        }
        setCurrentAnimal(randomAnimal);
        setCurrentImage("");
        setCorrectAnswer(randomAnimal.commonName);
        setIsImageLoading(false);
        setRoundsPlayed((p) => p + 1);
      }

      // Generate up to 3 random different animal names (not the current one)
      const otherAnimals = dataset.filter((a) => a.id !== randomAnimal.id);

      // Use a set to ensure uniqueness and to be robust when the dataset is small
      const optionSet = new Set<string>();
      optionSet.add(randomAnimal.commonName);

      // Shuffle a copy of the other animals and take unique names
      const pool = [...otherAnimals];
      while (optionSet.size < 4 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        const picked = pool.splice(idx, 1)[0];
        if (picked && picked.commonName) {
          optionSet.add(picked.commonName);
        }
      }

      // Fallback: if still not enough options, sample from the full dataset (excluding current)
      const fallback = dataset.filter(
        (a) => a.id !== randomAnimal.id && !optionSet.has(a.commonName),
      );
      while (optionSet.size < 4 && fallback.length > 0) {
        const idx = Math.floor(Math.random() * fallback.length);
        const picked = fallback.splice(idx, 1)[0];
        if (picked && picked.commonName) optionSet.add(picked.commonName);
      }

      // As a last resort, duplicate entries so UI has four options
      const finalOptions = Array.from(optionSet);
      while (finalOptions.length < 4) {
        finalOptions.push(finalOptions[0] ?? "Unknown");
      }

      // Shuffle final options
      const shuffledOptions = finalOptions.sort(() => Math.random() - 0.5);

      setAnswerOptions(shuffledOptions);
      // finished loading; animation handled in child
    }, 300);
  };

  // Build rotation queue: create a shuffled queue with no repeats.
  // The roundsSetting parameter determines how many rounds to play (or "all" for unlimited).
  const buildQueue = (dataset: Animal[], roundsSetting?: number | "all") => {
    const q = createRotation(dataset, roundsSetting ?? "all", MathRandom);
    queueIndexRef.current = 0;
    animalQueueRef.current = q;
    setRoundsTotal(roundsSetting ?? "all");
    setRoundsPlayed(0);
  };

  // Reset the MultiChoice game state (used when leaving the game)
  const resetMultiChoice = () => {
    persistence.progress.clear("multichoice.current");
    // Reset visible state
    setCurrentAnimal(null);
    setCurrentImage("");
    setIsImageLoading(false);
    setAnswerOptions([]);
    setCorrectAnswer("");
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setRoundsPlayed(0);
    animalQueueRef.current = [];
    allAnimalsRef.current = [];
    queueIndexRef.current = 0;
    loadRequestIdRef.current = 0;
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  // Bootstrap when the dataset arrives: build the session queue, then restore
  // the persisted current animal or pick a fresh one. Stale-request guards
  // inside loadNewAnimal are preserved verbatim from the pre-core version.
  useEffect(() => {
    if (!animals) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;

      allAnimalsRef.current = animals;

      // Full shuffled dataset is authoritative for sampling and restores.
      // Pool is difficulty-filtered first (settings-v2): everything about a
      // round — target animal and distractors alike — stays in-pool.
      const pool = filterByDifficulty(animals, settings?.difficulty);
      const fullShuffled = createRotation(pool, "all", MathRandom);
      allAnimalsRef.current = fullShuffled;

      const roundsSetting = settings?.rounds;
      buildQueue(fullShuffled, roundsSetting);

      // Try to restore a persisted current animal so refresh/HMR don't load a new one.
      try {
        const savedId =
          persistence.progress.load<string>("multichoice.current");
        if (savedId) {
          const foundIndex = fullShuffled.findIndex((a) => a.id === savedId);
          if (foundIndex >= 0) {
            // Historical quirk preserved: restoring swaps in the FULL shuffled
            // queue regardless of the numeric-rounds setting.
            animalQueueRef.current = fullShuffled;
            queueIndexRef.current =
              (foundIndex + 1) % fullShuffled.length;

            const found = fullShuffled[foundIndex];
            const imgUrl = found.images?.[0]?.url ?? "";
            if (!imgUrl) {
              setCurrentAnimal(found);
              setCurrentImage("");
              setIsImageLoading(false);
              applyOptions(found, fullShuffled);
            } else {
              setIsImageLoading(true);
              const img = new Image();
              let settledRestore = false;
              const restoreTimeout = window.setTimeout(() => {
                if (settledRestore) return;
                settledRestore = true;
                console.warn("Restore image load timed out, showing fallback.", imgUrl);
                setCurrentAnimal(found);
                setCurrentImage("");
                setIsImageLoading(false);
                applyOptions(found, fullShuffled);
              }, 5000);
              img.onload = () => {
                if (settledRestore) return;
                settledRestore = true;
                window.clearTimeout(restoreTimeout);
                setCurrentAnimal(found);
                setCurrentImage(imgUrl);
                setIsImageLoading(false);
                applyOptions(found, fullShuffled);
              };
              img.onerror = () => {
                if (settledRestore) return;
                settledRestore = true;
                window.clearTimeout(restoreTimeout);
                setCurrentAnimal(found);
                setCurrentImage("");
                setIsImageLoading(false);
                applyOptions(found, fullShuffled);
              };
              img.src = imgUrl;
            }
            // restored, skip loading a new random one
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to restore MultiChoice currentId:", err);
      }

      // Immediately load the first animal from the shuffled set
      loadNewAnimal();
    });

    return () => {
      cancelled = true;
    };
    // Bootstrap intentionally runs once per dataset arrival; live settings
    // changes are applied by buildQueue on next entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animals]);

  const handleAnswerClick = (answer: string) => {
    // Prevent clicks on disabled options or when already answered correctly
    if (isAnswered) return;
    if (disabledOptions.includes(answer)) return;

    // Wrong answer: mark as disabled and show feedback, but don't advance
    if (answer !== correctAnswer) {
      setSelectedAnswer(answer);
      setDisabledOptions((d) => (d.includes(answer) ? d : [...d, answer]));
      return;
    }

    // Correct answer: mark answered and award point. User will click Next to continue.
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setScore((s) => s + 1);
  };

  // When the answer has been marked and the Next button is rendered, allow
  // pressing Enter to advance to the next animal. Guard against firing when
  // focus is inside an input-like element or when rounds are completed.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Enter") return;
      if (!isAnswered) return;
      const btn = nextButtonRef.current;
      if (!btn) return;
      if (allRoundsCompleted) return;
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      }
      ev.preventDefault();
      btn.click();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, allRoundsCompleted]);

  return (
    <div className="h-full w-full flex items-center justify-center pt-6 md:pt-8 px-4 pb-4 overflow-hidden">
      <div className="max-w-6xl w-full flex flex-col max-h-full overflow-hidden pb-6">
        {/* Header */}
        <div className="mb-2 md:mb-4 text-center shrink-0">
          <h2 className="text-xl md:text-3xl font-bold mb-1">
            Multiple Choice
          </h2>
          <p className="text-base md:text-lg font-semibold opacity-80">
            Score: {score}
          </p>
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto scrollbar-hidden flex flex-col min-h-0 gap-4 pb-4">
          <DisplayCard
            currentAnimal={currentAnimal}
            currentImage={currentImage}
            isImageLoading={isImageLoading}
            showDescription={settings.showDescription}
            settings={settings}
          />

          {allRoundsCompleted && (
            <div className="text-center mb-6">
              <p className="text-2xl font-bold mb-2">All rounds completed!</p>
              <p className="mb-2">
                Final score: <span className="font-semibold">{score}</span>
              </p>
              <div className="flex justify-center">
                <BackButton onBack={onBack} />
              </div>
            </div>
          )}

          <AnswerGrid
            answerOptions={answerOptions}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            correctAnswer={correctAnswer}
            handleAnswerClick={handleAnswerClick}
            disabledOptions={disabledOptions}
          />
        </div>

        {/* Footer Buttons (stacked) */}
        <div className="flex flex-col items-center shrink-0 pb-12 md:pb-14 gap-4 md:gap-6">
          {/* Reserve space for Next button so it doesn't shift layout when it appears */}
          <div className="w-full flex items-center justify-center mb-2">
            <div className="w-full flex items-center justify-center min-h-10 md:min-h-12">
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    key="next-animal"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <div className="relative z-10 inline-block rounded-lg bg-transparent ring-2 ring-primary ring-offset-2 ring-glow">
                      <button
                        ref={nextButtonRef}
                        onClick={() => loadNewAnimal()}
                        disabled={allRoundsCompleted}
                        aria-disabled={allRoundsCompleted}
                        className={`btn btn-success btn-sm md:btn-md text-sm md:text-base ${allRoundsCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Next Animal
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BackButton
              className="btn-sm md:btn-md text-sm md:text-base"
              onBack={() => setShowBackModal(true)}
            />
            <ConfirmBackModal
              isOpen={showBackModal}
              onClose={() => setShowBackModal(false)}
              onHome={() => {
                setShowBackModal(false);
                resetMultiChoice();
                if (onHome) onHome();
                else onBack?.();
              }}
              onSettings={() => {
                setShowBackModal(false);
                resetMultiChoice();
                onBack?.();
              }}
              title="Leave this game?"
              description="You can return to settings or go back to the home page."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
