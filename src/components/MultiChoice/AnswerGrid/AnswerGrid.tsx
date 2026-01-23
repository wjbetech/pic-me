import "./AnswerGrid.css";

export default function AnswerGrid({
  answerOptions,
  selectedAnswer,
  isAnswered,
  correctAnswer,
  handleAnswerClick,
  disabledOptions = [],
}: {
  answerOptions: string[];
  selectedAnswer: string | null;
  isAnswered: boolean;
  correctAnswer: string;
  handleAnswerClick: (answer: string) => void;
  disabledOptions?: string[];
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col min-h-0 w-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2 md:p-4">
        {answerOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={isAnswered || disabledOptions.includes(option)}
            className={`btn justify-center text-center px-4 py-3 border-2 bg-base-200 text-base-content w-full overflow-hidden ${(() => {
              const isSelected = selectedAnswer === option;
              const isDisabled = disabledOptions.includes(option);
              if (isAnswered) {
                if (option === correctAnswer)
                  return "bg-success text-success-content";
                // Keep previously clicked wrong options visibly red/disabled
                if (isDisabled || disabledOptions.includes(option))
                  return "bg-error text-error-content opacity-60";
                if (isSelected) return "bg-error text-error-content";
                return "border-base-300 hover:border-base-400 opacity-60";
              }
              if (isDisabled) return "bg-error text-error-content opacity-60";
              if (isSelected)
                return option === correctAnswer
                  ? "bg-success text-success-content"
                  : "bg-error text-error-content";
              return "border-base-300 hover:border-base-400";
            })()}`}
          >
            <span className="line-clamp-2">{option}</span>
            {option === correctAnswer && isAnswered && (
              <span className="text-lg">✓</span>
            )}
            {disabledOptions.includes(option) && option !== correctAnswer && (
              <span className="text-lg">✗</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
