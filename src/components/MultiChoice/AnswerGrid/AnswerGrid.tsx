import React from "react";
import "./AnswerGrid.css";

export default function AnswerGrid({
  answerOptions,
  selectedAnswer,
  isAnswered,
  correctAnswer,
  handleAnswerClick,
}: {
  answerOptions: string[];
  selectedAnswer: string | null;
  isAnswered: boolean;
  correctAnswer: string;
  handleAnswerClick: (s: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {answerOptions.map((ans) => {
        const isCorrect = isAnswered && ans === correctAnswer;
        const isSelected = isAnswered && ans === selectedAnswer;
        const baseClass = "btn btn-lg text-left";
        let cls = `${baseClass} btn-outline`;
        if (isCorrect) cls = `${baseClass} btn-success`;
        else if (isSelected) cls = `${baseClass} btn-error`;

        return (
          <button
            key={ans}
            type="button"
            className={cls}
            onClick={() => handleAnswerClick(ans)}
            disabled={isAnswered}
          >
            {ans}
          </button>
        );
      })}
    </div>
  );
}
import React from "react";

export default function AnswerGrid({
  answerOptions,
  selectedAnswer,
  isAnswered,
  correctAnswer,
  handleAnswerClick,
}: {
  answerOptions: string[];
  selectedAnswer: string | null;
  isAnswered: boolean;
  correctAnswer: string;
  handleAnswerClick: (answer: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {answerOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={isAnswered}
            className={`btn justify-center text-center px-4 py-3 border-2 bg-white text-base-content w-full overflow-hidden ${
              selectedAnswer === option
                ? option === correctAnswer
                  ? "btn-success border-success"
                  : "btn-error border-error"
                : isAnswered && option === correctAnswer
                  ? "btn-success border-success"
                  : "border-base-300 hover:border-base-400"
            } ${isAnswered ? "opacity-60" : ""}`}
          >
            <span className="line-clamp-2">{option}</span>
            {isAnswered && option === correctAnswer && (
              <span className="text-lg">✓</span>
            )}
            {isAnswered &&
              selectedAnswer === option &&
              option !== correctAnswer && <span className="text-lg">✗</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
