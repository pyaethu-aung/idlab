import { describe, expect, it } from "vitest";
import {
  generateUlid,
  decodeUlid,
  ulidToUuid,
  uuidToUlid,
  inspectIdentifier,
} from "./ulid";

const CROCKFORD = /^[0-9A-HJKMNPQRSTVWXYZ]+$/;
const NIL_ULID = "00000000000000000000000000";
const MAX_ULID = "7ZZZZZZZZZZZZZZZZZZZZZZZZZ";
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";
// A representative v7 UUID (matches the Converter sample).
const V7_UUID = "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d";
const V7_HEX = "018e3f4a9c2b7d8e9f7a9b3c2e5f6a7d";

describe("generateUlid", () => {
  it("produces a 26-char Crockford Base32 string", () => {
    const ulid = generateUlid();
    expect(ulid).toHaveLength(26);
    expect(ulid).toMatch(CROCKFORD);
  });

  it("encodes the supplied timestamp so it round-trips", () => {
    const ms = 1700000000000;
    expect(decodeUlid(generateUlid(ms)).timestampMs).toBe(ms);
  });

  it("floors a fractional timestamp", () => {
    expect(decodeUlid(generateUlid(1700000000000.9)).timestampMs).toBe(
      1700000000000
    );
  });

  it("emits the all-zero time prefix at epoch", () => {
    expect(generateUlid(0).slice(0, 10)).toBe("0000000000");
  });

  it("emits the max time prefix at 2^48 - 1", () => {
    expect(generateUlid(281474976710655).slice(0, 10)).toBe("7ZZZZZZZZZ");
  });

  it("yields distinct randomness across calls", () => {
    const a = generateUlid(1700000000000);
    const b = generateUlid(1700000000000);
    expect(a.slice(0, 10)).toBe(b.slice(0, 10));
    expect(a.slice(10)).not.toBe(b.slice(10));
  });

  it("throws on out-of-range or non-finite timestamps", () => {
    expect(() => generateUlid(-1)).toThrow(RangeError);
    expect(() => generateUlid(281474976710656)).toThrow(RangeError);
    expect(() => generateUlid(Infinity)).toThrow(RangeError);
    expect(() => generateUlid(NaN)).toThrow(RangeError);
  });
});

describe("decodeUlid", () => {
  it("rejects non-strings and empty input", () => {
    expect(decodeUlid(null)).toMatchObject({ valid: false });
    expect(decodeUlid(42)).toMatchObject({ valid: false });
    expect(decodeUlid("   ")).toMatchObject({
      valid: false,
      reason: "paste a ULID to decode",
    });
  });

  it("reports the wrong length", () => {
    expect(decodeUlid("01ARZ3NDEK")).toEqual({
      valid: false,
      reason: "expected 26 characters, got 10",
    });
  });

  it("reports an invalid character with its position", () => {
    // 'U' is excluded from Crockford Base32.
    const bad = `0123456789ABCDEFGHJKMNPQRU`;
    expect(decodeUlid(bad)).toEqual({
      valid: false,
      reason: "invalid character 'U' at position 26",
    });
  });

  it("reports timestamp overflow when the first char exceeds 7", () => {
    expect(decodeUlid("8ZZZZZZZZZZZZZZZZZZZZZZZZZ")).toEqual({
      valid: false,
      reason: "timestamp overflow: the first character must be 0-7",
    });
  });

  it("decodes the nil ULID", () => {
    const r = decodeUlid(NIL_ULID);
    expect(r.valid).toBe(true);
    expect(r.timestampMs).toBe(0);
    expect(r.uuid).toBe(NIL_UUID);
    expect(r.randomness).toBe(`0x${"0".repeat(20)}`);
  });

  it("decodes the max ULID", () => {
    const r = decodeUlid(MAX_ULID);
    expect(r.valid).toBe(true);
    expect(r.timestampMs).toBe(281474976710655);
    expect(r.uuid).toBe(MAX_UUID);
    expect(r.uuidCompact).toBe("f".repeat(32));
    expect(r.randomness).toBe(`0x${"f".repeat(20)}`);
  });

  it("exposes ISO and relative timestamps and the randomness chars", () => {
    const r = decodeUlid(generateUlid(1700000000000));
    expect(r.timestampIso).toBe("2023-11-14T22:13:20.000Z");
    expect(typeof r.timestampRelative).toBe("string");
    expect(r.randomnessChars).toHaveLength(16);
    expect(r.ulid).toMatch(CROCKFORD);
  });

  it("normalizes case and Crockford ambiguity aliases", () => {
    const canonical = decodeUlid(MAX_ULID).ulid;
    // lowercase input
    expect(decodeUlid(MAX_ULID.toLowerCase()).ulid).toBe(canonical);
    // I/L decode to 1, O decodes to 0 (same 128 bits as the digit forms).
    expect(decodeUlid("0l0l0l0l0l0l0l0l0l0l0l0l0i").uuidCompact).toBe(
      decodeUlid("01010101010101010101010101").uuidCompact
    );
    expect(decodeUlid("O123456789ABCDEFGHJKMNPQRS").uuidCompact).toBe(
      decodeUlid("0123456789ABCDEFGHJKMNPQRS").uuidCompact
    );
  });

  it("trims surrounding whitespace", () => {
    expect(decodeUlid(`  ${MAX_ULID}  `).valid).toBe(true);
  });
});

