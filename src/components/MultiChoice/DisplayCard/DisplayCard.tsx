import { useState } from "react";
import type { Animal } from "../../../game-core/animal";
import type { HintPreference } from "../../../game-core/hints";
import HintLine from "../../common/HintLine";
import "./DisplayCard.css";

export default function DisplayCard({
  currentAnimal,
  currentImage,
  isImageLoading,
  showDescription = false,
  settings = {},
}: {
  currentAnimal: Animal | null;
  currentImage: string;
  isImageLoading: boolean;
  showDescription?: boolean;
  settings?: { blur?: number; mcHints?: HintPreference };
}) {
  const blur = settings.blur ?? 0;
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  return (
    <div className="shrink-4 min-w-0 place-self-center justify-center mb-4">
      <div
        className={`swipe-container ${isImageLoading ? "swipe-out" : "swipe-in"}`}
      >
        {showDescription ? (
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
          <div className="relative w-full h-56 md:h-64">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-200 rounded-lg">
                <div className="mc-spinner" aria-hidden />
              </div>
            )}

            {currentImage && (
              <img
                src={currentImage}
                alt={currentAnimal?.commonName || "Animal"}
                onLoad={(e) => {
                  try {
                    const img = e.currentTarget as HTMLImageElement;
                    setIsPortrait(img.naturalHeight > img.naturalWidth);
                  } catch {
                    setIsPortrait(null);
                  }
                }}
                className={`w-full h-44 md:h-56 rounded-lg shadow-lg ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                } ${isPortrait ? "object-contain" : "object-cover"}`}
                style={{
                  filter: blur > 0 ? `blur(${blur * 2}px)` : "none",
                  transition: "opacity 200ms ease-in-out",
                }}
              />
            )}
          </div>
        )}
      </div>

      <HintLine animal={currentAnimal} pref={settings.mcHints} />
    </div>
  );
}
