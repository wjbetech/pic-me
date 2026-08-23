import { useAnimals } from "../../hooks/useAnimals";

/**
 * The page's signature texture and its ONE perpetual motion
 * (docs/HOMEPAGE-BRIEF.md): a seamless loop of real animal photos.
 * Pauses on hover; under prefers-reduced-motion the animation never starts
 * and the strip stays a scrollable row.
 */
export default function PhotoMarquee() {
  const animals = useAnimals();
  if (!animals) return null;

  const withImages = animals.filter((a) => a.images.length > 0);
  const photos = withImages.slice(0, 14);
  if (photos.length === 0) return null;

  // Duplicated once so the -50% translate loops seamlessly.
  const track = [...photos, ...photos];

  return (
    <section aria-label="Meet the animals" className="py-10 md:py-14 overflow-hidden">
      <div className="marquee overflow-x-auto">
        <ul className="marquee-track flex w-max items-center gap-5 px-5">
          {track.map((a, i) => (
            <li key={`${a.id}-${i}`} className="shrink-0" aria-hidden={i >= photos.length}>
              <img
                src={a.images[0]?.url}
                alt={i < photos.length ? a.commonName : ""}
                loading="lazy"
                className="h-36 w-auto md:h-48 rounded-2xl border-4 border-base-content object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
