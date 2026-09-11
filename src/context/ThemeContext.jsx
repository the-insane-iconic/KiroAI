import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "emerald",
  setTheme: () => {},
  availableThemes: [],
});

export const AVAILABLE_THEMES = [
  { id: "emerald", name: "Dark Emerald", icon: "🌲", badge: "Default" },
  { id: "midnight", name: "Cyber Midnight", icon: "🌌", badge: "Deep Dark" },
  { id: "light", name: "Clean Light", icon: "☀️", badge: "Light" },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("app_theme");
      if (saved && ["emerald", "midnight", "light"].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // fallback
    }
    return "emerald";
  });

  const setTheme = (newTheme) => {
    if (!["emerald", "midnight", "light"].includes(newTheme)) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem("app_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch (e) {
      console.warn("Could not persist theme to localStorage:", e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("app_theme", theme);
    } catch (e) {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: AVAILABLE_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
