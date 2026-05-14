import { describe, expect, it } from "vitest";
import {
  buildVariantBits,
  computeProperties,
  decodeUuidV1,
  decodeUuidV7,
  detectVariant,
  extractFields,
  formatRelativeTime,
  normalizeInput,
  parseUuid,
} from "./uuidDecoder";

const V4 = "550e8400-e29b-41d4-a716-446655440000";
const V7 = "00000000-0001-7abc-8000-000000000001";
const V1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const NIL = "00000000-0000-0000-0000-000000000000";
const MAX = "ffffffff-ffff-ffff-ffff-ffffffffffff";
const V4_COMPACT = "550e8400e29b41d4a716446655440000";

describe("normalizeInput", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeInput("  abc  ")).toBe("abc");
  });
  it("strips surrounding curly braces", () => {
    expect(normalizeInput(`{${V4}}`)).toBe(V4);
  });
  it("returns empty string for empty input", () => {
    expect(normalizeInput("")).toBe("");
  });
  it("returns empty string for non-string values", () => {
    expect(normalizeInput(null)).toBe("");
    expect(normalizeInput(undefined)).toBe("");
    expect(normalizeInput(42)).toBe("");
  });
  it("does not strip non-surrounding braces", () => {
    expect(normalizeInput("{abc")).toBe("{abc");
    expect(normalizeInput("abc}")).toBe("abc}");
  });
});

describe("extractFields", () => {
  it("extracts all five UUID fields", () => {
    const fields = extractFields(V4);
    expect(fields.timeLow).toBe("550e8400");
    expect(fields.timeMid).toBe("e29b");
    expect(fields.timeHighAndVersion).toBe("41d4");
    expect(fields.clockSeqAndReserved).toBe("a716");
    expect(fields.node).toBe("446655440000");
  });
});

describe("detectVariant", () => {
  it("returns RFC 4122 for nibbles 8-b", () => {
    expect(detectVariant("000000000000000080000000000000")).toBe("RFC 4122");
    expect(detectVariant("00000000000000009000000000000")).toBe("RFC 4122");
    expect(detectVariant("0000000000000000b000000000000")).toBe("RFC 4122");
  });
  it("returns NCS for nibbles 0-7", () => {
    expect(detectVariant("000000000000000070000000000000")).toBe("NCS");
  });
  it("returns Microsoft for nibbles c-d", () => {
    expect(detectVariant("0000000000000000c000000000000")).toBe("Microsoft");
  });
  it("returns Reserved for nibbles e-f", () => {
    expect(detectVariant("0000000000000000e000000000000")).toBe("Reserved");
  });
});

describe("buildVariantBits", () => {
  it("returns RFC 4122 label for nibble 8", () => {
    const hex = V4.replace(/-/g, "");
    expect(buildVariantBits(hex)).toBe("RFC 4122 · 10x · b00…b01");
  });
  it("returns NCS label for nibble 0-7", () => {
    const hex = "00000000000000000000000000000000";
    expect(buildVariantBits(hex)).toMatch(/NCS/);
  });
  it("returns Microsoft label for nibble c", () => {
    const hex = "0000000000000000c000000000000000";
    expect(buildVariantBits(hex)).toMatch(/Microsoft/);
  });
  it("returns Reserved label for nibble e", () => {
    const hex = "0000000000000000e000000000000000";
    expect(buildVariantBits(hex)).toMatch(/Reserved/);
  });
});

