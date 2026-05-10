import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import useBrowserThemeSync from "./useBrowserThemeSync";

describe("useBrowserThemeSync", () => {
  let metaTag;

  beforeEach(() => {
    metaTag = document.createElement("meta");
    metaTag.setAttribute("name", "theme-color");
    document.head.appendChild(metaTag);

    vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({
      getPropertyValue: (prop) => {
        if (prop === "--bg") return "#1a1a1a";
        return "";
      },
    }));
  });

  afterEach(() => {
    if (document.head.contains(metaTag)) {
      document.head.removeChild(metaTag);
    }
    vi.restoreAllMocks();
  });

  it("sets theme-color to the --bg value", () => {
    renderHook(() => useBrowserThemeSync("dark"));

    expect(metaTag.getAttribute("content")).toBe("#1a1a1a");
  });

  it("creates meta tag if none exists", () => {
    document.head.removeChild(metaTag);

    renderHook(() => useBrowserThemeSync("dark"));

    const created = document.querySelector('meta[name="theme-color"]');
    expect(created).not.toBeNull();
    expect(created.getAttribute("content")).toBe("#1a1a1a");

    metaTag = created;
  });

  it("updates theme-color when theme changes", () => {
    const { rerender } = renderHook(
      ({ theme }) => useBrowserThemeSync(theme),
      { initialProps: { theme: "dark" } }
    );

    expect(metaTag.getAttribute("content")).toBe("#1a1a1a");

    vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({
      getPropertyValue: (prop) => {
        if (prop === "--bg") return "#fafafa";
        return "";
      },
    }));

    rerender({ theme: "light" });

    expect(metaTag.getAttribute("content")).toBe("#fafafa");
  });
});
