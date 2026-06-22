import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "idlab-theme";
// Read once for users who stored a preference under the pre-rename key, so the
// rebrand doesn't reset their theme. The persist effect rewrites it under
// THEME_KEY on first render, making the migration one-time.
const LEGACY_THEME_KEY = "uuid-generator-theme";
const THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

const applyThemeAttribute = (theme) => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
};

const resolveInitialTheme = () => {
  if (typeof window === "undefined") {
    applyThemeAttribute(THEMES.DARK);
    return THEMES.DARK;
  }

  try {
    const stored =
      window.localStorage.getItem(THEME_KEY) ??
      window.localStorage.getItem(LEGACY_THEME_KEY);
    if (stored === THEMES.DARK || stored === THEMES.LIGHT) {
      applyThemeAttribute(stored);
      return stored;
    }
  } catch (error) {
    console.warn("Unable to read theme preference", error);
  }

  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches;
  const fallback = prefersDark ? THEMES.DARK : THEMES.LIGHT;
  applyThemeAttribute(fallback);
  return fallback;
};

function useTheme() {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    applyThemeAttribute(theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn("Unable to persist theme preference", error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    );
  }, []);

  return {
    theme,
    isDark: theme === THEMES.DARK,
    toggleTheme,
  };
}

export default useTheme;
