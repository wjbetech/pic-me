import { useState, useEffect } from "react";
import type { Animal } from "../../types/Animal";
import animalsA from "../../data/animalsA.json";
import animalsB from "../../data/animalsB.json";
import animalsC from "../../data/animalsC.json";
import "./MultiChoice.css";

const ALL_ANIMALS: Animal[] = [
  ...(animalsA as Animal[]),
  ...(animalsB as Animal[]),
  ...(animalsC as Animal[]),
];

interface GameSettings {
  blur: number;
  showDescription: boolean;
}

export default function MultiChoice({
  onBack,
  settings = { blur: 0, showDescription: false },
}: {
  onBack?: () => void;
  settings?: GameSettings;
}) {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSwipingIn, setIsSwipingIn] = useState(true);
  const [score, setScore] = useState(0);

  const loadNewAnimal = () => {
    // Reset animation state
    setIsSwipingIn(false);
    setSelectedAnswer(null);
    setIsAnswered(false);

    // Simulate swipe animation delay
    setTimeout(() => {
      // Pick a random animal from all available animals
      const randomAnimal =
        ALL_ANIMALS[Math.floor(Math.random() * ALL_ANIMALS.length)];

      // Ensure animal has images
      if (
        !randomAnimal ||
        !randomAnimal.images ||
        randomAnimal.images.length === 0
      ) {
        console.warn("Animal has no images:", randomAnimal);
        loadNewAnimal();
        return;
      }

      // Pick a random image from that animal
      const randomImageObj =
        randomAnimal.images[
          Math.floor(Math.random() * randomAnimal.images.length)
        ];

      const imageUrl = randomImageObj?.url || "";

      if (!imageUrl) {
        console.warn("No image URL found for animal:", randomAnimal);
        loadNewAnimal();
        return;
      }

      setCurrentAnimal(randomAnimal);
      setCurrentImage(imageUrl);
      setCorrectAnswer(randomAnimal.commonName);

      // Generate 3 random different animal names (not the current one)
      const otherAnimals = ALL_ANIMALS.filter((a) => a.id !== randomAnimal.id);

      const randomWrongAnswers: string[] = [];
      for (let i = 0; i < 3; i++) {
        const randomWrongAnimal =
          otherAnimals[Math.floor(Math.random() * otherAnimals.length)];
        randomWrongAnswers.push(randomWrongAnimal.commonName);
        // Remove this animal from available pool to avoid duplicates
        const index = otherAnimals.indexOf(randomWrongAnimal);
        if (index > -1) {
          otherAnimals.splice(index, 1);
        }
      }

      // Combine and shuffle the options
      const allOptions = [...randomWrongAnswers, randomAnimal.commonName];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      setAnswerOptions(shuffledOptions);
      setIsSwipingIn(true);
    }, 300);
  };

  useEffect(() => {
    loadNewAnimal();
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
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {/* Animal Image or Description Container with Swipe Animation */}
          <div className="shrink-0 mb-6">
            <div
              className={`swipe-container ${
                isSwipingIn ? "swipe-in" : "swipe-out"
              }`}
            >
              {settings.showDescription ? (
                // Show Description
                <div className="w-full h-64 md:h-80 bg-base-200 rounded-lg shadow-lg p-6 overflow-y-auto flex flex-col justify-center">
                  {currentAnimal && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg">
                        {currentAnimal.commonName}
                      </h3>
                      <p className="italic text-sm opacity-70">
                        {currentAnimal.latinName}
                      </p>
                      {currentAnimal.description.map((desc, idx) => (
                        <p key={idx} className="text-sm leading-relaxed">
                          {desc}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Show Image with optional blur
                currentImage && (
                  <img
                    src={currentImage}
                    alt={currentAnimal?.commonName || "Animal"}
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                    style={{
                      filter:
                        settings.blur > 0
                          ? `blur(${settings.blur * 2}px)`
                          : "none",
                    }}
                  />
                )
              )}
            </div>

            {/* Animal Name Hint */}
            {currentAnimal && (
              <p className="text-center opacity-60 mt-3 text-sm">
                Hint: {currentAnimal.habitat.join(", ")}
              </p>
            )}
          </div>

          {/* Answer Buttons Grid */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {answerOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                  className={`btn justify-center text-center px-4 py-3 border-2 bg-white text-base-content ${
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
                    option !== correctAnswer && (
                      <span className="text-lg">✗</span>
                    )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-6 shrink-0">
          <button className="btn btn-ghost" onClick={() => onBack && onBack()}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
