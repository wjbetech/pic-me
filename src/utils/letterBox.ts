export function computeLetterBoxDimensions(
  longestLetters: number,
  options?: {
    containerWidth?: number;
    gapPx?: number;
    baseWidth?: number;
    minWidth?: number;
  },
) {
  const BASE_WIDTH = options?.baseWidth ?? 64;
  const MIN_WIDTH = options?.minWidth ?? 18;
  const gapPx = options?.gapPx ?? 8;

  // If we don't need to shrink, return the base size
  if (longestLetters < 6) {
    const boxWidth = BASE_WIDTH;
    const boxHeight = Math.round(boxWidth * 0.9);
    const fontSize = Math.max(14, Math.round(boxWidth * 0.36));
    return { boxWidth, boxHeight, fontSize };
  }

  const viewport = typeof window !== "undefined" ? window.innerWidth : 480;
  const containerWidth = options?.containerWidth ?? Math.min(viewport, 1280);

  // Reserve horizontal padding so boxes don't touch viewport edges
  const reserved = 64;
  const maxTotal = Math.max(120, containerWidth - reserved);

  const totalGaps = Math.max(0, longestLetters - 1) * gapPx;
  const availableForBoxes = Math.max(0, maxTotal - totalGaps);

  const proposed = Math.floor(availableForBoxes / longestLetters);

  const boxWidth = Math.max(MIN_WIDTH, Math.min(BASE_WIDTH, proposed));
  const boxHeight = Math.round(boxWidth * 0.9);
  const fontSize = Math.max(10, Math.round(boxWidth * 0.36));

  return { boxWidth, boxHeight, fontSize };
}

export default computeLetterBoxDimensions;
