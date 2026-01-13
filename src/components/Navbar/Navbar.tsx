import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Navbar() {
  return (
    <div className="navbar shadow-sm w-full items-center align-middle p-4">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl text-amber-500 p-0">PicMe</a>
      </div>
      <div className="flex gap-4 items-center">
        <ThemeToggle />
        <a className="text-amber-500">Link</a>
      </div>
    </div>
  );
}
