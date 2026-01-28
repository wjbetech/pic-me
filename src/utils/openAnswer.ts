import type { Animal } from "../types/Animal";

export function pickRandomAnimal(animals: Animal[] | undefined | null) {
  if (!animals || animals.length === 0) return null;
  const withImages = animals.filter((a) => a.images && a.images.length > 0);
  const source = withImages.length > 0 ? withImages : animals;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}
