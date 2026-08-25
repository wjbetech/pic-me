import { motion, useReducedMotion } from "framer-motion";
import { FaClone, FaPenAlt, FaSpellCheck } from "react-icons/fa";
import Reveal from "./Reveal";
import { OPTIONS } from "../../constants/gameModes";

const ICONS = {
  "multiple-choice": <FaClone aria-hidden />,
  "open-answer": <FaPenAlt aria-hidden />,
  hangman: <FaSpellCheck aria-hidden />,
} as const;

/**
 * "Three ways to play" — bridges kids and parents: names the modes in
 * kid-sized language while the descriptions tell parents what each one
 * practices. Tapping a tile heads to that mode's settings.
 */
export default function ModeTiles({
  onStart,
}: {
  onStart?: (modeId: string) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-14 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-center mb-10 md:mb-14">
            Three ways to play
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPTIONS.map((mode) => (
            <motion.button
              key={mode.id}
              onClick={() => onStart?.(mode.id)}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              whileTap={reduceMotion ? undefined : { y: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="text-left bg-base-200 rounded-2xl border-4 border-base-content p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
            >
              <div className="text-3xl mb-4 text-primary" aria-hidden>
                {ICONS[mode.id as keyof typeof ICONS]}
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {mode.title}
              </h3>
              <p className="font-body text-sm opacity-75">{mode.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
