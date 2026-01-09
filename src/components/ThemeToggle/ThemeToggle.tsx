import type { JSX } from "react";
import { useUIStore } from "../../store/themeStore";

export default function ThemeToggle(): JSX.Element {
  const theme = useUIStore((s) => s.theme); // 'cmyk' | 'dracula'
  const toggle = useUIStore((s) => s.toggle);

  return (
    <div className="flex gap-2">
      <span className="text-base-content">
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
