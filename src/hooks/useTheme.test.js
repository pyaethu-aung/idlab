import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useTheme from "./useTheme";

const THEME_KEY = "idlab-theme";
const LEGACY_THEME_KEY = "uuid-generator-theme";

const matchMediaMock =
  (matches = false) =>
  () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
};

describe("useTheme", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    document.documentElement.dataset.theme = "";
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: matchMediaMock(false),
    });
  });

  it("hydrates the theme from localStorage when available", () => {
    window.localStorage.setItem(THEME_KEY, "light");
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("migrates a theme stored under the legacy pre-rename key", () => {
    window.localStorage.setItem(LEGACY_THEME_KEY, "light");
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
    // The persist effect rewrites it under the new key, so it is a one-time read.
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("falls back to system preference and persists toggles", () => {
    window.localStorage.removeItem(THEME_KEY);
    window.matchMedia = matchMediaMock(true);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("ignores invalid explicit theme assignments", () => {
    const { result } = renderHook(() => useTheme());
    const initialTheme = result.current.theme;

    act(() => {
      result.current.setTheme("purple");
    });

    expect(result.current.theme).toBe(initialTheme);
  });
});
