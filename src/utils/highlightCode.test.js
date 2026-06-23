import { describe, expect, it } from "vitest";
import highlightCode from "./highlightCode";

const join = (tokens) => tokens.map((t) => t.text).join("");
const typeOf = (tokens, text) => tokens.find((t) => t.text === text)?.type;

describe("highlightCode", () => {
  it("is lossless: concatenated token text equals the input", () => {
    const samples = [
      ["import { v4 as uuidv4 } from 'uuid'; uuidv4();", "js"],
      ["import uuid\n\nprint(uuid.uuid4())", "py"],
      ['package main\n\nfunc main() {\n\tfmt.Println(uuid.New())\n}', "go"],
      ["SELECT gen_random_uuid();  -- PostgreSQL 13+", "sql"],
    ];
    for (const [code, lang] of samples) {
      expect(join(highlightCode(code, lang))).toBe(code);
    }
  });

  it("colours line comments to end of line, per language", () => {
    expect(typeOf(highlightCode("uuid.New()  // github.com/google/uuid", "go"), "// github.com/google/uuid")).toBe(
      "comment"
    );
    expect(typeOf(highlightCode("uuid6()  # pip install uuid6", "py"), "# pip install uuid6")).toBe("comment");
    expect(typeOf(highlightCode("SELECT uuidv7();  -- PostgreSQL 18+", "sql"), "-- PostgreSQL 18+")).toBe(
      "comment"
    );
  });

  it("colours quoted strings including the quotes", () => {
    const tokens = highlightCode("import { v4 as uuidv4 } from 'uuid';", "js");
    expect(typeOf(tokens, "'uuid'")).toBe("string");

    const go = highlightCode('uuid.NewMD5(uuid.NameSpaceDNS, []byte("name"))', "go");
    expect(typeOf(go, '"name"')).toBe("string");
  });

  it("colours per-language keywords", () => {
    expect(typeOf(highlightCode("import uuid; uuid.uuid4()", "py"), "import")).toBe("keyword");
    expect(typeOf(highlightCode("package main", "go"), "package")).toBe("keyword");
    expect(typeOf(highlightCode("public class Main {", "java"), "class")).toBe("keyword");
    expect(typeOf(highlightCode("SELECT gen_random_uuid();", "sql"), "SELECT")).toBe("keyword");
  });

  it("colours an identifier as a function only when followed by (", () => {
    const tokens = highlightCode("console.log(uuidv4());", "js");
    expect(typeOf(tokens, "log")).toBe("function");
    expect(typeOf(tokens, "uuidv4")).toBe("function");
    // console is followed by ".", not "(", so it stays plain (coalesced with
    // the dot into one plain token).
    expect(tokens.find((t) => t.text.includes("console")).type).toBe("plain");
  });

  it("colours integers as numbers (outside comments)", () => {
    // Bare number, not inside a comment.
    expect(typeOf(highlightCode("LIMIT 200", "sql"), "200")).toBe("number");
  });

  it("returns an empty list for empty input", () => {
    expect(highlightCode("", "js")).toEqual([]);
  });
});
