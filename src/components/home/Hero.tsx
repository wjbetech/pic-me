import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAnimals } from "../../hooks/useAnimals";
import type { Animal } from "../../game-core/animal";

/**
 * Homepage hero — the photo showcase (docs/HOMEPAGE-BRIEF.md).
 * Full-bleed real animal photography, benefit-led headline, single CTA.
 * Photo is re-picked once per visit; scrim keeps text WCAG-readable in both
 * themes; everything degrades to static under prefers-reduced-motion.
 */
export default function Hero({ onStart }: { onStart?: () => void }) {
  const animals = useAnimals();
  const reduceMotion = useReducedMotion();

  const hero: Animal | undefined = useMemo(() => {
    if (!animals || animals.length === 0) return undefined;
    const withImages = animals.filter((a) => a.images.length > 0);
    const pool = withImages.length > 0 ? withImages : animals;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [animals]);

  return (
    <section className="relative min-h-[80dvh] flex items-center overflow-hidden">
      {/* Photo layer */}
      <div className="absolute inset-0">
        {hero ? (
          <img
            src={hero.images[0]?.url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-base-200" aria-hidden />
        )}
        {/* Scrim: dark enough for AA contrast over any photo, both themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/15" />
      </div>

      {/* Copy layer */}
      <motion.div
        className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-left"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-body text-sm font-bold uppercase tracking-[0.14em] text-white/85 mb-3">
          Free · No sign-up · No ads
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white max-w-xl">
          Learning animal names is hard. We made it a game.
        </h1>
        <p className="font-body mt-5 text-lg md:text-xl text-white/90 max-w-prose">
          Guess your way through {animals ? animals.length : "122"} real
          animals — three games that sneak spelling and vocabulary practice
          into play.
        </p>

        <button
          onClick={() => onStart?.()}
          className="mt-8 inline-flex items-center justify-center rounded-2xl border-4 border-base-content bg-primary px-10 h-16 font-display text-2xl font-semibold text-primary-content shadow-[0_6px_0_0_rgba(0,0,0,0.45)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none cursor-pointer select-none"
        >
          Start Playing
        </button>
      </motion.div>
    </section>
  );
}
