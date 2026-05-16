import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildBatch, createUuid, formatUuid } from "./uuid";

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
