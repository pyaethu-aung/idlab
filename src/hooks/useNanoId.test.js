import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useNanoId from "./useNanoId";
import {
  NANOID_DEFAULT_SIZE,
  NANOID_DEFAULT_COUNT,
} from "../utils/nanoid";

describe("useNanoId", () => {
  it("seeds a default batch of url-safe ids", () => {
    const { result } = renderHook(() => useNanoId());
    expect(result.current.ids).toHaveLength(NANOID_DEFAULT_COUNT);
    expect(result.current.alphabetId).toBe("url-safe");
    result.current.ids.forEach((row) =>
      expect(row.value).toHaveLength(NANOID_DEFAULT_SIZE)
    );
  });

  it("regenerate mints a fresh batch", () => {
    const { result } = renderHook(() => useNanoId());
    const before = result.current.ids.map((r) => r.value);
    act(() => result.current.regenerate());
    const after = result.current.ids.map((r) => r.value);
    expect(after).not.toEqual(before);
  });

  it("setSize changes id length and re-mints immediately", () => {
    const { result } = renderHook(() => useNanoId());
    act(() => result.current.setSize(12));
    expect(result.current.size).toBe(12);
    result.current.ids.forEach((row) =>
      expect(row.value).toHaveLength(12)
    );
  });

  it("setCount changes how many ids are produced", () => {
    const { result } = renderHook(() => useNanoId());
    act(() => result.current.setCount(3));
    expect(result.current.count).toBe(3);
    expect(result.current.ids).toHaveLength(3);
  });

  it("setAlphabet switches the symbol set and re-mints", () => {
    const { result } = renderHook(() => useNanoId());
    act(() => result.current.setAlphabet("hex"));
    expect(result.current.alphabetId).toBe("hex");
    result.current.ids.forEach((row) =>
      expect(row.value).toMatch(/^[0-9a-f]+$/)
    );
  });

  it("exposes entropy stats for the current config", () => {
    const { result } = renderHook(() => useNanoId());
    // 21 url-safe chars → 64 symbols, ~126 bits.
    expect(result.current.stats.alphabetSize).toBe(64);
    expect(result.current.stats.bits).toBeCloseTo(126, 5);
    expect(result.current.stats.collisionExp).toBeCloseTo(18.12, 1);
  });

  it("recomputes stats when the alphabet narrows", () => {
    const { result } = renderHook(() => useNanoId());
    act(() => result.current.setAlphabet("numbers"));
    expect(result.current.stats.alphabetSize).toBe(10);
    expect(result.current.stats.bits).toBeCloseTo(
      NANOID_DEFAULT_SIZE * Math.log2(10),
      5
    );
  });
});