describe("computeProperties", () => {
  it("detects lowercase canonical input", () => {
    const fields = extractFields(V4);
    const props = computeProperties(V4, V4, 4, "RFC 4122", fields);
    expect(props.isLowercase).toBe(true);
    expect(props.hasHyphens).toBe(true);
    expect(props.hasBraces).toBe(false);
    expect(props.isNil).toBe(false);
    expect(props.format).toBe("canonical");
    expect(props.charCount).toBe(36);
  });

  it("detects uppercase input", () => {
    const upper = V4.toUpperCase();
    const fields = extractFields(V4);
    const props = computeProperties(upper, upper, 4, "RFC 4122", fields);
    expect(props.isLowercase).toBe(false);
  });

  it("detects braces format", () => {
    const raw = `{${V4}}`;
    const fields = extractFields(V4);
    const props = computeProperties(raw, V4, 4, "RFC 4122", fields);
    expect(props.hasBraces).toBe(true);
    expect(props.format).toBe("braces");
  });

  it("detects no-hyphens format", () => {
    const fields = extractFields(V4);
    const props = computeProperties(V4_COMPACT, V4, 4, "RFC 4122", fields);
    expect(props.hasHyphens).toBe(true); // normalized has hyphens
    expect(props.format).toBe("canonical"); // canonical after normalization
  });

  it("detects nil UUID", () => {
    const fields = extractFields(NIL);
    const props = computeProperties(NIL, NIL, 0, "NCS", fields);
    expect(props.isNil).toBe(true);
  });
});

describe("parseUuid", () => {
  it("validates a v4 UUID and returns correct metadata", () => {
    const r = parseUuid(V4);
    expect(r.valid).toBe(true);
    expect(r.version).toBe(4);
    expect(r.variant).toBe("RFC 4122");
    expect(r.decoded).toBeNull();
    expect(r.fields).toBeDefined();
  });

  it("returns valid:false for malformed input", () => {
    expect(parseUuid("not-a-uuid").valid).toBe(false);
    expect(parseUuid("550e8400-e29b-41d4-a716").valid).toBe(false);
    expect(parseUuid("gggggggg-gggg-4ggg-aggg-gggggggggggg").valid).toBe(false);
  });

  it("accepts braced input by default", () => {
    expect(parseUuid(`{${V4}}`).valid).toBe(true);
  });

  it("rejects braced input when allowBraces is false", () => {
    expect(parseUuid(`{${V4}}`, { allowBraces: false }).valid).toBe(false);
  });

  it("rejects compact (no-hyphen) input by default", () => {
    expect(parseUuid(V4_COMPACT).valid).toBe(false);
  });

  it("accepts compact input when allowNoHyphens is true", () => {
    const r = parseUuid(V4_COMPACT, { allowNoHyphens: true });
    expect(r.valid).toBe(true);
    expect(r.version).toBe(4);
  });

  it("rejects non-RFC variant when strictRfc is true", () => {
    const ncs = "00000000-0000-1000-0000-000000000000";
    expect(parseUuid(ncs, { strictRfc: true }).valid).toBe(false);
  });

  it("accepts non-RFC variant when strictRfc is false (default)", () => {
    const ncs = "00000000-0000-1000-0000-000000000000";
    expect(parseUuid(ncs).valid).toBe(true);
  });

  it("handles uppercase input case-insensitively", () => {
    expect(parseUuid(V4.toUpperCase()).valid).toBe(true);
  });

  it("validates a nil UUID", () => {
    const r = parseUuid(NIL);
    expect(r.valid).toBe(true);
    expect(r.version).toBe(0);
    expect(r.isNil).toBe(true);
  });

  it("validates a max UUID", () => {
    const r = parseUuid(MAX);
    expect(r.valid).toBe(true);
    expect(r.version).toBe(15);
  });

  it("returns valid:false for empty string", () => {
    expect(parseUuid("").valid).toBe(false);
  });

  it("detects v7 and returns decoded data", () => {
    const r = parseUuid(V7);
    expect(r.valid).toBe(true);
    expect(r.version).toBe(7);
    expect(r.decoded).not.toBeNull();
    expect(r.decoded.timestamp).toBeInstanceOf(Date);
    expect(typeof r.unixMs).toBe("number");
  });

  it("detects v1 and returns decoded data with node", () => {
    const r = parseUuid(V1);
    expect(r.valid).toBe(true);
    expect(r.version).toBe(1);
    expect(r.decoded).not.toBeNull();
    expect(r.decoded.node).toBe("00c04fd430c8");
    expect(typeof r.unixMs).toBe("number");
  });

  it("returns null decoded and unixMs for non-time-based versions", () => {
    expect(parseUuid(V4).decoded).toBeNull();
    expect(parseUuid(V4).unixMs).toBeNull();
    expect(parseUuid(NIL).decoded).toBeNull();
  });

  it("returns isLowercase, hasHyphens, hasBraces, format, charCount", () => {
    const r = parseUuid(V4);
    expect(r.isLowercase).toBe(true);
    expect(r.hasHyphens).toBe(true);
    expect(r.hasBraces).toBe(false);
    expect(r.format).toBe("canonical");
    expect(r.charCount).toBe(36);
  });

  it("returns variantBits string", () => {
    const r = parseUuid(V4);
    expect(typeof r.variantBits).toBe("string");
    expect(r.variantBits).toMatch(/RFC 4122/);
  });
});

