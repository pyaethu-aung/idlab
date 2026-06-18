import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validate as validateUuid, version as uuidVersion } from "uuid";
import { MAX_UUID, NIL_UUID, buildBatch, constantVersions, convertTimeUuid, createUuid, defaultNamespace, formatUuid, isConstantVersion, isTimeBasedVersion, makeNameBasedGenerator, makeTimestampGenerator, namespacePresets, parseDateTimeLocal, timeBasedVersions, toDateTimeLocal, uuidGenerators, uuidNameBased } from "./uuid";

describe("buildBatch", () => {
  it("creates the requested number of UUIDs", () => {
    const generator = vi.fn().mockReturnValue("abc");
    const batch = buildBatch(3, generator);

    expect(batch).toHaveLength(3);
    expect(generator).toHaveBeenCalledTimes(3);
  });
});

describe("formatUuid", () => {
  const baseValue = "1234-5678-9abc-def0";

  it("returns the value unchanged when no options are enabled", () => {
    expect(
      formatUuid(baseValue, {
        uppercase: false,
        trimHyphens: false,
        wrapBraces: false,
      })
    ).toBe(baseValue);
  });

  it("applies trimming, casing, and braces when options demand it", () => {
    const formatted = formatUuid(baseValue, {
      uppercase: true,
      trimHyphens: true,
      wrapBraces: true,
    });

    expect(formatted).toBe("{123456789ABCDEF0}");
  });
});

describe("namespacePresets", () => {
  it("has exactly four RFC 4122 namespace entries", () => {
    expect(namespacePresets).toHaveLength(4);
    expect(namespacePresets.map((n) => n.id)).toEqual(["dns", "url", "oid", "x500"]);
  });

  it("defaultNamespace is the DNS entry", () => {
    expect(defaultNamespace).toBe(namespacePresets[0].value);
  });
});

describe("makeNameBasedGenerator", () => {
  it("returns a zero-arg function that calls the version function with (name, namespace)", () => {
    const vFn = vi.fn().mockReturnValue("det-uuid");
    const gen = makeNameBasedGenerator(vFn, "ns-uuid", "my-name");

    expect(typeof gen).toBe("function");
    const result = gen();
    expect(vFn).toHaveBeenCalledWith("my-name", "ns-uuid");
    expect(result).toBe("det-uuid");
  });

  it("is deterministic for the same inputs", () => {
    const gen = makeNameBasedGenerator(uuidNameBased.v5, defaultNamespace, "hello");
    expect(gen()).toBe(gen());
  });

  it("produces different UUIDs for different names", () => {
    const genA = makeNameBasedGenerator(uuidNameBased.v5, defaultNamespace, "foo");
    const genB = makeNameBasedGenerator(uuidNameBased.v5, defaultNamespace, "bar");
    expect(genA()).not.toBe(genB());
  });

  it("produces different UUIDs for different namespaces with same name", () => {
    const genA = makeNameBasedGenerator(uuidNameBased.v5, namespacePresets[0].value, "test");
    const genB = makeNameBasedGenerator(uuidNameBased.v5, namespacePresets[1].value, "test");
    expect(genA()).not.toBe(genB());
  });

  it("v3 and v5 produce different UUIDs for the same inputs", () => {
    const genV3 = makeNameBasedGenerator(uuidNameBased.v3, defaultNamespace, "hello");
    const genV5 = makeNameBasedGenerator(uuidNameBased.v5, defaultNamespace, "hello");
    expect(genV3()).not.toBe(genV5());
  });
});

describe("sentinel UUIDs", () => {
  it("NIL_UUID is the all-zero RFC 9562 sentinel", () => {
    expect(NIL_UUID).toBe("00000000-0000-0000-0000-000000000000");
  });

  it("MAX_UUID is the all-one RFC 9562 sentinel", () => {
    expect(MAX_UUID).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
  });

  it("uuidGenerators.nil / .max return the constants", () => {
    expect(uuidGenerators.nil()).toBe(NIL_UUID);
    expect(uuidGenerators.max()).toBe(MAX_UUID);
  });

  it("sentinel generators are deterministic across a batch", () => {
    const batch = buildBatch(5, uuidGenerators.max);
    expect(batch).toEqual(Array(5).fill(MAX_UUID));
  });

  it("format options still apply to sentinels", () => {
    const formatted = formatUuid(MAX_UUID, {
      uppercase: true,
      trimHyphens: true,
      wrapBraces: true,
    });
    expect(formatted).toBe("{FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF}");
  });
});

describe("uuidGenerators.v6", () => {
  it("produces a valid version 6 UUID", () => {
    const value = uuidGenerators.v6();
    expect(validateUuid(value)).toBe(true);
    expect(uuidVersion(value)).toBe(6);
  });

  it("produces a fresh value on each call", () => {
    expect(uuidGenerators.v6()).not.toBe(uuidGenerators.v6());
  });
});

describe("convertTimeUuid", () => {
  const v1Sample = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

  it("converts a v1 UUID to a valid v6 UUID", () => {
    const v6 = convertTimeUuid(v1Sample, 1);
    expect(validateUuid(v6)).toBe(true);
    expect(uuidVersion(v6)).toBe(6);
  });

  it("round-trips v1 → v6 → v1 back to the original value", () => {
    const v6 = convertTimeUuid(v1Sample, 1);
    expect(convertTimeUuid(v6, 6)).toBe(v1Sample);
  });

  it("returns null for versions that have no v1/v6 counterpart", () => {
    expect(convertTimeUuid("550e8400-e29b-41d4-a716-446655440000", 4)).toBeNull();
    expect(convertTimeUuid(v1Sample, 7)).toBeNull();
  });

  it("returns null instead of throwing on malformed input", () => {
    expect(convertTimeUuid("not-a-uuid", 1)).toBeNull();
  });
});

