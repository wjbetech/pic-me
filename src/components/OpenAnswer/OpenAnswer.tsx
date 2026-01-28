import { useCallback, useEffect, useRef, useState } from "react";
import type { Animal } from "../../types/Animal";
import BackButton from "../BackButton/BackButton";
import ConfirmBackModal from "../ConfirmBackModal/ConfirmBackModal";
import "./OpenAnswer.css";
import normalizeAnswer from "../../utils/normalizeAnswer";
import { pickRandomAnimal, preloadImage } from "../../utils/openAnswer";
import useFlash from "../../hooks/useFlash";
import OpenAnswerForm from "./OpenAnswerForm";

interface OpenAnswerProps {
  onBack?: () => void;
  onHome?: () => void;
}

export default function OpenAnswer({ onBack, onHome }: OpenAnswerProps) {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const { flashState, triggerFlash, clearFlash } = useFlash(null);
  const [showBackModal, setShowBackModal] = useState(false);

  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const allAnimalsRef = useRef<Animal[]>([]);

  const loadNewAnimal = useCallback(async (animalsParam?: Animal[]) => {
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
      const ok = await preloadImage(imgUrl);
      setCurrentAnimal(next);
      setCurrentImage(ok ? imgUrl : "");
      setIsImageLoading(false);
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

  // input classes moved into OpenAnswerForm to keep styling colocated with the input element

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

        <OpenAnswerForm
          inputRef={inputRef}
          nextButtonRef={nextButtonRef}
          inputValue={inputValue}
          setInputValue={setInputValue}
          flashState={flashState}
          feedback={feedback}
          isCorrect={isCorrect}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />

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
