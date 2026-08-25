import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Loose alias: framer-motion 13's strict Motion prop types reject plain HTML
// props like className without a generic. Pre-existing workaround in Main.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;
import { useAnimals } from "../../hooks/useAnimals";
import { HOME_PHOTOS, type HomePhoto } from "../../data/homePhotos";

/**
 * Homepage hero — the photo showcase (docs/HOMEPAGE-BRIEF.md).
 * Full-bleed real animal photography, benefit-led headline, single CTA.
 * Photo is re-picked once per visit (selection deferred out of render);
 * scrim keeps text WCAG-readable in both themes; everything degrades to
 * static under prefers-reduced-motion.
 */
export default function Hero({ onStart }: { onStart?: () => void }) {
  const animals = useAnimals();
  const reduceMotion = useReducedMotion();
  const [hero, setHero] = useState<HomePhoto | undefined>(undefined);

  // Curated, watermark-free hero — re-picked once per visit from the
  // dedicated homepage set (not the in-game dataset, which still holds 20
  // premium Unsplash+ previews). Deferred out of render for compiler purity.
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setHero(
        HOME_PHOTOS[Math.floor(Math.random() * HOME_PHOTOS.length)],
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative min-h-[80dvh] flex items-center overflow-hidden">
      {/* Photo layer */}
      <div className="absolute inset-0">
        {hero ? (
          <img src={hero.src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-base-200" aria-hidden />
        )}
        {/* Scrim: dark enough for AA contrast over any photo, both themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/15" />
      </div>

      {/* Copy layer */}
      <MotionDiv
        className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-left"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
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
          className="mt-8 inline-flex items-center justify-center rounded-2xl border-4 border-base-content bg-primary px-10 h-16 font-display text-2xl font-semibold text-primary-content shadow-[0_6px_0_0_rgba(0,0,0,0.45)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none cursor-pointer select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/90 focus-visible:ring-offset-4 focus-visible:ring-offset-black/40"
        >
          Start Playing
        </button>
      </MotionDiv>
    </section>
  );
}
