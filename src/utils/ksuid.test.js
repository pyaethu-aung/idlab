import { describe, expect, it } from "vitest";
import { generateKsuid, decodeKsuid } from "./ksuid";

const BASE62 = /^[0-9A-Za-z]+$/;
const NIL_KSUID = "0".repeat(27);
const OVERFLOW_KSUID = "z".repeat(27);
const KSUID_EPOCH_MS = 1400000000000; // 2014-05-13T16:53:20Z

describe("generateKsuid", () => {
  it("produces a 27-char base62 string", () => {
    const ksuid = generateKsuid();
    expect(ksuid).toHaveLength(27);
    expect(ksuid).toMatch(BASE62);
  });

  it("encodes the supplied timestamp so it round-trips", () => {
    const ms = 1700000000000;
    expect(decodeKsuid(generateKsuid(ms)).timestampMs).toBe(ms);
  });

  it("truncates sub-second precision to the whole second", () => {
    const decoded = decodeKsuid(generateKsuid(1700000000500));
    expect(decoded.timestampMs).toBe(1700000000000);
  });

  it("floors a fractional timestamp before truncating to seconds", () => {
    const decoded = decodeKsuid(generateKsuid(1700000000000.9));
    expect(decoded.timestampMs).toBe(1700000000000);
  });

  it("encodes the epoch boundary", () => {
    expect(decodeKsuid(generateKsuid(KSUID_EPOCH_MS)).timestampMs).toBe(
      KSUID_EPOCH_MS
    );
  });

  it("yields distinct payloads across calls for the same second", () => {
    const a = generateKsuid(1700000000000);
    const b = generateKsuid(1700000000000);
    expect(decodeKsuid(a).payload).not.toBe(decodeKsuid(b).payload);
  });

  it("throws on timestamps before the KSUID epoch", () => {
    expect(() => generateKsuid(KSUID_EPOCH_MS - 1000)).toThrow(RangeError);
  });

  it("throws on non-finite timestamps", () => {
    expect(() => generateKsuid(Infinity)).toThrow(RangeError);
    expect(() => generateKsuid(NaN)).toThrow(RangeError);
  });
});

describe("decodeKsuid", () => {
  it("rejects non-strings and empty input", () => {
    expect(decodeKsuid(null)).toMatchObject({ valid: false });
    expect(decodeKsuid(42)).toMatchObject({ valid: false });
    expect(decodeKsuid("   ")).toMatchObject({
      valid: false,
      reason: "paste a KSUID to decode",
    });
  });

  it("reports the wrong length", () => {
    expect(decodeKsuid("0ujtsYcgvSTl8PAuAdqWY")).toEqual({
      valid: false,
      reason: "expected 27 characters, got 21",
    });
  });

  it("reports an invalid character with its position", () => {
    const bad = `${"0".repeat(26)}_`;
    expect(decodeKsuid(bad)).toEqual({
      valid: false,
      reason: "invalid character '_' at position 27",
    });
  });

  it("reports overflow for a value beyond 160 bits", () => {
    expect(decodeKsuid(OVERFLOW_KSUID)).toEqual({
      valid: false,
      reason: "value overflows 160 bits: not a valid KSUID",
    });
  });

  it("decodes the nil KSUID", () => {
    const r = decodeKsuid(NIL_KSUID);
    expect(r.valid).toBe(true);
    expect(r.timestampMs).toBe(KSUID_EPOCH_MS);
    expect(r.payload).toBe(`0x${"0".repeat(32)}`);
    expect(r.raw).toBe(`0x${"0".repeat(40)}`);
  });

  it("exposes ISO and relative timestamps", () => {
    const r = decodeKsuid(generateKsuid(1700000000000));
    expect(r.timestampIso).toBe("2023-11-14T22:13:20.000Z");
    expect(typeof r.timestampRelative).toBe("string");
    expect(r.ksuid).toMatch(BASE62);
  });

  it("trims surrounding whitespace", () => {
    expect(decodeKsuid(`  ${generateKsuid()}  `).valid).toBe(true);
  });

  it("is case-sensitive (no Crockford-style aliasing)", () => {
    const upper = decodeKsuid(`A${"0".repeat(26)}`);
    const lower = decodeKsuid(`a${"0".repeat(26)}`);
    expect(upper.valid && lower.valid).toBe(true);
    expect(upper.raw).not.toBe(lower.raw);
  });
});
