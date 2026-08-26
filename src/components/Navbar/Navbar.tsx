import { useEffect, useState, type RefObject } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

/**
 * Track whether a scroll container has scrolled past `ratio` of the
 * viewport (the hero is min-h-[80dvh], so 0.8 ≈ "past the hero").
 * rAF-throttled passive listener; cleans up on unmount.
 */
function useScrolledPast(
  target: RefObject<HTMLElement | null>,
  ratio = 0.8,
): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(el.scrollTop > window.innerHeight * ratio);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [target, ratio]);

  return scrolled;
}

/** White text that stays AA-legible over any animal photo (decision 01). */
const ON_PHOTO_TEXT = "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]";

interface Props {
  onHome?: () => void;
  /**
   * Overlay mode (home route): floats over the hero photo — transparent at
   * the top with a dedicated scrim strip behind it, then switches to glass
   * (`bg-base-100/80 backdrop-blur-md`) once the scroller passes the hero
   * (decisions 01 + 02 in .scratch/home-navbar/). Without it, renders the
   * classic solid bar used on the options/play routes.
   */
  overlay?: boolean;
  /** Scroll container to watch in overlay mode. */
  scrollTarget?: RefObject<HTMLElement | null>;
}

export default function Navbar({ onHome, overlay, scrollTarget }: Props) {
  const scrolled = useScrolledPast(scrollTarget ?? { current: null });
  const glass = overlay && scrolled;

  // Overlay: wordmark/toggle go white-over-scrim at the top, theme tokens
  // once glass gives them a base-100 surface.
  const toneClass = overlay && !glass ? ON_PHOTO_TEXT : "";

  if (!overlay) {
    return (
      <div className="navbar navbar-edge bg-base-100 shadow-md w-full items-center align-middle z-10">
        <div className="flex-1">
          <button
            onClick={() => onHome && onHome()}
            className="btn btn-ghost text-warning p-0"
            aria-label="PicMe Home"
          >
            <h3 className="text-2xl">PicMe</h3>
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 transition-colors duration-200 ${
        glass
          ? "bg-base-100/80 backdrop-blur-md shadow-sm border-b border-base-content/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Dedicated top scrim: guarantees legibility over light fur/sky
          photos where the hero's own bottom-weighted scrim doesn't reach. */}
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent transition-opacity duration-200 ${
          glass ? "opacity-0" : "opacity-100"
        }`}
      />
      <div className="navbar navbar-edge w-full items-center">
        <div className="flex-1">
          <button
            onClick={() => onHome && onHome()}
            className={`btn btn-ghost p-0 ${toneClass || "text-warning"}`}
            aria-label="PicMe Home"
          >
            <h3 className="text-2xl">PicMe</h3>
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle onPhoto={overlay && !glass} />
        </div>
      </div>
    </div>
  );
}
