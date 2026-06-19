import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import useUlid, { ULID_SAMPLES } from "./useUlid";

const V7_UUID = "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d";

describe("useUlid", () => {
  it("seeds a freshly generated ULID that decodes", () => {
    const { result } = renderHook(() => useUlid());
    expect(result.current.rawInput).toHaveLength(26);
    expect(result.current.result).toMatchObject({ valid: true, kind: "ulid" });
    expect(result.current.hasInput).toBe(true);
    expect(result.current.activeSample).toBeNull();
  });

  it("inspects a pasted UUIDv7 as a conversion", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.setRawInput(V7_UUID));
    expect(result.current.result).toMatchObject({
      valid: true,
      kind: "uuidv7",
      uuid: V7_UUID,
    });
  });

  it("returns an invalid result for unrelated input", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.setRawInput("nope"));
    expect(result.current.result.valid).toBe(false);
  });

  it("treats whitespace-only input as empty", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.setRawInput("   "));
    expect(result.current.result).toBeNull();
    expect(result.current.hasInput).toBe(false);
  });

  it("generate replaces the input with a new ULID", () => {
    const { result } = renderHook(() => useUlid());
    const first = result.current.rawInput;
    act(() => result.current.generate());
    expect(result.current.rawInput).not.toBe(first);
    expect(result.current.result).toMatchObject({ valid: true, kind: "ulid" });
  });

  it("clearInput empties the field", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.clearInput());
    expect(result.current.rawInput).toBe("");
    expect(result.current.result).toBeNull();
  });

  it("loadSample sets the value and marks it active", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.loadSample("uuidv7"));
    expect(result.current.rawInput).toBe(V7_UUID);
    expect(result.current.activeSample).toBe("uuidv7");
  });

  it("ignores an unknown sample id", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.loadSample("bogus"));
    expect(result.current.activeSample).toBeNull();
  });

  it("clears the active sample when the input is edited away", () => {
    const { result } = renderHook(() => useUlid());
    act(() => result.current.loadSample("ulid"));
    expect(result.current.activeSample).toBe("ulid");
    act(() => result.current.setRawInput("edited"));
    expect(result.current.activeSample).toBeNull();
  });

  it("keeps the active sample when the input matches it", () => {
    const { result } = renderHook(() => useUlid());
    const sample = ULID_SAMPLES[0];
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
      const { result } = renderHook(() => useUlid());
      await act(async () => {
        result.current.copyValue("uuid", V7_UUID);
        await Promise.resolve();
      });
      expect(writeText).toHaveBeenCalledWith(V7_UUID);
      expect(result.current.copiedKey).toBe("uuid");
      act(() => vi.advanceTimersByTime(1500));
      expect(result.current.copiedKey).toBeNull();
      vi.useRealTimers();
    });

    it("does nothing without a value or clipboard", () => {
      const { result } = renderHook(() => useUlid());
      act(() => result.current.copyValue("uuid", ""));
      expect(result.current.copiedKey).toBeNull();
      delete navigator.clipboard;
      act(() => result.current.copyValue("uuid", V7_UUID));
      expect(result.current.copiedKey).toBeNull();
    });
  });
});
