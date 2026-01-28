import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import type { MutableRefObject } from "react";

export default function OpenAnswerForm({
  inputRef,
  nextButtonRef,
  inputValue,
  setInputValue,
  feedback,
  isCorrect,
  onSubmit,
  onNext,
}: {
  inputRef: MutableRefObject<HTMLInputElement | null>;
  nextButtonRef: MutableRefObject<HTMLButtonElement | null>;
  inputValue: string;
  setInputValue: (v: string) => void;
  feedback: string | null;
  isCorrect: boolean;
  flashState: "correct" | "wrong" | null;
  onSubmit: () => void;
  onNext: () => void;
}) {
  return (
    <div className="bg-base-100 rounded-lg p-6">
      <form
        className="flex flex-col gap-4 items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (isCorrect) onNext();
          else onSubmit();
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
            className="input w-full text-lg text-center open-answer-input border-2 border-base-content/20 rounded-md px-3 py-0 h-8 focus:border-primary focus:ring-0"
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
            onClick={onNext}
            className="btn btn-success"
          >
            Next Animal
          </button>
        )}
      </form>
    </div>
  );
}
