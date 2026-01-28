import type { Animal } from "../../types/Animal";

export default function AnimalImage({ animal }: { animal: Animal | null }) {
  if (!animal || !animal.images || !animal.images[0]) return null;
  return (
    <div className="flex justify-center">
      <img
        src={animal.images[0].url}
        alt={animal.commonName}
        className="w-64 h-48 md:w-80 md:h-60 object-cover rounded-lg shadow-lg"
      />
    </div>
  );
}
