// @ts-nocheck
import { create } from "zustand";

const THEME_STORAGE_KEY = "picme.theme";

const toToken = (v) => {
  if (!v) return "cmyk";
  if (v === "light" || v === "cmyk") return "cmyk";
  if (v === "dark" || v === "dracula") return "dracula";
  return "cmyk";
};

const applyTheme = (token) => {
  try {
    const themeName = token === "dracula" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeName);
    if (themeName === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch {
    // ignore (SSR)
  }
};

export const useUIStore = create((set) => {
  let initial = "cmyk";
  try {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(THEME_STORAGE_KEY)
        : null;
    if (stored) {
      initial = toToken(stored);
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
      } catch {}
      applyTheme(token);
      set({ theme: token });
    },
    toggle: () => {
      set((state) => {
        const next = state.theme === "cmyk" ? "dracula" : "cmyk";
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {}
        applyTheme(next);
        return { theme: next };
      });
    },
  };
});
