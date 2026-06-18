import { describe, expect, it } from "vitest";
import { MAX_LINES, parseUuidList } from "./uuidBulk";

const V4 = "550e8400-e29b-41d4-a716-446655440000";
const V7 = "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d";
const V1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const NIL = "00000000-0000-0000-0000-000000000000";

describe("parseUuidList", () => {
  it("returns an empty result for empty string", () => {
    const { rows, summary } = parseUuidList("");
    expect(rows).toEqual([]);
    expect(summary).toEqual({ valid: 0, invalid: 0, total: 0, truncated: false });
  });

  it("returns an empty result for non-string input", () => {
    expect(parseUuidList(null).rows).toEqual([]);
    expect(parseUuidList(undefined).summary.total).toBe(0);
    expect(parseUuidList(42).rows).toEqual([]);
  });

  it("parses one valid UUID per line", () => {
    const { rows, summary } = parseUuidList(`${V4}\n${V7}`);
    expect(rows).toHaveLength(2);
    expect(rows[0].result.valid).toBe(true);
    expect(rows[1].result.valid).toBe(true);
    expect(summary).toEqual({ valid: 2, invalid: 0, total: 2, truncated: false });
  });

  it("flags invalid lines and counts them", () => {
    const { rows, summary } = parseUuidList(`${V4}\nnot-a-uuid\n${V7}`);
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.result.valid)).toEqual([true, false, true]);
    expect(summary).toEqual({ valid: 2, invalid: 1, total: 3, truncated: false });
    expect(rows[1].result.reason).toBeTruthy();
  });

  it("skips blank and whitespace-only lines without adding rows", () => {
    const { rows, summary } = parseUuidList(`${V4}\n\n   \n${V7}`);
    expect(rows).toHaveLength(2);
    expect(summary.total).toBe(2);
  });

  it("preserves the original 1-based line number across skipped blanks", () => {
    const { rows } = parseUuidList(`\n${V4}\n\n${V7}`);
    expect(rows[0].line).toBe(2);
    expect(rows[1].line).toBe(4);
  });

  it("trims surrounding whitespace from each line before parsing", () => {
    const { rows } = parseUuidList(`   ${V4}   `);
    expect(rows[0].input).toBe(V4);
    expect(rows[0].result.valid).toBe(true);
  });

  it("handles CRLF line endings", () => {
    const { rows, summary } = parseUuidList(`${V4}\r\n${V7}`);
    expect(rows).toHaveLength(2);
    expect(summary.valid).toBe(2);
  });

  it("exposes decoded version and timestamp for time-based UUIDs", () => {
    const { rows } = parseUuidList(`${V1}\n${V7}\n${NIL}`);
    expect(rows[0].result.version).toBe(1);
    expect(rows[0].result.decoded.timestampIso).toBeTruthy();
    expect(rows[1].result.version).toBe(7);
    expect(rows[1].result.decoded.timestampIso).toBeTruthy();
    expect(rows[2].result.version).toBe(0);
    expect(rows[2].result.decoded).toBeNull();
  });

  it("forwards parse options to each line", () => {
    const compact = "550e8400e29b41d4a716446655440000";
    expect(parseUuidList(compact).rows[0].result.valid).toBe(false);
    expect(
      parseUuidList(compact, { allowNoHyphens: true }).rows[0].result.valid
    ).toBe(true);
  });

  it("caps parsing at MAX_LINES and marks the result truncated", () => {
    const blob = Array.from({ length: MAX_LINES + 50 }, () => V4).join("\n");
    const { rows, summary } = parseUuidList(blob);
    expect(rows).toHaveLength(MAX_LINES);
    expect(summary.total).toBe(MAX_LINES);
    expect(summary.truncated).toBe(true);
  });

  it("does not mark truncated when exactly at the cap", () => {
    const blob = Array.from({ length: MAX_LINES }, () => V4).join("\n");
    expect(parseUuidList(blob).summary.truncated).toBe(false);
  });
});
