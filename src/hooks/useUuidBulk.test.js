import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useUuidBulk from "./useUuidBulk";

const V4 = "550e8400-e29b-41d4-a716-446655440000";
const V7 = "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d";

describe("useUuidBulk", () => {
  it("starts empty with no parsed result", () => {
    const { result } = renderHook(() => useUuidBulk());
    expect(result.current.rawInput).toBe("");
    expect(result.current.parsed).toBeNull();
    expect(result.current.hasInput).toBe(false);
    expect(result.current.validCount).toBe(0);
  });

  it("parses pasted input into rows with a summary", () => {
    const { result } = renderHook(() => useUuidBulk());
    act(() => result.current.setRawInput(`${V4}\nnot-a-uuid\n${V7}`));
    expect(result.current.parsed.rows).toHaveLength(3);
    expect(result.current.parsed.summary).toEqual({
      valid: 2,
      invalid: 1,
      total: 3,
      truncated: false,
    });
    expect(result.current.validCount).toBe(2);
    expect(result.current.hasInput).toBe(true);
  });

  it("clears the input back to empty", () => {
    const { result } = renderHook(() => useUuidBulk());
    act(() => result.current.setRawInput(V4));
    act(() => result.current.clearInput());
    expect(result.current.rawInput).toBe("");
    expect(result.current.parsed).toBeNull();
  });

  it("loads a sample with both valid and invalid lines", () => {
    const { result } = renderHook(() => useUuidBulk());
    act(() => result.current.loadSample());
    expect(result.current.parsed.summary.valid).toBeGreaterThan(0);
    expect(result.current.parsed.summary.invalid).toBeGreaterThan(0);
  });

  it("toggles accept options and re-parses accordingly", () => {
    const compact = "550e8400e29b41d4a716446655440000";
    const { result } = renderHook(() => useUuidBulk());
    act(() => result.current.setRawInput(compact));
    expect(result.current.parsed.summary.valid).toBe(0);
    act(() => result.current.toggleOption("allowNoHyphens"));
    expect(result.current.options.allowNoHyphens).toBe(true);
    expect(result.current.parsed.summary.valid).toBe(1);
  });

  describe("copyValid", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue() },
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("writes only the valid UUIDs joined by newlines and flips copied", async () => {
      const { result } = renderHook(() => useUuidBulk());
      act(() => result.current.setRawInput(`${V4}\nnope\n${V7}`));

      await act(async () => {
        result.current.copyValid();
        await Promise.resolve();
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${V4}\n${V7}`);
      expect(result.current.copied).toBe(true);

      act(() => vi.advanceTimersByTime(1500));
      expect(result.current.copied).toBe(false);
    });

    it("does nothing when there are no valid UUIDs", () => {
      const { result } = renderHook(() => useUuidBulk());
      act(() => result.current.setRawInput("nope\nstill-not"));
      act(() => result.current.copyValid());
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
      expect(result.current.copied).toBe(false);
    });
  });
});
