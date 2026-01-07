import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm w-full">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">PicMe</a>
      </div>
      <div className="flex gap-4">
        <ThemeToggle />
        <a>Link</a>
      </div>
    </div>
  );
}
