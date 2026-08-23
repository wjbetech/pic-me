import { HOME_PHOTOS } from "../../data/homePhotos";

/**
 * The page's signature texture and its ONE perpetual motion
 * (docs/HOMEPAGE-BRIEF.md): a seamless loop of the curated, watermark-free
 * homepage set — decoupled from the in-game dataset so premium Unsplash
 * previews never leak onto the landing page.
 */
export default function PhotoMarquee() {
  const photos = HOME_PHOTOS;

  // Duplicated once so the -50% translate loops seamlessly.
  const track = [...photos, ...photos];

  return (
    <section aria-label="Meet the animals" className="py-10 md:py-14 overflow-hidden">
      <div className="marquee overflow-x-auto">
        <ul className="marquee-track flex w-max items-center gap-5 px-5">
          {track.map((a, i) => (
            <li key={`${a.id}-${i}`} className="shrink-0" aria-hidden={i >= photos.length}>
              <img
                src={a.src}
                alt={i < photos.length ? a.alt : ""}
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
