// @ts-nocheck
import React, { createContext, useContext } from "react";
import { useUIStore } from "../store/themeStore";

const ThemeContext = createContext(undefined);
ThemeContext.displayName = "ThemeContext";

export const ThemeProvider = ({ children }) => {
  const theme = useUIStore((s) => s.theme);
  const toggle = useUIStore((s) => s.toggle);

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, toggle } },
    children
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined)
    throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
