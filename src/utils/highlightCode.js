// Minimal, dependency-free syntax highlighter for the fixed snippet corpus in
// the Generator's "Copy as code" panel (js/py/go/java/sql). It is NOT a general
// tokenizer: it recognizes just enough — line comments, quoted strings,
// per-language keywords, call names, and integers — to colour these specific
// snippets like an editor. Anything else falls through as plain text.
//
// Returns a flat token list ({ type, text }) so the renderer maps each to a
// <span class="tok-{type}">. Adjacent same-type tokens are coalesced so the
// span count stays small. Token types: comment, string, keyword, function,
// number, plain.

// Line-comment opener per language (the corpus has no block comments).
const LINE_COMMENT = { js: "//", go: "//", java: "//", py: "#", sql: "--" };

// Only the keywords that actually appear in the snippets (outside comments).
const KEYWORDS = {
  js: ["import", "from", "as"],
  py: ["from", "import"],
  go: ["package", "import", "func"],
  java: ["import", "public", "class", "static", "void"],
  sql: ["SELECT"],
};

const IDENT = /[A-Za-z_][A-Za-z0-9_]*/y;
const NUMBER = /\d+/y;
const WS = /\s+/y;

export function highlightCode(code, lang) {
  const tokens = [];
  const comment = LINE_COMMENT[lang] ?? "//";
  const keywords = new Set(KEYWORDS[lang] ?? []);
  const n = code.length;
  let i = 0;

  const push = (type, text) => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && last.type === type) last.text += text;
    else tokens.push({ type, text });
  };

  while (i < n) {
    const ch = code[i];

    // Line comment: everything up to (not including) the newline.
    if (code.startsWith(comment, i)) {
      let end = code.indexOf("\n", i);
      if (end === -1) end = n;
      push("comment", code.slice(i, end));
      i = end;
      continue;
    }

    // String literal (single or double quoted; the corpus has no escapes).
    if (ch === "'" || ch === '"') {
      let j = i + 1;
      while (j < n && code[j] !== ch) j += 1;
      j = j < n ? j + 1 : n; // include the closing quote when present
      push("string", code.slice(i, j));
      i = j;
      continue;
    }

    WS.lastIndex = i;
    const ws = WS.exec(code);
    if (ws && ws.index === i) {
      push("plain", ws[0]);
      i = WS.lastIndex;
      continue;
    }

    NUMBER.lastIndex = i;
    const num = NUMBER.exec(code);
    if (num && num.index === i) {
      push("number", num[0]);
      i = NUMBER.lastIndex;
      continue;
    }

    IDENT.lastIndex = i;
    const id = IDENT.exec(code);
    if (id && id.index === i) {
      const word = id[0];
      i = IDENT.lastIndex;
      if (keywords.has(word)) {
        push("keyword", word);
      } else {
        // A call when the next non-space character is "(".
        let k = i;
        while (k < n && (code[k] === " " || code[k] === "\t")) k += 1;
        push(code[k] === "(" ? "function" : "plain", word);
      }
      continue;
    }

    // Punctuation and anything else: one character of plain text.
    push("plain", ch);
    i += 1;
  }

  return tokens;
}

export default highlightCode;
