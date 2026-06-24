import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useCodeSnippets from "./useCodeSnippets";
import { snippetsFor } from "../data/codeSnippets";

describe("useCodeSnippets", () => {
  let writeText;

  beforeEach(() => {
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete navigator.clipboard;
  });

  it("exposes the rows when given an array, and null when given null", () => {
    const { result } = renderHook(() => useCodeSnippets(snippetsFor("v4")));
    expect(Array.isArray(result.current.rows)).toBe(true);

    const nil = renderHook(() => useCodeSnippets(null));
    expect(nil.result.current.rows).toBeNull();
  });

  it("defaults to full mode and toggleFull flips it", () => {
    const { result } = renderHook(() => useCodeSnippets(snippetsFor("v4")));
    expect(result.current.full).toBe(true);

    act(() => result.current.toggleFull());
    expect(result.current.full).toBe(false);

    act(() => result.current.toggleFull());
    expect(result.current.full).toBe(true);
  });

  it("copyDefault copies the js full program in full mode", () => {
    const rows = snippetsFor("v4");
    const { result } = renderHook(() => useCodeSnippets(rows));
    const jsRow = result.current.rows.find((r) => r.lang === "js");

    act(() => result.current.copyDefault());
    expect(writeText).toHaveBeenCalledWith(jsRow.full);
  });

  it("copyDefault copies the js one-liner in inline mode", () => {
    const rows = snippetsFor("v4");
    const { result } = renderHook(() => useCodeSnippets(rows));
    const jsRow = result.current.rows.find((r) => r.lang === "js");

    act(() => result.current.toggleFull()); // -> inline
    act(() => result.current.copyDefault());
    expect(writeText).toHaveBeenCalledWith(jsRow.code);
  });

  it("copyDefault is a no-op when rows is null", () => {
    const { result } = renderHook(() => useCodeSnippets(null));
    act(() => result.current.copyDefault());
    expect(writeText).not.toHaveBeenCalled();
  });

  it("flags clipboardError when the clipboard API is unavailable", () => {
    delete navigator.clipboard;
    const { result } = renderHook(() => useCodeSnippets(snippetsFor("v4")));

    act(() => result.current.copy("js", "anything"));
    expect(result.current.clipboardError).toBe(true);
  });
});
