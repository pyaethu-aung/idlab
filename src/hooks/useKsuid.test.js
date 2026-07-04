import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import useKsuid, { KSUID_SAMPLES } from "./useKsuid";

describe("useKsuid", () => {
  it("seeds a freshly generated KSUID that decodes", () => {
    const { result } = renderHook(() => useKsuid());
    expect(result.current.rawInput).toHaveLength(27);
    expect(result.current.result).toMatchObject({ valid: true });
    expect(result.current.hasInput).toBe(true);
    expect(result.current.activeSample).toBeNull();
  });

  it("returns an invalid result for unrelated input", () => {
    const { result } = renderHook(() => useKsuid());
    act(() => result.current.setRawInput("nope"));
    expect(result.current.result.valid).toBe(false);
  });

  it("treats whitespace-only input as empty", () => {
    const { result } = renderHook(() => useKsuid());
    act(() => result.current.setRawInput("   "));
    expect(result.current.result).toBeNull();
    expect(result.current.hasInput).toBe(false);
  });

  it("generate replaces the input with a new KSUID", () => {
    const { result } = renderHook(() => useKsuid());
    const first = result.current.rawInput;
    act(() => result.current.generate());
    expect(result.current.rawInput).not.toBe(first);
    expect(result.current.result).toMatchObject({ valid: true });
  });

  it("clearInput empties the field", () => {
    const { result } = renderHook(() => useKsuid());
    act(() => result.current.clearInput());
    expect(result.current.rawInput).toBe("");
    expect(result.current.result).toBeNull();
  });

  it("loadSample sets the value and marks it active", () => {
    const { result } = renderHook(() => useKsuid());
    const sample = KSUID_SAMPLES[0];
    act(() => result.current.loadSample(sample.id));
    expect(result.current.rawInput).toBe(sample.value);
    expect(result.current.activeSample).toBe(sample.id);
  });

  it("ignores an unknown sample id", () => {
    const { result } = renderHook(() => useKsuid());
    act(() => result.current.loadSample("bogus"));
    expect(result.current.activeSample).toBeNull();
  });

  it("clears the active sample when the input is edited away", () => {
    const { result } = renderHook(() => useKsuid());
    const sample = KSUID_SAMPLES[0];
    act(() => result.current.loadSample(sample.id));
    expect(result.current.activeSample).toBe(sample.id);
    act(() => result.current.setRawInput("edited"));
    expect(result.current.activeSample).toBeNull();
  });

  it("keeps the active sample when the input matches it", () => {
    const { result } = renderHook(() => useKsuid());
    const sample = KSUID_SAMPLES[0];
    act(() => result.current.loadSample(sample.id));
    act(() => result.current.setRawInput(sample.value));
    expect(result.current.activeSample).toBe(sample.id);
  });

  describe("copyValue", () => {
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

    it("writes the value and sets copiedKey, then resets after 1500ms", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useKsuid());
      const value = result.current.rawInput;
      await act(async () => {
        result.current.copyValue("ksuid", value);
        await Promise.resolve();
      });
      expect(writeText).toHaveBeenCalledWith(value);
      expect(result.current.copiedKey).toBe("ksuid");
      act(() => vi.advanceTimersByTime(1500));
      expect(result.current.copiedKey).toBeNull();
      vi.useRealTimers();
    });

    it("does nothing without a value or clipboard", () => {
      const { result } = renderHook(() => useKsuid());
      act(() => result.current.copyValue("ksuid", ""));
      expect(result.current.copiedKey).toBeNull();
      delete navigator.clipboard;
      act(() => result.current.copyValue("ksuid", "2YBXZIdZpuEB0Z0gxchzBCwPdBh"));
      expect(result.current.copiedKey).toBeNull();
    });
  });
});
