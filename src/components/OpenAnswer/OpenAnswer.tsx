import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import type { Animal } from "../../types/Animal";
import BackButton from "../BackButton/BackButton";
import ConfirmBackModal from "../ConfirmBackModal/ConfirmBackModal";
import "./OpenAnswer.css";

interface OpenAnswerProps {
  onBack?: () => void;
  onHome?: () => void;
}

const normalizeAnswer = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export default function OpenAnswer({ onBack, onHome }: OpenAnswerProps) {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [flashState, setFlashState] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [showBackModal, setShowBackModal] = useState(false);

  const flashTimeoutRef = useRef<number | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const allAnimalsRef = useRef<Animal[]>([]);

  const clearFlash = () => {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    setFlashState(null);
  };

  const triggerFlash = (state: "correct" | "wrong") => {
    clearFlash();
    requestAnimationFrame(() => {
      setFlashState(state);
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlashState(null);
        flashTimeoutRef.current = null;
      }, 1200);
    });
  };

  const pickRandomAnimal = (animals: Animal[]) => {
    if (!animals || animals.length === 0) return null;
    const withImages = animals.filter((a) => a.images && a.images.length > 0);
    const source = withImages.length > 0 ? withImages : animals;
    const index = Math.floor(Math.random() * source.length);
    return source[index];
  };

  const loadNewAnimal = useCallback((animalsParam?: Animal[]) => {
    const animals = animalsParam ?? allAnimalsRef.current;
    if (!animals || animals.length === 0) return;

    setIsImageLoading(true);
    setInputValue("");
    setFeedback(null);
    setIsCorrect(false);

    const next = pickRandomAnimal(animals);
    if (!next) {
      setIsImageLoading(false);
      return;
    }

    const imgUrl = next.images?.[0]?.url ?? "";
    if (!imgUrl) {
      setCurrentAnimal(next);
      setCurrentImage("");
      setIsImageLoading(false);
    } else {
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        setCurrentAnimal(next);
        setCurrentImage(imgUrl);
        setIsImageLoading(false);
      };
      img.onerror = () => {
        setCurrentAnimal(next);
        setCurrentImage("");
        setIsImageLoading(false);
      };
    }

    try {
      sessionStorage.setItem("openAnswer.currentId", next.id);
    } catch (error) {
      console.log(error, "Failed to save current animal ID to sessionStorage");
    }
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      const modules = import.meta.glob("../../data/*.json", { as: "json" });
      const loaders = Object.values(modules) as Array<() => Promise<Animal[]>>;
      try {
        const results = await Promise.all(loaders.map((fn) => fn()));
        const combined: Animal[] = results.flatMap((r) => {
          const mod = r as unknown;
          if (Array.isArray(mod)) return mod as Animal[];
          if (
            mod &&
            typeof mod === "object" &&
            Array.isArray((mod as { default?: unknown }).default)
          )
            return (mod as { default: Animal[] }).default;
          return [] as Animal[];
        });
        allAnimalsRef.current = combined;

        // restore persisted current animal if present
        try {
          const savedId = sessionStorage.getItem("openAnswer.currentId");
          if (savedId) {
            const found = combined.find((a) => a.id === savedId);
            if (found) {
              const imgUrl = found.images?.[0]?.url ?? "";
              if (!imgUrl) {
                setCurrentAnimal(found);
                setCurrentImage("");
                setIsImageLoading(false);
              } else {
                const img = new Image();
                img.src = imgUrl;
                img.onload = () => {
                  setCurrentAnimal(found);
                  setCurrentImage(imgUrl);
                  setIsImageLoading(false);
                };
                img.onerror = () => {
                  setCurrentAnimal(found);
                  setCurrentImage("");
                  setIsImageLoading(false);
                };
              }
              return;
            }
          }
        } catch (error) {
          console.log(
            error,
            "Failed to restore current animal from sessionStorage",
          );
        }

        loadNewAnimal(combined);
      } catch (err) {
        console.error("Failed to load animal data:", err);
        setIsImageLoading(false);
      }
    };

    loadAllData();
  }, [loadNewAnimal]);

  useEffect(() => {
    if (isCorrect && nextButtonRef.current) {
      try {
        nextButtonRef.current.focus();
      } catch (error) {
        console.log(error, "Failed to focus Next button");
      }
    }
  }, [isCorrect]);

  // Auto-focus the input when a new animal loads (or on mount).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (isCorrect) return; // don't focus when answer is locked

    try {
      try {
        el.focus({ preventScroll: true });
      } catch (error) {
        console.log(error, "Failed to focus input with preventScroll");
        el.focus();
      }
    } catch (error) {
      console.log(error, "Failed to focus input");
    }

    const t = window.setTimeout(() => {
      try {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) {
        console.log(error, "Failed to scroll input into view");
      }
    }, 100);

    return () => window.clearTimeout(t);
  }, [currentAnimal, isCorrect]);

  const handleSubmit = () => {
    if (!currentAnimal || isCorrect) return;
    const expected = normalizeAnswer(currentAnimal.commonName);
    const actual = normalizeAnswer(inputValue);

    if (!actual) {
      setFeedback("Type your answer to continue.");
      triggerFlash("wrong");
      return;
    }

    if (actual === expected) {
      setFeedback("Correct!");
      setIsCorrect(true);
      setScore((s) => s + 1);
      triggerFlash("correct");
    } else {
      setFeedback("Incorrect! Try again.");
      setIsCorrect(false);
      triggerFlash("wrong");
    }
  };

  const handleNext = () => {
    loadNewAnimal();
  };

  const handleBack = () => {
    try {
      sessionStorage.removeItem("openAnswer.currentId");
    } catch (error) {
      console.log(
        error,
        "Failed to remove current animal ID from sessionStorage",
      );
    }
    setScore(0);
    setCurrentAnimal(null);
    setCurrentImage("");
    setInputValue("");
    setFeedback(null);
    setIsCorrect(false);
    clearFlash();
    if (onBack) onBack();
  };

  const inputClass = [
    "input",
    "w-full",
    "text-lg",
    "text-center",
    "open-answer-input",
    "border-2",
    "border-base-content/20",
    "rounded-md",
    "px-3",
    "pr-12",
    "py-0",
    "h-8",
    "focus:border-primary",
    "focus:ring-0",
    flashState === "correct" ? "flash-correct" : "",
    flashState === "wrong" ? "flash-wrong" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Open Answer</h2>
          <p className="text-lg font-semibold opacity-80">Score: {score}</p>
        </div>

        <div className="flex justify-center">
          {isImageLoading ? (
            <div className="loading loading-spinner loading-lg text-primary" />
          ) : currentImage ? (
            <img
              src={currentImage}
              alt="Animal"
              className="w-64 h-48 md:w-80 md:h-60 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-64 h-48 md:w-80 md:h-60 rounded-lg bg-base-200 flex items-center justify-center">
              <span className="text-sm opacity-70">No image available</span>
            </div>
          )}
        </div>

        <div className="bg-base-100 rounded-lg p-6">
          <form
            className="flex flex-col gap-4 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (isCorrect) handleNext();
              else handleSubmit();
            }}
          >
            <label className="text-sm font-semibold text-center w-full">
              Your answer
            </label>

            <div className="relative w-full">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={inputClass}
                placeholder="Type the animal name"
                disabled={isCorrect}
                aria-invalid={feedback?.startsWith("Incorrect") || false}
              />
              <button
                type="submit"
                aria-label={isCorrect ? "Next animal" : "Submit answer"}
                className="absolute right-0 top-0 bottom-0 btn btn-success btn-xs w-12 p-0 h-8 rounded-l-none rounded-r-md border-l-0"
              >
                <FaArrowRight className="text-white" />
              </button>
            </div>

            {feedback && (
              <motion.div
                key={feedback}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <p
                  className={`text-sm font-semibold text-center w-full ${
                    feedback.startsWith("Correct")
                      ? "text-success"
                      : feedback.startsWith("Incorrect")
                        ? "text-error"
                        : "text-warning"
                  }`}
                >
                  {feedback}
                </p>
              </motion.div>
            )}

            {isCorrect && (
              <button
                ref={nextButtonRef}
                type="button"
                onClick={handleNext}
                className="btn btn-success"
              >
                Next Animal
              </button>
            )}
          </form>
        </div>

        <div className="flex justify-center">
          <BackButton
            label="Back"
            className="bg-error text-error-content"
            onBack={() => setShowBackModal(true)}
          />
          <ConfirmBackModal
            isOpen={showBackModal}
            onClose={() => setShowBackModal(false)}
            onHome={() => {
              try {
                sessionStorage.removeItem("openAnswer.currentId");
              } catch (error) {
                console.log(
                  error,
                  "Failed to remove current animal ID from sessionStorage",
                );
              }
              setShowBackModal(false);
              if (onHome) onHome();
              else onBack?.();
            }}
            onSettings={() => {
              handleBack();
              setShowBackModal(false);
            }}
            title="Leave this game?"
            description="You can return to settings or go back to the home page."
          />
        </div>
      </div>
    </div>
  );
}
