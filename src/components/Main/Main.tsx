import { FaGamepad, FaVolumeUp, FaGraduationCap } from "react-icons/fa";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Main({ onStart }: { onStart?: () => void }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-base-300 text-center p-4 overflow-y-auto">
      <div className="hero-content text-center flex-col max-w-md w-full">
        <div className="w-full rounded-lg p-6 bg-linear-to-br from-primary/6 to-secondary/6 mb-4">
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 md:mb-3">
            PicMe
          </h1>
          <p className="text-md md:text-lg mb-0 text-base-content/80">
            Play quick rounds to learn animal names — no sign-in required.
          </p>
        </div>

        <MotionDiv
          className="grid gap-3 md:gap-6 mb-6 md:mb-8 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <MotionDiv
            className="card bg-base-100 shadow-lg md:shadow-xl border border-base-content/10 transform transition-shadow duration-200 hover:shadow-xl"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="card-body p-3 md:p-4 flex flex-row items-center gap-3 md:gap-4">
              <div className="text-xl md:text-2xl text-secondary">
                <FaGamepad />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm md:text-base">
                  Multiple Modes
                </h3>
                <p className="text-xs md:text-sm opacity-70">
                  Challenge yourself in different ways
                </p>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            className="card bg-base-100 shadow-lg md:shadow-xl border border-base-content/10 transform transition-shadow duration-200 hover:shadow-xl"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="card-body p-3 md:p-4 flex flex-row items-center gap-3 md:gap-4">
              <div className="text-xl md:text-2xl text-info">
                <FaGraduationCap />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm md:text-base">Learn & Play</h3>
                <p className="text-xs md:text-sm opacity-70">
                  Fun educational platform for all ages
                </p>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            className="card bg-base-100 shadow-lg md:shadow-xl border border-base-content/10 opacity-60 transform transition-shadow duration-200"
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="card-body p-3 md:p-4 flex flex-row items-center gap-3 md:gap-4">
              <div className="text-xl md:text-2xl text-accent">
                <FaVolumeUp />
              </div>
              <div className="text-left opacity-30">
                <h3 className="font-bold text-sm md:text-base">
                  <span className="text-xs uppercase opacity-70 mr-2">
                    (COMING SOON)
                  </span>
                  Immersive Sounds
                </h3>
                <p className="text-xs md:text-sm opacity-70">
                  Coming soon — feature not yet implemented
                </p>
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>

        <button
          className="btn btn-primary btn-wide text-xl shadow-lg"
          onClick={() => onStart && onStart()}
        >
          Start Playing
        </button>
      </div>
    </div>
  );
}
