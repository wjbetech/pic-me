import { motion, useReducedMotion } from "framer-motion";
import { FaClone, FaPenAlt, FaSpellCheck } from "react-icons/fa";

// Loose alias: framer-motion 13's strict Motion prop types reject plain HTML
// props like className without a generic. Same workaround as Hero/Main.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionButton: any = motion.button;
import type { GameMode } from "../../constants/gameModes";

const ICONS = {
  "multiple-choice": <FaClone aria-hidden />,
  "open-answer": <FaPenAlt aria-hidden />,
  hangman: <FaSpellCheck aria-hidden />,
} as const;

interface Props {
  options: GameMode[];
  selected: string;
  onSelect: (id: string) => void;
}

/**
 * Mode switcher as sticker tiles — mirrors src/components/home/ModeTiles.tsx
 * structure (icon, font-display title, desc on bg-base-200 with a thick
 * border-base-content edge), so tapping a home Mode Card lands on the same
 * card enlarged (game-mode-screen decision 02).
 *
 * The selected tile reads as stuck-pressed: it drops flush while its
 * siblings keep the hover lift, and carries the rotated "Picked!" badge.
 * Selection semantics stay tabs-like: buttons + aria-pressed (tests pin
 * role=button + mode title in the accessible name).
 */
export default function ModeStickers({ options, selected, onSelect }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Game modes"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
    >
      {options.map((o) => {
        const isSelected = selected === o.id;
        return (
          <MotionButton
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            aria-pressed={isSelected}
            whileHover={
              reduceMotion || isSelected ? undefined : { y: -6 }
            }
            whileTap={reduceMotion ? undefined : { y: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={`relative text-left rounded-2xl border-4 p-5 md:p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
              isSelected
                ? "bg-base-100 border-base-content translate-y-[3px] shadow-none"
                : "bg-base-200 border-base-content"
            }`}
          >
            {isSelected && (
              <span
                aria-hidden
                className="absolute -top-3 -right-2 rotate-6 inline-flex items-center rounded-md border-2 border-base-content bg-accent px-2 py-0.5 font-display text-sm font-semibold text-accent-content"
              >
                Picked!
              </span>
            )}
            <div className="text-3xl mb-3 text-primary" aria-hidden>
              {ICONS[o.id as keyof typeof ICONS]}
            </div>
            <h2 className="font-display text-xl font-semibold mb-1.5">
              {o.title}
            </h2>
            <p className="font-body text-sm opacity-75">{o.desc}</p>
          </MotionButton>
        );
      })}
    </div>
  );
}
