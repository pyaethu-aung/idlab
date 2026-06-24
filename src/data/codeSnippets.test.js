import { describe, expect, it } from "vitest";
import CODE_SNIPPETS, { snippetsFor, ULID_SNIPPETS, nanoIdSnippets } from "./codeSnippets";

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

  it("gives every row a non-empty, multi-line full program", () => {
    for (const rows of Object.values(CODE_SNIPPETS)) {
      for (const row of rows) {
        expect(typeof row.full).toBe("string");
        expect(row.full.trim().length).toBeGreaterThan(0);
        // Full snippets are complete programs, so they always span more than
        // the single inline line (import/header + the call, at minimum).
        expect(row.full).toContain("\n");
      }
    }
  });

  it("scaffolds runnable go and java programs in full mode", () => {
    for (const rows of Object.values(CODE_SNIPPETS)) {
      const go = rows.find((r) => r.lang === "go");
      expect(go.full).toContain("package main");
      expect(go.full).toContain("func main()");

      const java = rows.find((r) => r.lang === "java");
      expect(java.full).toContain("public class Main");
      expect(java.full).toContain("public static void main");
    }
  });

  it("has no duplicate language within a version", () => {
    for (const rows of Object.values(CODE_SNIPPETS)) {
      const langs = rows.map((r) => r.lang);
      expect(new Set(langs).size).toBe(langs.length);
    }
  });
});

describe("ULID_SNIPPETS", () => {
  it("provides three language rows: js, py, go", () => {
    expect(ULID_SNIPPETS.map((r) => r.lang)).toEqual(["js", "py", "go"]);
  });

  it("gives every row a non-empty code and full string", () => {
    for (const row of ULID_SNIPPETS) {
      expect(row.code.trim().length).toBeGreaterThan(0);
      expect(row.full.trim().length).toBeGreaterThan(0);
    }
  });

  it("scaffolds a runnable go program in full mode", () => {
    const go = ULID_SNIPPETS.find((r) => r.lang === "go");
    expect(go.full).toContain("package main");
    expect(go.full).toContain("func main()");
    expect(go.full).toContain("github.com/oklog/ulid");
  });
});

describe("nanoIdSnippets", () => {
  it("returns three language rows for every alphabet", () => {
    for (const id of ["url-safe", "alphanumeric", "lowercase", "hex", "numbers"]) {
      const rows = nanoIdSnippets(21, id);
      expect(rows.map((r) => r.lang)).toEqual(["js", "py", "go"]);
    }
  });

  it("uses the simple nanoid(size) form for the url-safe default", () => {
    const rows = nanoIdSnippets(21, "url-safe");
    const js = rows.find((r) => r.lang === "js");
    expect(js.code).toContain("nanoid(21)");
    expect(js.code).not.toContain("customAlphabet");
  });

  it("uses customAlphabet for non-default alphabets", () => {
    const rows = nanoIdSnippets(10, "hex");
    const js = rows.find((r) => r.lang === "js");
    expect(js.code).toContain("customAlphabet");
    expect(js.full).toContain("customAlphabet");
  });

  it("embeds the size in every row for every alphabet", () => {
    const size = 15;
    for (const id of ["url-safe", "hex"]) {
      const rows = nanoIdSnippets(size, id);
      for (const row of rows) {
        expect(row.code).toContain(String(size));
        expect(row.full).toContain(String(size));
      }
    }
  });

  it("scaffolds a runnable go program in full mode", () => {
    const rows = nanoIdSnippets(21, "url-safe");
    const go = rows.find((r) => r.lang === "go");
    expect(go.full).toContain("package main");
    expect(go.full).toContain("func main()");
    expect(go.full).toContain("go-nanoid");
  });
});
