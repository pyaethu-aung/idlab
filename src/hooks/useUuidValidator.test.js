import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import useUuidValidator from "./useUuidValidator";

const V4 = "550e8400-e29b-41d4-a716-446655440000";
const V7 = "01901b7c-d400-7000-8000-000000000001";
const V1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const NIL = "00000000-0000-0000-0000-000000000000";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
    writable: true,
  });
});

describe("useUuidValidator", () => {
  // ── Single UUID: a "list of one" that auto-expands into the full inspector ──
  it("starts with a generated v7 UUID that auto-expands", () => {
    const { result } = renderHook(() => useUuidValidator());
    expect(result.current.rawInput).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(result.current.activeSample).toBeNull();
    expect(result.current.summary).toMatchObject({ valid: 1, invalid: 0, total: 1 });
    expect(result.current.expandedResult?.version).toBe(7);
  });

  it("returns a valid expanded result for a v4 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V4));
    expect(result.current.expandedResult.valid).toBe(true);
    expect(result.current.expandedResult.version).toBe(4);
  });

  it("returns an invalid expanded result for garbage input", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput("not-a-uuid"));
    expect(result.current.summary).toMatchObject({ valid: 0, invalid: 1 });
    expect(result.current.expandedResult.valid).toBe(false);
  });

  it("validates a nil UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(NIL));
    expect(result.current.expandedResult.valid).toBe(true);
  });

  it("accepts braced input by default", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(`{${V4}}`));
    expect(result.current.expandedResult.valid).toBe(true);
  });

  it("resets to an empty parse when input is cleared", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V4));
    expect(result.current.parsed).not.toBeNull();
    act(() => result.current.clearInput());
    expect(result.current.parsed).toBeNull();
    expect(result.current.expandedResult).toBeNull();
  });

  it("returns decoded data for a v7 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V7));
    expect(result.current.expandedResult.version).toBe(7);
    expect(result.current.expandedResult.decoded).not.toBeNull();
  });

  it("returns decoded data for a v1 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V1));
    expect(result.current.expandedResult.version).toBe(1);
    expect(result.current.expandedResult.decoded.node).toBe("00c04fd430c8");
  });

  // ── Options ────────────────────────────────────────────────────────────────
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
    expect(result.current.expandedResult.valid).toBe(true);
    act(() => result.current.toggleOption("strictRfc"));
    expect(result.current.expandedResult.valid).toBe(false);
  });

  it("allowNoHyphens option accepts compact form", () => {
    const compact = V4.replace(/-/g, "");
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(compact));
    expect(result.current.expandedResult.valid).toBe(false);
    act(() => result.current.toggleOption("allowNoHyphens"));
    expect(result.current.expandedResult.valid).toBe(true);
  });

  // ── Samples ──────────────────────────────────────────────────────────────
  it("loadSample sets the input and activeSample", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSample("v4"));
    expect(result.current.rawInput).toBe(V4);
    expect(result.current.activeSample).toBe("v4");
    expect(result.current.expandedResult.version).toBe(4);
  });

  it("loadSample('max') loads the max sentinel and decodes as max", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSample("max"));
    expect(result.current.rawInput).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
    expect(result.current.activeSample).toBe("max");
    expect(result.current.expandedResult.valid).toBe(true);
    expect(result.current.expandedResult.version).toBe(15);
  });

  it("loadSampleList loads a mixed valid/invalid list", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSampleList());
    expect(result.current.activeSample).toBeNull();
    expect(result.current.summary.total).toBeGreaterThan(1);
    expect(result.current.summary.valid).toBeGreaterThan(0);
    expect(result.current.summary.invalid).toBeGreaterThan(0);
  });

  it("clears activeSample when user manually edits input", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSample("v7"));
    expect(result.current.activeSample).toBe("v7");
    act(() => result.current.setRawInput("something-else"));
    expect(result.current.activeSample).toBeNull();
  });

  it("exposes checkCount and copy state", () => {
    const { result } = renderHook(() => useUuidValidator());
    expect(typeof result.current.checkCount).toBe("number");
    expect(result.current.copiedAll).toBe(false);
    expect(result.current.copiedLine).toBeNull();
  });

  // ── Conversion (driven by the expanded row) ────────────────────────────────
  it("offers a v6 conversion for a valid v1 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V1));
    expect(result.current.conversion).toMatchObject({ from: 1, to: 6 });
    expect(result.current.conversion.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("offers a v1 conversion for a valid v6 UUID", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.loadSample("v6"));
    expect(result.current.expandedResult.version).toBe(6);
    expect(result.current.conversion).toMatchObject({ from: 6, to: 1 });
  });

  it("offers no conversion for non-time versions", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput(V4));
    expect(result.current.conversion).toBeNull();
  });

  it("offers no conversion when input is invalid", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput("not-a-uuid"));
    expect(result.current.conversion).toBeNull();
  });

  // ── Many UUIDs: triage list with collapse-by-default + per-row expand ──────
  it("parses many lines into a summary without auto-expanding", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput([V4, V1, "not-a-uuid"].join("\n")));
    expect(result.current.summary).toMatchObject({ valid: 2, invalid: 1, total: 3 });
    expect(result.current.expandedLine).toBeNull();
    expect(result.current.expandedResult).toBeNull();
  });

  it("toggleRow expands a chosen row and collapses it again", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput([V4, V1, "not-a-uuid"].join("\n")));

    act(() => result.current.toggleRow(1));
    expect(result.current.expandedLine).toBe(1);
    expect(result.current.expandedResult.version).toBe(4);

    act(() => result.current.toggleRow(1));
    expect(result.current.expandedLine).toBeNull();
    expect(result.current.expandedResult).toBeNull();
  });

  it("copyValid writes only the valid UUIDs to the clipboard", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput([V4, "not-a-uuid", V1].join("\n")));
    act(() => result.current.copyValid());
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${V4}\n${V1}`);
  });

  it("copyOne writes a single row's UUID to the clipboard", () => {
    const { result } = renderHook(() => useUuidValidator());
    act(() => result.current.setRawInput([V4, V1].join("\n")));
    act(() => result.current.copyOne(2, V1));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(V1);
  });
});
