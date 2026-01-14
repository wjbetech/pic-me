import { useState, useEffect } from "react";
import type { Animal } from "../../types/Animal";
import "./MultiChoice.css";

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
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSwipingIn, setIsSwipingIn] = useState(true);
  const [score, setScore] = useState(0);

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

    // Simulate swipe animation delay
    setTimeout(() => {
      // Pick a random animal from all available animals
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

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
        (a) => a.id !== randomAnimal.id && !optionSet.has(a.commonName)
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

  useEffect(() => {
    const loadAllData = async () => {
      // Dynamically import all JSON files in src/data (Vite)
      // @ts-ignore - import.meta.glob types may not be declared in the project
      const modules = import.meta.glob("../../data/*.json", { as: "json" });
      const loaders = Object.values(modules) as Array<() => Promise<Animal[]>>;
      try {
        const results = await Promise.all(loaders.map((fn) => fn()));
        // Some bundlers return a module object with a `default` property.
        const combined: Animal[] = results.flatMap((r) => {
          if (Array.isArray(r)) return r as Animal[];
          if (r && typeof r === "object" && Array.isArray((r as any).default))
            return (r as any).default as Animal[];
          console.warn("Unexpected data module format:", r);
          return [] as Animal[];
        });
        setAllAnimals(combined);
        console.log(`Loaded ${combined.length} animals from data/*.json`);
        // Immediately load the first animal from the combined dataset
        loadNewAnimal(combined);
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
