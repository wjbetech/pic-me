import type { Animal } from "../../../types/Animal";
import "./DisplayCard.css";

export default function DisplayCard({
  currentAnimal,
  currentImage,
  isImageLoading,
  showDescription,
  settings,
}: {
  currentAnimal: Animal | null;
  currentImage: string;
  isImageLoading: boolean;
  showDescription: boolean;
  settings: { blur: number };
}) {
  return (
    <div className="shrink-0 mb-6">
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
          <div className="relative w-full h-64 md:h-80">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-200 rounded-lg">
                <div className="mc-spinner" aria-hidden />
              </div>
            )}

            {currentImage && (
              <img
                src={currentImage}
                alt={currentAnimal?.commonName || "Animal"}
                className={`w-full h-64 md:h-80 object-cover rounded-lg shadow-lg ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  filter:
                    settings.blur > 0 ? `blur(${settings.blur * 2}px)` : "none",
                  transition: "opacity 200ms ease-in-out",
                }}
              />
            )}
          </div>
        )}
      </div>

      {currentAnimal && (
        <p className="text-center opacity-60 mt-3 text-sm">
          Hint: {currentAnimal.habitat.join(", ")}
        </p>
      )}
    </div>
  );
}