describe("ulidToUuid", () => {
  it("converts a ULID to its canonical UUID", () => {
    expect(ulidToUuid(NIL_ULID)).toBe(NIL_UUID);
    expect(ulidToUuid(MAX_ULID)).toBe(MAX_UUID);
  });

  it("returns null for an invalid ULID", () => {
    expect(ulidToUuid("not-a-ulid")).toBeNull();
    expect(ulidToUuid("")).toBeNull();
  });
});

describe("uuidToUlid", () => {
  it("converts accepted UUID forms to a 26-char ULID", () => {
    expect(uuidToUlid(NIL_UUID)).toBe(NIL_ULID);
    expect(uuidToUlid(MAX_UUID)).toBe(MAX_ULID);
    expect(uuidToUlid(V7_HEX)).toHaveLength(26);
    expect(uuidToUlid(`{${V7_UUID}}`)).toBe(uuidToUlid(V7_UUID));
    expect(uuidToUlid(`urn:uuid:${V7_UUID}`)).toBe(uuidToUlid(V7_UUID));
    expect(uuidToUlid(V7_UUID.toUpperCase())).toBe(uuidToUlid(V7_UUID));
  });

  it("returns null for a non-UUID", () => {
    expect(uuidToUlid("nope")).toBeNull();
    expect(uuidToUlid(null)).toBeNull();
  });

  it("round-trips losslessly with ulidToUuid", () => {
    const ulid = generateUlid(1700000000000);
    expect(uuidToUlid(ulidToUuid(ulid))).toBe(ulid);
    expect(ulidToUuid(uuidToUlid(V7_UUID))).toBe(V7_UUID);
  });
});

describe("inspectIdentifier", () => {
  it("rejects empty input", () => {
    expect(inspectIdentifier("")).toEqual({
      valid: false,
      reason: "paste a ULID or UUIDv7",
    });
  });

  it("decodes a ULID and tags its kind", () => {
    const r = inspectIdentifier(MAX_ULID);
    expect(r).toMatchObject({ valid: true, kind: "ulid", uuid: MAX_UUID });
  });

  it("surfaces a ULID decode error unchanged", () => {
    expect(inspectIdentifier("8ZZZZZZZZZZZZZZZZZZZZZZZZZ")).toMatchObject({
      valid: false,
      reason: "timestamp overflow: the first character must be 0-7",
    });
  });

  it("converts a UUIDv7 and decodes its timestamp", () => {
    const r = inspectIdentifier(V7_UUID);
    expect(r.valid).toBe(true);
    expect(r.kind).toBe("uuidv7");
    expect(r.uuid).toBe(V7_UUID);
    expect(r.timestampMs).toBe(parseInt(V7_HEX.slice(0, 12), 16));
    expect(r.ulid).toBe(uuidToUlid(V7_UUID));
  });

  it("rejects non-v7 UUIDs with a helpful reason", () => {
    const r = inspectIdentifier("550e8400-e29b-41d4-a716-446655440000");
    expect(r.valid).toBe(false);
    expect(r.reason).toContain("v4");
    expect(r.reason).toContain("v7");
  });

  it("rejects unrelated input", () => {
    expect(inspectIdentifier("hello world")).toEqual({
      valid: false,
      reason: "not a ULID or UUID",
    });
  });
});
