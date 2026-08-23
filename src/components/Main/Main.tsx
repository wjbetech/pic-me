import Hero from "../home/Hero";
import PhotoMarquee from "../home/PhotoMarquee";
import ModeTiles from "../home/ModeTiles";
import ForGrownUps from "../home/ForGrownUps";
import HomeFooter from "../home/HomeFooter";

/**
 * Homepage composition root (docs/HOMEPAGE-BRIEF.md — five sections).
 * Scrolls within App's route viewport (App wraps this in an overflow-y-auto
 * container — games keep their own fixed-viewport layouts).
 */
export default function Main({ onStart }: { onStart?: () => void }) {
  return (
    <div className="min-h-full bg-base-100 text-base-content">
      <Hero onStart={onStart} />
      <PhotoMarquee />
      <ModeTiles onStart={onStart} />
      <ForGrownUps />
      <HomeFooter />
    </div>
  );
}
