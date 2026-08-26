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
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-white max-w-2xl">
          Learning animal names is hard. We made it a game.
        </h1>
        <p className="font-body mt-5 text-lg md:text-xl text-white/90 max-w-prose">
          Guess your way through {animals ? animals.length : "122"} real
          animals — three games that sneak spelling and vocabulary practice
          into play.
        </p>

        <button
          onClick={() => onStart?.()}
          className="btn-pop mt-8 h-14 px-9 text-xl"
        >
          Start Playing
        </button>
      </MotionDiv>
    </section>
  );
}
