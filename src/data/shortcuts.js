const SHORTCUTS = [
  {
    combo: "⌘/Ctrl + Enter",
    description: "Regenerate the latest UUID batch",
  },
  {
    combo: "⌘/Ctrl + Alt + S",
    description: "Download the batch as a .txt file",
  },
  {
    combo: "⌘/Ctrl + Shift + C",
    description: "Copy the first UUID in the batch",
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
    combo: "Shift + ?",
    description: "Open the shortcut reference panel",
  },
  {
    combo: "Esc",
    description: "Close the shortcut panel",
  },
];

export default SHORTCUTS;
