import { useState, useEffect, useRef } from "react";
import type { Animal } from "../../types/Animal";
import "./MultiChoice.css";
import { createRotation } from "../../utils/rotation";
import AnswerGrid from "./AnswerGrid/AnswerGrid";
import DisplayCard from "./DisplayCard/DisplayCard";

// Toggle debug logging for selection tracing
const DEBUG_SELECTION = true; // temporarily enabled to trace repeated A selection

interface GameSettings {
  blur: number;
  showDescription: boolean;
  rounds?: number | "all";
}

export default function MultiChoice({
  onBack,
  settings = { blur: 0, showDescription: false },
}: {
  onBack?: () => void;
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
  const [isSwipingIn, setIsSwipingIn] = useState(true);
  const [score, setScore] = useState(0);

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
    setIsSwipingIn(false);
    setSelectedAnswer(null);
    setIsAnswered(false);

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
      setIsSwipingIn(true);
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
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === correctAnswer) {
      setScore(score + 1);
    }

    // Load next animal after a delay
    setTimeout(() => {
      loadNewAnimal();
    }, 1500);
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="mb-4 text-center shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">
            Multiple Choice
          </h2>
          <p className="text-lg font-semibold opacity-80">Score: {score}</p>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-scroll flex flex-col min-h-0">
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
                <button className="btn" onClick={() => onBack && onBack()}>
                  Back to Menu
                </button>
              </div>
            </div>
          )}

          <AnswerGrid
            answerOptions={answerOptions}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            correctAnswer={correctAnswer}
            handleAnswerClick={handleAnswerClick}
          />
        </div>

        {/* Back Button */}
        {!allRoundsCompleted && (
          <div className="flex justify-center mt-6 shrink-0">
            <button
              className="btn btn-ghost"
              onClick={() => onBack && onBack()}
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
