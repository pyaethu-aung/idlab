import { parseUuid } from "./uuidDecoder";

// Upper bound on rows parsed in a single pass. Keeps the O(n) parse well under
// the 200ms response budget even when someone pastes a runaway file; anything
// past this is reported via `summary.truncated` rather than silently dropped.
export const MAX_LINES = 1000;

// Parse a multi-line blob into one validation result per non-blank line.
// Blank / whitespace-only lines are skipped but never shift the reported line
// number, so an invalid entry maps back to the exact line the user pasted.
export function parseUuidList(text, options = {}) {
  const source = typeof text === "string" ? text : "";
  const lines = source.split(/\r?\n/);

  const rows = [];
  let valid = 0;
  let invalid = 0;
  let truncated = false;

  for (let i = 0; i < lines.length; i++) {
    const input = lines[i].trim();
    if (!input) continue;

    if (rows.length >= MAX_LINES) {
      truncated = true;
      break;
    }

    const result = parseUuid(input, options);
    if (result.valid) valid++;
    else invalid++;

    rows.push({ line: i + 1, input, result });
  }

  return {
    rows,
    summary: { valid, invalid, total: rows.length, truncated },
  };
}
