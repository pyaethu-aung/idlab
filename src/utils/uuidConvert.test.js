import { describe, expect, it } from "vitest";
import { convertUuid } from "./uuidConvert";

const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const DNS_HEX = "6ba7b8109dad11d180b400c04fd430c8";
const NIL = "00000000-0000-0000-0000-000000000000";
const MAX = "ffffffff-ffff-ffff-ffff-ffffffffffff";

describe("convertUuid", () => {
  it("returns null for empty string", () => {
    expect(convertUuid("")).toBeNull();
  });

  it("returns null for non-string", () => {
    expect(convertUuid(null)).toBeNull();
    expect(convertUuid(undefined)).toBeNull();
    expect(convertUuid(42)).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(convertUuid("not-a-uuid")).toBeNull();
    expect(convertUuid("zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz")).toBeNull();
  });

  it("returns an object with all 9 representation keys", () => {
    const result = convertUuid(DNS);
    expect(result).toMatchObject({
      canonical: expect.any(String),
      compact: expect.any(String),
      upper: expect.any(String),
      braces: expect.any(String),
      urn: expect.any(String),
      base64: expect.any(String),
      base32: expect.any(String),
      integer: expect.any(String),
      bytes: expect.any(String),
    });
  });

  describe("canonical", () => {
    it("returns lowercase hyphenated form", () => {
      expect(convertUuid(DNS).canonical).toBe(DNS);
    });

    it("normalizes uppercase input", () => {
      expect(convertUuid(DNS.toUpperCase()).canonical).toBe(DNS);
    });

    it("normalizes compact input", () => {
      expect(convertUuid(DNS_HEX).canonical).toBe(DNS);
    });

    it("normalizes braced input", () => {
      expect(convertUuid(`{${DNS}}`).canonical).toBe(DNS);
    });

    it("normalizes urn:uuid: prefix", () => {
      expect(convertUuid(`urn:uuid:${DNS}`).canonical).toBe(DNS);
    });
  });

  describe("compact", () => {
    it("returns 32-char lowercase hex with no hyphens", () => {
      expect(convertUuid(DNS).compact).toBe(DNS_HEX);
      expect(convertUuid(DNS).compact).toHaveLength(32);
    });
  });

  describe("upper", () => {
    it("returns uppercase hyphenated form", () => {
      expect(convertUuid(DNS).upper).toBe(DNS.toUpperCase());
    });
  });

  describe("braces", () => {
    it("wraps the canonical form in curly braces", () => {
      expect(convertUuid(DNS).braces).toBe(`{${DNS}}`);
    });
  });

  describe("urn", () => {
    it("prepends urn:uuid: to canonical form", () => {
      expect(convertUuid(DNS).urn).toBe(`urn:uuid:${DNS}`);
    });
  });

  describe("base64", () => {
    it("returns 22-char base64url without padding", () => {
      const b64 = convertUuid(DNS).base64;
      expect(b64).toHaveLength(22);
      expect(b64).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("encodes nil UUID as 22 A characters", () => {
      expect(convertUuid(NIL).base64).toBe("AAAAAAAAAAAAAAAAAAAAAA");
    });

    it("encodes max UUID to expected value", () => {
      const b64 = convertUuid(MAX).base64;
      expect(b64).toHaveLength(22);
      expect(b64).toMatch(/^[_w]+$/);
    });
  });

  describe("base32", () => {
    it("returns 26-char Crockford base32", () => {
      const b32 = convertUuid(DNS).base32;
      expect(b32).toHaveLength(26);
      expect(b32).toMatch(/^[0-9A-HJKMNPQRSTVWXYZ]+$/);
    });

    it("encodes nil UUID as 26 zeros", () => {
      expect(convertUuid(NIL).base32).toBe("00000000000000000000000000");
    });

    it("encodes max UUID starting with 7 followed by Z's", () => {
      expect(convertUuid(MAX).base32).toBe("7ZZZZZZZZZZZZZZZZZZZZZZZZZ");
    });
  });

  describe("integer", () => {
    it("returns a decimal string with only digits", () => {
      expect(convertUuid(DNS).integer).toMatch(/^\d+$/);
    });

    it("encodes nil UUID as 0", () => {
      expect(convertUuid(NIL).integer).toBe("0");
    });

    it("encodes max UUID as 2^128 - 1", () => {
      expect(convertUuid(MAX).integer).toBe(
        "340282366920938463463374607431768211455"
      );
    });
  });

  describe("bytes", () => {
    it("returns a bracket-wrapped 0x hex byte array", () => {
      const bytes = convertUuid(DNS).bytes;
      expect(bytes).toMatch(/^\[0x[0-9a-f]{2}(, 0x[0-9a-f]{2}){15}\]$/);
    });

    it("encodes nil UUID as all 0x00", () => {
      expect(convertUuid(NIL).bytes).toBe(
        "[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]"
      );
    });

    it("encodes max UUID as all 0xff", () => {
      expect(convertUuid(MAX).bytes).toBe(
        "[0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]"
      );
    });
  });
});
