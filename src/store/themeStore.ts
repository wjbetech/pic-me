import { create } from "zustand";

type Theme = "light" | "dark";

export const useThemeStore = create((set) => {
  return {
    theme: "light",
    toggleTheme: () =>
      set((state: Theme) => ({
        theme: state === "light" ? "dark" : "light"
      }))
  };
});
