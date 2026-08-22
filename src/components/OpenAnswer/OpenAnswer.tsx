import { useCallback, useEffect, useRef, useState } from "react";
import type { Animal } from "../../game-core/animal";
import { MathRandom } from "../../game-core/random";
import { pickRandomAnimal } from "../../game-core/pick";
import BackButton from "../BackButton/BackButton";
import ConfirmBackModal from "../ConfirmBackModal/ConfirmBackModal";
import "./OpenAnswer.css";
import normalizeAnswer from "../../utils/normalizeAnswer";
import preloadImage from "../../utils/openAnswer";
import { persistence } from "../../game-core/persistence";
import { useAnimals } from "../../hooks/useAnimals";
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

  // Dataset arrives via the shared loader (cached app-wide).
  const animals = useAnimals();

  const loadNewAnimal = useCallback(async () => {
    const next = pickRandomAnimal(allAnimalsRef.current, MathRandom);
    if (!next) return;

    setIsImageLoading(true);
    setInputValue("");
    setFeedback(null);
    setIsCorrect(false);

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

    persistence.progress.save("openanswer.current", next.id);
  }, []);

  // Resume a persisted animal (session TTL applies). Re-saving refreshes the
  // TTL clock, so arriving within the window restarts it — matching the
  // documented "refresh resumes; >10 min away resets" semantics.
  const restoreAnimal = useCallback(async (found: Animal) => {
    const imgUrl = found.images?.[0]?.url ?? "";
    const ok = imgUrl ? await preloadImage(imgUrl) : false;
    setCurrentAnimal(found);
    setCurrentImage(ok ? imgUrl : "");
    setIsImageLoading(false);
    persistence.progress.save("openanswer.current", found.id);
  }, []);

  // Bootstrap once the dataset arrives: restore persisted animal, or load fresh.
  // Deferred to a microtask so no state updates land synchronously in the
  // effect flush (react-hooks/set-state-in-effect), with a cancel guard for
  // StrictMode's double-invoked effects.
  useEffect(() => {
    if (!animals) return;
    allAnimalsRef.current = animals;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const savedId = persistence.progress.load<string>("openanswer.current");
      const found = savedId ? animals.find((a) => a.id === savedId) : undefined;

      if (found) {
        void restoreAnimal(found);
      } else {
        void loadNewAnimal();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [animals, loadNewAnimal, restoreAnimal]);

  useEffect(() => {
    if (isCorrect && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [isCorrect]);

  // Auto-focus the input when a new animal loads (or on mount).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (isCorrect) return; // don't focus when answer is locked

    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }

    const t = window.setTimeout(() => {
      try {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // focus/scroll are best-effort enhancements
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
    persistence.progress.clear("openanswer.current");
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
              persistence.progress.clear("openanswer.current");
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
