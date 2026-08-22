import { useEffect, useState } from "react";
import type { Animal } from "../game-core/animal";
import { combineAnimalModules } from "../game-core/data";

// Adapter-layer concern: bundler coupling lives HERE, never in game-core.
// `query: "?json"` + `import: "default"` is the modern Vite glob form
// (replaces the deprecated `as: "json"`).
const modules = import.meta.glob("../data/*.json", {
  query: "?json",
  import: "default",
}) as Record<string, () => Promise<Animal[]>>;

let cache: Animal[] | null = null;

/**
 * Loads the full animal dataset once per app lifetime.
 *
 * Returns null until loaded; games decide their own ordering via
 * game-core rotation with their chosen Random. The module-level cache means
 * navigating between modes never re-fetches or re-flattens.
 */
export function useAnimals(): Animal[] | null {
  const [animals, setAnimals] = useState<Animal[] | null>(cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;

    Promise.all(Object.values(modules).map((load) => load()))
      .then((results) => {
        if (cancelled) return;
        cache = combineAnimalModules(results);
        setAnimals(cache);
      })
      .catch(() => {
        // Dataset failure is surfaced by callers' empty-state handling;
        // keep console noise policy (error paths only).
        console.error("useAnimals: failed to load animal dataset");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return animals;
}