describe("isConstantVersion", () => {
  it("is true only for the sentinel versions", () => {
    expect(constantVersions).toEqual(["nil", "max"]);
    expect(isConstantVersion("nil")).toBe(true);
    expect(isConstantVersion("max")).toBe(true);
  });

  it("is false for generated and name-based versions", () => {
    ["v1", "v3", "v4", "v5", "v6", "v7", "", undefined].forEach((v) => {
      expect(isConstantVersion(v)).toBe(false);
    });
  });
});

describe("isTimeBasedVersion", () => {
  it("is true only for the time-encoding versions", () => {
    expect(timeBasedVersions).toEqual(["v1", "v6", "v7"]);
    ["v1", "v6", "v7"].forEach((v) => {
      expect(isTimeBasedVersion(v)).toBe(true);
    });
  });

  it("is false for random, name-based, and sentinel versions", () => {
    ["v4", "v3", "v5", "nil", "max", "", undefined].forEach((v) => {
      expect(isTimeBasedVersion(v)).toBe(false);
    });
  });
});

describe("toDateTimeLocal", () => {
  it("formats a date as a zero-padded local datetime-local value", () => {
    expect(toDateTimeLocal(new Date(2021, 0, 5, 9, 7, 3))).toBe(
      "2021-01-05T09:07:03"
    );
  });

  it("round-trips through parseDateTimeLocal", () => {
    const date = new Date(2026, 5, 18, 14, 30, 0);
    expect(parseDateTimeLocal(toDateTimeLocal(date))).toBe(date.getTime());
  });

  it("defaults to the current moment", () => {
    expect(toDateTimeLocal()).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
    );
  });
});

describe("parseDateTimeLocal", () => {
  it("parses a datetime-local string into epoch milliseconds", () => {
    // Constructed from local parts so the assertion is timezone-independent.
    const expected = new Date(2021, 0, 1, 12, 30).getTime();
    expect(parseDateTimeLocal("2021-01-01T12:30")).toBe(expected);
  });

  it("supports millisecond precision", () => {
    const expected = new Date(2021, 0, 1, 12, 30, 15, 500).getTime();
    expect(parseDateTimeLocal("2021-01-01T12:30:15.500")).toBe(expected);
  });

  it("returns null for empty, blank, or non-string input", () => {
    expect(parseDateTimeLocal("")).toBeNull();
    expect(parseDateTimeLocal("   ")).toBeNull();
    expect(parseDateTimeLocal(undefined)).toBeNull();
    expect(parseDateTimeLocal(null)).toBeNull();
  });

  it("returns null for an unparseable value", () => {
    expect(parseDateTimeLocal("not-a-date")).toBeNull();
  });
});

describe("makeTimestampGenerator", () => {
  const ms = Date.UTC(2021, 0, 1, 0, 0, 0);

  it("stamps v1 / v6 / v7 UUIDs with the chosen moment", () => {
    ["v1", "v6", "v7"].forEach((v) => {
      const gen = makeTimestampGenerator(v, ms);
      expect(typeof gen).toBe("function");
      const value = gen();
      expect(validateUuid(value)).toBe(true);
      expect(uuidVersion(value)).toBe(Number(v.slice(1)));
    });
  });

  it("produces a stable time prefix across a batch while values stay unique", () => {
    const gen = makeTimestampGenerator("v7", ms);
    const batch = buildBatch(5, gen);
    const prefixes = new Set(batch.map((u) => u.slice(0, 13)));
    expect(prefixes.size).toBe(1);
    expect(new Set(batch).size).toBe(5);
  });

  it("round-trips a v7 timestamp through the decoder", () => {
    // The decoder reads the first 48 bits of a v7 UUID as Unix milliseconds.
    const value = makeTimestampGenerator("v7", ms)();
    const decodedMs = parseInt(value.replace(/-/g, "").slice(0, 12), 16);
    expect(decodedMs).toBe(ms);
  });

  it("returns null for non-time-based versions", () => {
    ["v4", "v3", "v5", "nil", "max"].forEach((v) => {
      expect(makeTimestampGenerator(v, ms)).toBeNull();
    });
  });

  it("returns null for an invalid timestamp", () => {
    expect(makeTimestampGenerator("v7", NaN)).toBeNull();
    expect(makeTimestampGenerator("v7", Infinity)).toBeNull();
    expect(makeTimestampGenerator("v7", null)).toBeNull();
  });
});

describe("createUuid", () => {
  let originalDescriptor;

  beforeEach(() => {
    originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  });

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalDescriptor);
    } else {
      delete globalThis.crypto;
    }
    vi.restoreAllMocks();
  });

  it("prefers crypto.randomUUID when available", () => {
    const stub = { randomUUID: vi.fn().mockReturnValue("crypto-id") };
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      writable: true,
      value: stub,
    });

    expect(createUuid()).toBe("crypto-id");
    expect(stub.randomUUID).toHaveBeenCalledTimes(1);
  });

  it("falls back to getRandomValues when crypto.randomUUID is missing", () => {
    const mockBytes = new Uint8Array(16).fill(0xab);
    const stub = {
      getRandomValues: vi.fn((arr) => { arr.set(mockBytes); return arr; }),
    };
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      writable: true,
      value: stub,
    });
    const result = createUuid();

    expect(result).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(stub.getRandomValues).toHaveBeenCalledTimes(1);
  });
});
