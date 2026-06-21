// Grouped by scope so the reference overlay mirrors how the shortcuts actually
// behave: Global keys work everywhere, the rest only act on their own tab.
// Groups carry a `tab` id so ShortcutReference can show only the active tab's
// section (groups without a `tab` are global and always shown).
// IMPORTANT: keep this in sync with useKeyboardShortcuts.js by hand.
//
// Unified verb keys, dispatched per active tab:
//   ⌘Enter  → generate / mint   (generator, ulid, nanoid)
//   ⌥⇧C     → copy all output    (generator, nanoid)
//   ⌥⌫      → clear the input    (validator, converter, ulid)
const SHORTCUTS = [
  {
    group: "Global",
    items: [
      {
        combo: "⌥/Alt + Shift + 1 … 5",
        description: "Jump to a tab: Generator, Validator, Converter, ULID, NanoID",
      },
      {
        combo: "⌥/Alt + Shift + ← / →",
        description: "Cycle to the previous / next tab (wraps at the ends)",
      },
      {
        combo: "Shift + ?",
        description: "Open this shortcut reference",
      },
      {
        combo: "Esc",
        description: "Close the shortcut reference",
      },
    ],
  },
  {
    group: "Generator",
    tab: "generator",
    items: [
      {
        combo: "⌘/Ctrl + Enter",
        description: "Regenerate the latest UUID batch",
      },
      {
        combo: "⌥/Alt + Arrow Up / Down",
        description: "Adjust batch size (hold Shift for ±10)",
      },
      {
        combo: "⌥/Alt + 1 … 8",
        description: "Switch generators: v4, v1, v6, v7, v3, v5, nil, max",
      },
      {
        combo: "⌥/Alt + U / H / B",
        description: "Toggle uppercase, remove hyphens, wrap braces",
      },
      {
        combo: "⌥/Alt + C",
        description: "Cycle export format: txt, json, csv, sql, env",
      },
      {
        combo: "⌘/Ctrl + Alt + S",
        description: "Download the batch in the selected export format",
      },
      {
        combo: "⌘/Ctrl + Shift + C",
        description: "Copy the first UUID in the batch",
      },
      {
        combo: "⌥/Alt + Shift + C",
        description: "Copy the whole visible batch",
      },
    ],
  },
  {
    group: "Validator",
    tab: "validator",
    items: [
      {
        combo: "⌥/Alt + R",
        description: "Toggle strict RFC validation",
      },
      {
        combo: "⌥/Alt + [",
        description: "Toggle allow surrounding braces",
      },
      {
        combo: "⌥/Alt + -",
        description: "Toggle allow UUIDs without hyphens",
      },
      {
        combo: "⌥/Alt + Backspace",
        description: "Clear the input",
      },
    ],
  },
  {
    group: "Converter",
    tab: "converter",
    items: [
      {
        combo: "⌥/Alt + Backspace",
        description: "Clear the input",
      },
    ],
  },
  {
    group: "ULID",
    tab: "ulid",
    items: [
      {
        combo: "⌘/Ctrl + Enter",
        description: "Mint a new ULID",
      },
      {
        combo: "⌥/Alt + Backspace",
        description: "Clear the input",
      },
    ],
  },
  {
    group: "NanoID",
    tab: "nanoid",
    items: [
      {
        combo: "⌘/Ctrl + Enter",
        description: "Mint a fresh batch of NanoIDs",
      },
      {
        combo: "⌥/Alt + Shift + C",
        description: "Copy the whole batch",
      },
    ],
  },
];

export default SHORTCUTS;
