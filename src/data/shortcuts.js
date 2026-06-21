// Grouped by scope so the reference overlay mirrors how the shortcuts actually
// behave: Global keys work everywhere, the rest only act on their own tab.
// IMPORTANT: keep this in sync with useKeyboardShortcuts.js by hand.
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
        description: "Cycle to the previous / next tab",
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
    ],
  },
];

export default SHORTCUTS;
