import Hero from "../home/Hero";

/**
 * Homepage composition root. Sections live in components/home/*.
 * Scrolls within App's route viewport (App wraps this in an overflow-y-auto
 * container — games keep their own fixed-viewport layouts).
 */
export default function Main({ onStart }: { onStart?: () => void }) {
  return (
    <div className="min-h-full bg-base-100 text-base-content">
      <Hero onStart={onStart} />
    </div>
  );
}
