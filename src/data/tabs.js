// The single source of truth for the top-bar tabs: their id (also the route
// segment and `activeTab` value) and human label. ToolbarNav renders these and
// TabAnnouncer reads the labels for its live-region announcement, so the two
// stay in sync from one list. Keep the order aligned with the ⌥⇧1…5 jump keys
// in useKeyboardShortcuts.
export const TABS = [
  { id: "generator", label: "Generator" },
  { id: "validator", label: "Validator" },
  { id: "converter", label: "Converter" },
  { id: "ulid", label: "ULID" },
  { id: "nanoid", label: "NanoID" },
];

export default TABS;
