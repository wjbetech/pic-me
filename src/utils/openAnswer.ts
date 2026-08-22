/**
 * Image preloading. DOM-dependent, so it stays in the adapter layer —
 * game-core never touches the DOM.
 */
export default function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}
