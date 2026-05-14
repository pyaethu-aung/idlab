import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useUuidValidator from "./useUuidValidator";

const V4 = "550e8400-e29b-41d4-a716-446655440000";
const V7 = "01901b7c-d400-7000-8000-000000000001";
const V1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const NIL = "00000000-0000-0000-0000-000000000000";

describe("useUuidValidator", () => {
  it("starts with a generated v7 UUID and no active sample", () => {
    const { result } = renderHook(() => useUuidValidator());
    expect(result.current.rawInput).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(result.current.activeSample).toBeNull();
    expect(result.current.result?.version).toBe(7);
  });

  it("returns valid result for a v4 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V4));
    expect(result.current.result.valid).toBe(true);
    expect(result.current.result.version).toBe(4);
  });

  it("returns invalid result for garbage input", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput("not-a-uuid"));
    expect(result.current.result.valid).toBe(false);
  });

  it("validates a nil UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(NIL));
    expect(result.current.result.valid).toBe(true);
  });

  it("accepts braced input by default", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(`{${V4}}`));
    expect(result.current.result.valid).toBe(true);
  });

  it("resets result to null when input is cleared", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V4));
    expect(result.current.result).not.toBeNull();
    act(() => result.current.setRawInput(""));
    expect(result.current.result).toBeNull();
  });

  it("returns decoded data for a v7 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V7));
    expect(result.current.result.version).toBe(7);
    expect(result.current.result.decoded).not.toBeNull();
  });

  it("returns decoded data for a v1 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V1));
    expect(result.current.result.version).toBe(1);
    expect(result.current.result.decoded.node).toBe("00c04fd430c8");
  });

  it("starts with default options", () => {
    const { result } = renderHook(() => useUuidValidator());
    expect(result.current.options.strictRfc).toBe(false);
    expect(result.current.options.allowBraces).toBe(true);
    expect(result.current.options.allowNoHyphens).toBe(false);
  });

  it("toggleOption flips a single option", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.toggleOption("strictRfc"));
    expect(result.current.options.strictRfc).toBe(true);
    act(() => result.current.toggleOption("strictRfc"));
    expect(result.current.options.strictRfc).toBe(false);
  });

  it("strictRfc option rejects non-RFC variants", () => {
    const ncs = "00000000-0000-1000-0000-000000000000";
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(ncs));
    expect(result.current.result.valid).toBe(true);
    act(() => result.current.toggleOption("strictRfc"));
    expect(result.current.result.valid).toBe(false);
  });

  it("allowNoHyphens option accepts compact form", () => {
    const compact = V4.replace(/-/g, "");
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(compact));
    expect(result.current.result.valid).toBe(false);
    act(() => result.current.toggleOption("allowNoHyphens"));
    expect(result.current.result.valid).toBe(true);
  });

  it("loadSample sets the input and activeSample", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSample("v4"));
    expect(result.current.rawInput).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.current.activeSample).toBe("v4");
  });

  it("clears activeSample when user manually edits input", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSample("v7"));
    expect(result.current.activeSample).toBe("v7");
    act(() => result.current.setRawInput("something-else"));
    expect(result.current.activeSample).toBeNull();
  });

  it("exposes checkCount, copied, and recheck", () => {
    const { result } = renderHook(() => useUuidValidator());
    expect(typeof result.current.checkCount).toBe("number");
    expect(result.current.copied).toBe(false);
    expect(typeof result.current.recheck).toBe("function");
  });
});
