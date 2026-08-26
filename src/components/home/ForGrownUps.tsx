import { FaGift, FaUnlockAlt, FaShieldAlt, FaBrain } from "react-icons/fa";
import Reveal from "./Reveal";

const FACTS = [
  {
    icon: <FaGift aria-hidden />,
    title: "Free forever",
    body: "Every animal, every mode, zero cost.",
  },
  {
    icon: <FaUnlockAlt aria-hidden />,
    title: "No sign-up",
    body: "Open the page and play. That's the whole process.",
  },
  {
    icon: <FaShieldAlt aria-hidden />,
    title: "No ads",
    body: "Nothing between your kid and the animals.",
  },
  {
    icon: <FaBrain aria-hidden />,
    title: "Real practice",
    body: "Spelling, vocabulary and memory — disguised as a game.",
  },
];

/**
 * Parent-facing track (equal weight per brief): plain, honest facts only —
 * no stats or awards pic-me can't back.
 */
export default function ForGrownUps() {
  return (
    <section className="py-14 md:py-20 px-6 bg-base-200">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl mb-3">
            For grown-ups
          </h2>
          <p className="font-body max-w-prose opacity-80 mb-10">
            pic-me was built to be handed over without a second thought — here
            is everything there is to know.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FACTS.map((fact) => (
            <div
              key={fact.title}
              className="bg-base-100 rounded-2xl border-4 border-base-content p-5"
            >
              <div className="text-2xl text-primary mb-3" aria-hidden>
                {fact.icon}
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">
                {fact.title}
              </h3>
              <p className="font-body text-sm opacity-75">{fact.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
