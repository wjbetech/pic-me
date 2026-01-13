import { FaGamepad, FaVolumeUp, FaGraduationCap } from "react-icons/fa";

export default function Main() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-base-300 text-center p-4 overflow-y-auto">
      <div className="hero-content text-center flex-col max-w-md w-full">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 md:mb-6">
          PicMe
        </h1>
        <p className="text-lg md:text-xl mb-6 md:mb-8 text-base-content/80">
          The ultimate animal name guessing game!
        </p>

        <div className="grid gap-3 md:gap-6 mb-6 md:mb-8 w-full">
          <div className="card bg-base-100 shadow-lg md:shadow-xl border border-base-content/10">
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
          </div>

          <div className="card bg-base-100 shadow-lg md:shadow-xl border border-base-content/10">
            <div className="card-body p-3 md:p-4 flex flex-row items-center gap-3 md:gap-4">
              <div className="text-xl md:text-2xl text-accent">
                <FaVolumeUp />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm md:text-base">
                  Immersive Sounds
                </h3>
                <p className="text-xs md:text-sm opacity-70">
                  Learn animal sounds as you play
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg md:shadow-xl border border-base-content/10">
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
          </div>
        </div>

        <button className="btn btn-primary btn-wide text-lg shadow-lg">
          Start Playing
        </button>
      </div>
    </div>
  );
}