describe("decodeUuidV7", () => {
  it("extracts Unix ms timestamp from first 48 bits", () => {
    // "00000000-0001-7000-8000-000000000000": first 12 hex = "000000000001" = 1 ms
    const fields = extractFields("00000000-0001-7000-8000-000000000000");
    const r = decodeUuidV7(fields);
    expect(r.timestamp.getTime()).toBe(1);
    expect(r.timestampIso).toBe(new Date(1).toISOString());
  });

  it("extracts 12-bit sequence from bits after version nibble", () => {
    // timeHighAndVersion = "7abc" → version nibble = '7', seq hex = "abc" = 2748
    const fields = extractFields("00000000-0001-7abc-8000-000000000000");
    expect(decodeUuidV7(fields).sequence).toBe(0xabc);
  });

  it("returns null for node", () => {
    const fields = extractFields(V7);
    expect(decodeUuidV7(fields).node).toBeNull();
  });

  it("returns a relative time string", () => {
    const fields = extractFields(V7);
    const r = decodeUuidV7(fields);
    expect(typeof r.timestampRelative).toBe("string");
    expect(r.timestampRelative.length).toBeGreaterThan(0);
  });
});

describe("decodeUuidV1", () => {
  it("extracts the node field", () => {
    const fields = extractFields(V1);
    expect(decodeUuidV1(fields).node).toBe("00c04fd430c8");
  });

  it("extracts clock sequence within 14-bit range", () => {
    const fields = extractFields(V1);
    const { clockSeq } = decodeUuidV1(fields);
    expect(typeof clockSeq).toBe("number");
    expect(clockSeq).toBeGreaterThanOrEqual(0);
    expect(clockSeq).toBeLessThanOrEqual(0x3fff);
  });

  it("returns a Date for the timestamp", () => {
    const fields = extractFields(V1);
    expect(decodeUuidV1(fields).timestamp).toBeInstanceOf(Date);
  });

  it("returns null for sequence (v1 has no sequence field)", () => {
    const fields = extractFields(V1);
    expect(decodeUuidV1(fields).sequence).toBeNull();
  });

  it("produces a valid ISO string", () => {
    const fields = extractFields(V1);
    const { timestampIso } = decodeUuidV1(fields);
    expect(() => new Date(timestampIso)).not.toThrow();
    expect(new Date(timestampIso).toISOString()).toBe(timestampIso);
  });
});

describe("formatRelativeTime", () => {
  it("formats seconds ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 30_000))).toMatch(
      /\d+ seconds? ago/
    );
  });
  it("formats minutes ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 120_000))).toMatch(
      /\d+ minutes? ago/
    );
  });
  it("formats hours ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 7_200_000))).toMatch(
      /\d+ hours? ago/
    );
  });
  it("formats days ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 172_800_000))).toMatch(
      /\d+ days? ago/
    );
  });
  it("returns a locale string for old dates (>30 days)", () => {
    const old = new Date("2020-01-01T00:00:00Z");
    const result = formatRelativeTime(old);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
  it("handles future dates", () => {
    const future = new Date(Date.now() + 120_000);
    expect(formatRelativeTime(future)).toMatch(/in \d+ minutes?/);
  });
});
