import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Animal } from "../../types/Animal";
import "./MultiChoice.css";
import { createRotation } from "../../utils/rotation";
import AnswerGrid from "./AnswerGrid/AnswerGrid";
import DisplayCard from "./DisplayCard/DisplayCard";
import BackButton from "../BackButton/BackButton";
import ConfirmBackModal from "../ConfirmBackModal/ConfirmBackModal";

// Toggle debug logging for selection tracing
const DEBUG_SELECTION = true; // temporarily enabled to trace repeated A selection

interface GameSettings {
  blur: number;
  showDescription: boolean;
  rounds?: number | "all";
}

export default function MultiChoice({
  onBack,
  onHome,
  settings = { blur: 0, showDescription: false },
}: {
  onBack?: () => void;
  onHome?: () => void;
  settings?: GameSettings;
}) {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [animalQueue, setAnimalQueue] = useState<Animal[]>([]);
  const queueIndexRef = useRef(0);
  // A numeric id that increments with each load request; used to ignore stale loads
  const loadRequestIdRef = useRef(0);
  // Store the timeout id so in-flight timeouts can be cancelled when a new load is requested
  const loadTimeoutRef = useRef<number | null>(null);

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

  const allRoundsCompleted =
    roundsTotal !== "all" && typeof roundsTotal === "number"
      ? roundsPlayed >= roundsTotal
      : false;

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

  const loadNewAnimal = (animalsParam?: Animal[]) => {
    const animals = animalsParam ?? allAnimals;
    if (!animals || animals.length === 0) {
      if (animalsParam) {
        console.warn("No animals available in provided dataset.");
        return;
      }
      // Dataset not ready yet — retry shortly
      setTimeout(() => loadNewAnimal(), 200);
      return;
    }
    // Reset animation state
    setSelectedAnswer(null);
    setIsAnswered(false);
    setDisabledOptions([]);

    // If rounds is a number and we've already completed the requested rounds, stop here
    if (
      roundsTotal !== "all" &&
      typeof roundsTotal === "number" &&
      roundsPlayed >= roundsTotal
    ) {
      console.log("All rounds completed.");
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
        if (DEBUG_SELECTION) {
          console.info(
            `Ignoring stale load callback (id ${requestId}), current id ${loadRequestIdRef.current}`,
          );
        }
        return;
      }

      // Pick next animal from the shuffled rotation queue (no repeats until exhausted)
      // Use the state queue if available, otherwise fall back to the provided animals array
      const sourceQueue =
        animalQueue && animalQueue.length > 0 ? animalQueue : animals;
      if (!sourceQueue || sourceQueue.length === 0) {
        console.warn("No animals available in queue or source to pick from");
        return;
      }

      const idx = queueIndexRef.current ?? 0;
      const randomAnimal: Animal = sourceQueue[idx % sourceQueue.length];

      // advance index in the shared queue index so we don't repeat too soon
      queueIndexRef.current = (idx + 1) % sourceQueue.length;

      if (DEBUG_SELECTION) {
        console.info(
          `Selecting (request ${requestId}): ${randomAnimal?.id || "none"} - ${
            randomAnimal?.commonName || ""
          } | queue index: ${idx} / ${
            animalQueue.length
          } | roundsPlayed: ${roundsPlayed} / ${roundsTotal}`,
        );
      }

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
        // Preload the image to avoid rendering lag and show a spinner
        setIsImageLoading(true);
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          // Ensure the request is still current before applying
          if (requestId !== loadRequestIdRef.current) {
            if (DEBUG_SELECTION)
              console.info(
                `Ignoring image onload for stale request ${requestId}`,
              );
            return;
          }
          setCurrentAnimal(randomAnimal);
          setCurrentImage(imageUrl);
          setCorrectAnswer(randomAnimal.commonName);
          setIsImageLoading(false);
          try {
            sessionStorage.setItem("multiChoice.currentId", randomAnimal.id);
          } catch (error) {
            console.log(
              error,
              "Error setting sessionStorage for multiChoice.currentId",
            );
          }
          // Count this loaded round (for numeric rounds)
          setRoundsPlayed((p) => p + 1);
          if (DEBUG_SELECTION)
            console.info(
              `Applied animal (request ${requestId}): ${randomAnimal?.id}`,
            );
        };
        img.onerror = () => {
          // Ensure the request is still current before reacting
          if (requestId !== loadRequestIdRef.current) {
            if (DEBUG_SELECTION)
              console.info(
                `Ignoring image onerror for stale request ${requestId}`,
              );
            return;
          }
          console.warn("Failed to load image, picking another.", imageUrl);
          setIsImageLoading(false);
          try {
            sessionStorage.setItem("multiChoice.currentId", randomAnimal.id);
          } catch (error) {
            console.log(
              error,
              "Error setting sessionStorage for multiChoice.currentId",
            );
          }
          // If image fails, try next in queue (if any)
          // remove the failing animal from queue to avoid infinite loop
          if (animalQueue && animalQueue.length > 0) {
            const filtered = animalQueue.filter(
              (a) => a.id !== randomAnimal.id,
            );
            setAnimalQueue(filtered);
          }
          loadNewAnimal();
          return;
        };
      } else {
        // No image available for this animal: still select it so sampling covers all animals
        // Ensure request is still current
        if (requestId !== loadRequestIdRef.current) {
          if (DEBUG_SELECTION)
            console.info(
              `Ignoring no-image apply for stale request ${requestId}`,
            );
          return;
        }
        setCurrentAnimal(randomAnimal);
        setCurrentImage("");
        setCorrectAnswer(randomAnimal.commonName);
        setIsImageLoading(false);
        setRoundsPlayed((p) => p + 1);
        if (DEBUG_SELECTION)
          console.info(
            `Applied (no-image) animal (request ${requestId}): ${randomAnimal?.id}`,
          );
      }

      // Generate up to 3 random different animal names (not the current one)
      const otherAnimals = animals.filter((a) => a.id !== randomAnimal.id);

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

      // Fallback: if still not enough options, sample from ALL_ANIMALS (excluding current)
      const fallback = animals.filter(
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
  const buildQueue = (animals: Animal[], roundsSetting?: number | "all") => {
    // Create a rotation according to the requested rounds (number or "all").
    const q = createRotation(animals, roundsSetting ?? "all");
    queueIndexRef.current = 0;
    setAnimalQueue(q);
    setRoundsTotal(roundsSetting ?? "all");
    setRoundsPlayed(0);
  };

  // Reset the MultiChoice game state (used when leaving the game)
  const resetMultiChoice = () => {
    try {
      sessionStorage.removeItem("multiChoice.currentId");
    } catch (error) {
      console.log(
        error,
        "Error removing sessionStorage for multiChoice.currentId",
      );
    }
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
    setAnimalQueue([]);
    setAllAnimals([]);
    queueIndexRef.current = 0;
    loadRequestIdRef.current = 0;
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      // Dynamically import all JSON files in src/data (Vite)
      const modules = import.meta.glob("../../data/*.json", { as: "json" });
      const loaders = Object.values(modules) as Array<() => Promise<Animal[]>>;
      try {
        const results = await Promise.all(loaders.map((fn) => fn()));
        // Some bundlers return a module object with a `default` property.
        const combined: Animal[] = results.flatMap((r) => {
          const mod = r as unknown;
          if (Array.isArray(mod)) return mod as Animal[];
          if (
            mod &&
            typeof mod === "object" &&
            Array.isArray((mod as { default?: unknown }).default)
          )
            return (mod as { default: Animal[] }).default;
          console.warn("Unexpected data module format:", r);
          return [] as Animal[];
        });
        // Shuffle the combined dataset once to avoid any file-order bias and use
        // that as our authoritative list for sampling.
        const shuffledCombined = createRotation(combined, "all");
        setAllAnimals(shuffledCombined);
        console.log(
          `Loaded ${shuffledCombined.length} animals (shuffled) from data/*.json`,
        );
        // Build queue using provided settings.rounds if available
        // Cast settings to a minimal shape that may include `rounds` when provided
        const roundsSetting = (
          settings as unknown as {
            rounds?: number | "all";
          }
        )?.rounds;
        buildQueue(shuffledCombined, roundsSetting);
        // Try to restore a persisted current animal so refresh/HMR don't load a new one
        try {
          const savedId = sessionStorage.getItem("multiChoice.currentId");
          if (savedId) {
            const foundIndex = shuffledCombined.findIndex(
              (a) => a.id === savedId,
            );
            if (foundIndex >= 0) {
              // Ensure queue reflects shuffledCombined
              setAllAnimals(shuffledCombined);
              setAnimalQueue(shuffledCombined);
              // Set queue index to the next item after the restored one
              queueIndexRef.current =
                (foundIndex + 1) % shuffledCombined.length;

              const found = shuffledCombined[foundIndex];
              const imgUrl = found.images?.[0]?.url ?? "";
              if (!imgUrl) {
                setCurrentAnimal(found);
                setCurrentImage("");
                setIsImageLoading(false);
                try {
                  const built = buildOptionsForAnimal(found, shuffledCombined);
                  setCorrectAnswer(built.correct);
                  setAnswerOptions(built.options);
                } catch (e) {
                  console.warn(
                    "Failed to build options for restored animal:",
                    e,
                  );
                }
              } else {
                const img = new Image();
                img.src = imgUrl;
                img.onload = () => {
                  setCurrentAnimal(found);
                  setCurrentImage(imgUrl);
                  setIsImageLoading(false);
                  try {
                    const built = buildOptionsForAnimal(
                      found,
                      shuffledCombined,
                    );
                    setCorrectAnswer(built.correct);
                    setAnswerOptions(built.options);
                  } catch (e) {
                    console.warn(
                      "Failed to build options for restored animal:",
                      e,
                    );
                  }
                };
                img.onerror = () => {
                  setCurrentAnimal(found);
                  setCurrentImage("");
                  setIsImageLoading(false);
                  try {
                    const built = buildOptionsForAnimal(
                      found,
                      shuffledCombined,
                    );
                    setCorrectAnswer(built.correct);
                    setAnswerOptions(built.options);
                  } catch (e) {
                    console.warn(
                      "Failed to build options for restored animal:",
                      e,
                    );
                  }
                };
              }
              // restored, skip loading a new random one
              return;
            }
          }
        } catch (err) {
          console.warn("Failed to restore MultiChoice currentId:", err);
        }

        // Immediately load the first animal from the shuffled set
        loadNewAnimal(shuffledCombined);
      } catch (err) {
        console.error("Failed to load animal data:", err);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      try {
        btn.click();
      } catch (error) {
        console.log(error, "Failed to trigger Next via Enter");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, allRoundsCompleted]);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col max-h-full overflow-hidden pb-6">
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
        <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto flex flex-col min-h-0 gap-4 pb-4">
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
        <div className="flex flex-col items-center shrink-0 pb-3 md:pb-4 gap-2 md:gap-3">
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                key="next-animal"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <div className="inline-block rounded-lg bg-transparent ring-2 ring-primary ring-offset-2 ring-glow">
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
