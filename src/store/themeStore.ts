import { create } from "zustand";
import { persistence } from "../game-core/persistence";

type ThemeSchemes = "light" | "dark";
type ThemeToken = "cmyk" | "dracula";

interface ThemeState {
  theme: ThemeToken;
  setTheme: (theme: ThemeSchemes | ThemeToken) => void;
  toggle: () => void;
}

// Legacy key/format contract: index.html's anti-FOUC script reads this exact
// key (bare token string) from localStorage before React mounts. The module's
// raw methods preserve those exact bytes. Do not change one without the other.
const THEME_STORAGE_KEY = "picme.theme";

const toToken = (v?: string | null): ThemeToken => {
  if (!v) return "cmyk";
  if (v === "light" || v === "cmyk") return "cmyk";
  if (v === "dark" || v === "dracula") return "dracula";
  return "cmyk";
};

const applyTheme = (token: ThemeToken) => {
  try {
    // Map stored token (palette) to the daisyUI theme name used in CSS
    const themeName: ThemeSchemes = token === "dracula" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeName);
    // Keep Tailwind's `dark` class in sync for any `dark:` styles
    if (themeName === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch {
    /* ignore during SSR */
  }
};

export const useUIStore = create<ThemeState>((set) => {
  let initial: ThemeToken = toToken(persistence.config.loadRaw(THEME_STORAGE_KEY));
  if (!persistence.config.loadRaw(THEME_STORAGE_KEY)) {
    try {
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        initial = "dracula";
      }
    } catch {
      /* matchMedia unavailable */
    }
  }
  applyTheme(initial);

  const persist = (token: ThemeToken) =>
    persistence.config.saveRaw(THEME_STORAGE_KEY, token);

  return {
    theme: initial,
    setTheme: (t) => {
      const token = toToken(t);
      persist(token);
      applyTheme(token);
      set({ theme: token });
    },
    toggle: () => {
      set((state) => {
        const next: ThemeToken = state.theme === "cmyk" ? "dracula" : "cmyk";
        persist(next);
        applyTheme(next);
        return { theme: next };
      });
    },
  };
});
