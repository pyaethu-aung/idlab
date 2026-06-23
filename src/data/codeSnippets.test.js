import { describe, expect, it } from "vitest";
import CODE_SNIPPETS, { snippetsFor } from "./codeSnippets";

const GENERATABLE = ["v1", "v3", "v4", "v5", "v6", "v7"];

describe("snippetsFor", () => {
  it("returns a non-empty row list for every generatable version", () => {
    for (const v of GENERATABLE) {
      const rows = snippetsFor(v);
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
    }
  });

  it("returns null for the nil and max sentinels", () => {
    expect(snippetsFor("nil")).toBeNull();
    expect(snippetsFor("max")).toBeNull();
  });

  it("returns null for an unknown version", () => {
    expect(snippetsFor("v9")).toBeNull();
    expect(snippetsFor("")).toBeNull();
    expect(snippetsFor(undefined)).toBeNull();
  });
});

describe("CODE_SNIPPETS matrix", () => {
  it("covers exactly the six generatable versions", () => {
    expect(Object.keys(CODE_SNIPPETS).sort()).toEqual([...GENERATABLE].sort());
  });

  it("never includes the nil/max sentinels", () => {
    expect(CODE_SNIPPETS).not.toHaveProperty("nil");
    expect(CODE_SNIPPETS).not.toHaveProperty("max");
  });

  it("gives every row a lang label and a non-empty code string", () => {
    for (const rows of Object.values(CODE_SNIPPETS)) {
      for (const row of rows) {
        expect(typeof row.lang).toBe("string");
        expect(row.lang).not.toBe("");
        expect(typeof row.code).toBe("string");
        expect(row.code.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("has no duplicate language within a version", () => {
    for (const rows of Object.values(CODE_SNIPPETS)) {
      const langs = rows.map((r) => r.lang);
      expect(new Set(langs).size).toBe(langs.length);
    }
  });
});
