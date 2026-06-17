import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import useUuidConverter from "./useUuidConverter";

const V4 = "550e8400-e29b-41d4-a716-446655440000";
const NIL = "00000000-0000-0000-0000-000000000000";

describe("useUuidConverter", () => {
  it("starts with empty input and no conversions", () => {
    const { result } = renderHook(() => useUuidConverter());
    expect(result.current.rawInput).toBe("");
    expect(result.current.conversions).toBeNull();
    expect(result.current.hasInput).toBe(false);
    expect(result.current.copiedKey).toBeNull();
  });

  it("computes conversions for a valid UUID", () => {
    const { result } = renderHook(() => useUuidConverter());
    act(() => result.current.setRawInput(V4));
    expect(result.current.conversions).not.toBeNull();
    expect(result.current.conversions.canonical).toBe(V4);
    expect(result.current.hasInput).toBe(true);
  });

  it("returns null conversions for invalid input", () => {
    const { result } = renderHook(() => useUuidConverter());
    act(() => result.current.setRawInput("not-a-uuid"));
    expect(result.current.conversions).toBeNull();
    expect(result.current.hasInput).toBe(true);
  });

  it("returns null conversions for whitespace-only input", () => {
    const { result } = renderHook(() => useUuidConverter());
    act(() => result.current.setRawInput("   "));
    expect(result.current.conversions).toBeNull();
    expect(result.current.hasInput).toBe(false);
  });

  it("clearInput resets rawInput", () => {
    const { result } = renderHook(() => useUuidConverter());
    act(() => result.current.setRawInput(V4));
    act(() => result.current.clearInput());
    expect(result.current.rawInput).toBe("");
    expect(result.current.conversions).toBeNull();
  });

  it("accepts braced and compact forms", () => {
    const { result } = renderHook(() => useUuidConverter());
    act(() => result.current.setRawInput(`{${NIL}}`));
    expect(result.current.conversions?.canonical).toBe(NIL);
    act(() => result.current.setRawInput(NIL.replace(/-/g, "")));
    expect(result.current.conversions?.canonical).toBe(NIL);
  });

  describe("copyRow", () => {
    let writeText;

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      delete navigator.clipboard;
    });

    it("writes the value to clipboard and sets copiedKey", async () => {
      const { result } = renderHook(() => useUuidConverter());
      act(() => result.current.setRawInput(V4));

      await act(async () => {
        result.current.copyRow("canonical", V4);
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith(V4);
      expect(result.current.copiedKey).toBe("canonical");
    });

    it("resets copiedKey after 1500ms", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUuidConverter());
      act(() => result.current.setRawInput(V4));

      await act(async () => {
        result.current.copyRow("compact", V4.replace(/-/g, ""));
        await Promise.resolve();
      });

      expect(result.current.copiedKey).toBe("compact");
      act(() => vi.advanceTimersByTime(1500));
      expect(result.current.copiedKey).toBeNull();
      vi.useRealTimers();
    });

    it("does nothing when clipboard is unavailable", () => {
      delete navigator.clipboard;
      const { result } = renderHook(() => useUuidConverter());
      act(() => result.current.setRawInput(V4));
      act(() => result.current.copyRow("canonical", V4));
      expect(result.current.copiedKey).toBeNull();
    });
  });

  it("exposes all 9 representation keys when valid", () => {
    const { result } = renderHook(() => useUuidConverter());
    act(() => result.current.setRawInput(V4));
    const keys = Object.keys(result.current.conversions);
    expect(keys).toEqual([
      "canonical", "compact", "upper", "braces",
      "urn", "base64", "base32", "integer", "bytes",
    ]);
  });
});
