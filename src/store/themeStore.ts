import { create } from "zustand";

type ThemeSchemes = "light" | "dark";
type ThemeToken = "cmyk" | "dracula";

interface ThemeState {
  theme: ThemeToken; // <- fixed: store holds daisyUI token values
  setTheme: (theme: ThemeSchemes | ThemeToken) => void;
  toggle: () => void;
}

const THEME_STORAGE_KEY = "picme.theme";

const toToken = (v?: ThemeSchemes | ThemeToken | null): ThemeToken => {
  if (!v) return "cmyk";
  if (v === "light" || v === "cmyk") return "cmyk";
  if (v === "dark" || v === "dracula") return "dracula";
  return "cmyk";
};

const applyTheme = (token: ThemeToken) => {
  try {
    // Map stored token (palette) to the daisyUI theme name used in CSS
    const themeName = token === "dracula" ? "dark" : "light";
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
  // determine initial token
  let initial: ThemeToken = "cmyk";
  try {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(THEME_STORAGE_KEY)
        : null;
    if (stored) {
      initial = toToken(stored as ThemeToken | ThemeSchemes);
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      initial = "dracula";
    }
    applyTheme(initial);
  } catch {
    initial = "cmyk";
  }

  return {
    theme: initial,
    setTheme: (t) => {
      const token = toToken(t);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, token);
      } catch {
        console.log("failed to persist theme");
      }
      applyTheme(token);
      set({ theme: token });
    },
    toggle: () => {
      set((state) => {
        const next: ThemeToken = state.theme === "cmyk" ? "dracula" : "cmyk";
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          console.log("failed to persist theme");
        }
        applyTheme(next);
        return { theme: next };
      });
    },
  };
});
