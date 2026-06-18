import { describe, it, expect } from "vitest";
import { exportUuids, EXPORT_FORMATS } from "./uuidExport";

const SAMPLE = [
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
];
const SINGLE = ["550e8400-e29b-41d4-a716-446655440000"];
const TS = "2026-01-01T00-00-00-000Z";

describe("EXPORT_FORMATS", () => {
  it("lists all five formats", () => {
    expect(EXPORT_FORMATS).toEqual(["txt", "json", "csv", "sql", "env"]);
  });
});

describe("exportUuids — txt", () => {
  it("joins UUIDs with newlines", () => {
    const { content } = exportUuids(SAMPLE, "txt", TS);
    expect(content).toBe(SAMPLE.join("\n"));
  });

  it("uses text/plain mime type", () => {
    expect(exportUuids(SAMPLE, "txt", TS).mimeType).toBe("text/plain");
  });

  it("produces a .txt filename", () => {
    expect(exportUuids(SAMPLE, "txt", TS).filename).toMatch(/\.txt$/);
  });

  it("encodes count in filename", () => {
    expect(exportUuids(SAMPLE, "txt", TS).filename).toContain(`-${SAMPLE.length}-`);
  });

  it("handles a single UUID", () => {
    const { content } = exportUuids(SINGLE, "txt", TS);
    expect(content).toBe(SINGLE[0]);
    expect(content).not.toContain("\n");
  });
});

describe("exportUuids — json", () => {
  it("produces valid JSON array", () => {
    const { content } = exportUuids(SAMPLE, "json", TS);
    expect(JSON.parse(content)).toEqual(SAMPLE);
  });

  it("pretty-prints with 2-space indent", () => {
    const { content } = exportUuids(SAMPLE, "json", TS);
    expect(content).toContain("  ");
  });

  it("uses application/json mime type", () => {
    expect(exportUuids(SAMPLE, "json", TS).mimeType).toBe("application/json");
  });

  it("produces a .json filename", () => {
    expect(exportUuids(SAMPLE, "json", TS).filename).toMatch(/\.json$/);
  });

  it("handles a single UUID", () => {
    const { content } = exportUuids(SINGLE, "json", TS);
    expect(JSON.parse(content)).toEqual(SINGLE);
  });
});

describe("exportUuids — csv", () => {
  it("starts with a header row", () => {
    const { content } = exportUuids(SAMPLE, "csv", TS);
    const lines = content.split("\n");
    expect(lines[0]).toBe("index,uuid");
  });

  it("numbers rows from 1", () => {
    const { content } = exportUuids(SAMPLE, "csv", TS);
    const lines = content.split("\n");
    expect(lines[1]).toBe(`1,${SAMPLE[0]}`);
    expect(lines[2]).toBe(`2,${SAMPLE[1]}`);
  });

  it("has header + one row per UUID", () => {
    const { content } = exportUuids(SAMPLE, "csv", TS);
    expect(content.split("\n").length).toBe(SAMPLE.length + 1);
  });

  it("uses text/csv mime type", () => {
    expect(exportUuids(SAMPLE, "csv", TS).mimeType).toBe("text/csv");
  });

  it("produces a .csv filename", () => {
    expect(exportUuids(SAMPLE, "csv", TS).filename).toMatch(/\.csv$/);
  });

  it("handles a single UUID", () => {
    const { content } = exportUuids(SINGLE, "csv", TS);
    const lines = content.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe(`1,${SINGLE[0]}`);
  });
});

describe("exportUuids — sql", () => {
  it("starts with a comment about table/column names", () => {
    const { content } = exportUuids(SAMPLE, "sql", TS);
    expect(content).toMatch(/^-- replace table\/column names/);
  });

  it("starts with INSERT INTO", () => {
    const { content } = exportUuids(SAMPLE, "sql", TS);
    expect(content).toContain("INSERT INTO uuids (id) VALUES");
  });

  it("wraps each UUID in single quotes", () => {
    const { content } = exportUuids(SAMPLE, "sql", TS);
    SAMPLE.forEach((u) => expect(content).toContain(`('${u}')`));
  });

  it("ends with a semicolon", () => {
    const { content } = exportUuids(SAMPLE, "sql", TS);
    expect(content.trimEnd()).toMatch(/;$/);
  });

  it("uses text/plain mime type", () => {
    expect(exportUuids(SAMPLE, "sql", TS).mimeType).toBe("text/plain");
  });

  it("produces a .sql filename", () => {
    expect(exportUuids(SAMPLE, "sql", TS).filename).toMatch(/\.sql$/);
  });

  it("handles a single UUID", () => {
    const { content } = exportUuids(SINGLE, "sql", TS);
    expect(content).toContain(`('${SINGLE[0]}')`);
    expect(content).not.toContain(",\n  (");
  });
});

describe("exportUuids — env", () => {
  it("keys are UUID_n from 1", () => {
    const { content } = exportUuids(SAMPLE, "env", TS);
    const lines = content.split("\n");
    expect(lines[0]).toBe(`UUID_1=${SAMPLE[0]}`);
    expect(lines[1]).toBe(`UUID_2=${SAMPLE[1]}`);
  });

  it("has one line per UUID", () => {
    const { content } = exportUuids(SAMPLE, "env", TS);
    expect(content.split("\n").length).toBe(SAMPLE.length);
  });

  it("uses text/plain mime type", () => {
    expect(exportUuids(SAMPLE, "env", TS).mimeType).toBe("text/plain");
  });

  it("produces a .env filename", () => {
    expect(exportUuids(SAMPLE, "env", TS).filename).toMatch(/\.env$/);
  });

  it("handles a single UUID", () => {
    const { content } = exportUuids(SINGLE, "env", TS);
    expect(content).toBe(`UUID_1=${SINGLE[0]}`);
  });
});

describe("exportUuids — unknown format fallback", () => {
  it("falls back to txt for unknown format", () => {
    const { content, mimeType } = exportUuids(SAMPLE, "xml", TS);
    expect(content).toBe(SAMPLE.join("\n"));
    expect(mimeType).toBe("text/plain");
  });
});

describe("exportUuids — filename encoding", () => {
  it("embeds the timestamp in all formats", () => {
    EXPORT_FORMATS.forEach((fmt) => {
      const { filename } = exportUuids(SAMPLE, fmt, TS);
      expect(filename).toContain(TS);
    });
  });

  it("embeds the count in all formats", () => {
    EXPORT_FORMATS.forEach((fmt) => {
      const { filename } = exportUuids(SAMPLE, fmt, TS);
      expect(filename).toContain(`-${SAMPLE.length}-`);
    });
  });
});
