import { create } from "zustand";

type Theme = "light" | "dark";

const usePicMeStore = create((set) => ({
  theme: "light" as "light" | "dark",
  toggleTheme: () =>
    set((state: { theme: Theme }) => ({
      theme: state.theme === "light" ? "dark" : "light"
    }))
}));

export default usePicMeStore;
