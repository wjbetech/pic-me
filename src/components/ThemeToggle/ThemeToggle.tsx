import type { JSX } from "react";
import { useUIStore } from "../../store/themeStore";

export default function ThemeToggle({
  onPhoto = false,
}: {
  /** White-with-shadow treatment for sitting on the hero photo (navbar overlay). */
  onPhoto?: boolean;
}): JSX.Element {
  const theme = useUIStore((s) => s.theme); // 'cmyk' | 'dracula'
  const toggle = useUIStore((s) => s.toggle);

  return (
    <div
      className={`flex gap-2 items-center ${
        onPhoto ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" : ""
      }`}
    >
      <span className={onPhoto ? "" : "text-base-content"}>
        {theme === "dracula" ? "Dark" : "Light"}
      </span>
      <input
        aria-label="Toggle theme"
        className="toggle"
        type="checkbox"
        onClick={toggle}
        title={`Switch to ${theme === "cmyk" ? "dark" : "light"} theme`}
      ></input>
    </div>
  );
}
