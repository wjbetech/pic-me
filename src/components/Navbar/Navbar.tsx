import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Navbar({ onHome }: { onHome?: () => void }) {
  return (
    <div className="navbar bg-base-100 shadow-md w-full items-center align-middle p-4 z-10">
      <div className="flex-1">
        <button
          onClick={() => onHome && onHome()}
          className="btn btn-ghost text-2xl md:text-3xl text-amber-500 p-0"
          aria-label="PicMe Home"
        >
          PicMe
        </button>
      </div>
      <div className="flex gap-4 items-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
