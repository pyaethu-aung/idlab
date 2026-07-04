// idlab groups its tools by ID family first, operation second. The six
// internal "leaf" ids (generator / validator / converter / ulid / nanoid /
// ksuid) remain the source of truth that drives panel rendering (App.jsx) and
// the keyboard map (useKeyboardShortcuts). This file is the presentation layer
// that groups those leaves under their ID family and owns the URL <-> leaf
// routing for the family/mode scheme. ToolbarNav renders the families,
// ModeSwitcher renders a family's modes, TabAnnouncer reads the announce
// labels, and useActiveTab consumes the routing helpers.
//
// Keep the leaf order (LEAF_ORDER) aligned with the ⌥⇧1…6 jump keys and
// TAB_ORDER in useKeyboardShortcuts.
export const FAMILIES = [
  {
    id: "uuid",
    label: "UUID",
    modes: [
      { leaf: "generator", id: "generate", label: "Generate", path: "/uuid/generate" },
      { leaf: "validator", id: "validate", label: "Validate", path: "/uuid/validate" },
      { leaf: "converter", id: "convert", label: "Convert", path: "/uuid/convert" },
    ],
  },
  {
    id: "ulid",
    label: "ULID",
    modes: [{ leaf: "ulid", id: "ulid", label: "ULID", path: "/ulid" }],
  },
  {
    id: "nanoid",
    label: "NanoID",
    modes: [{ leaf: "nanoid", id: "nanoid", label: "NanoID", path: "/nanoid" }],
  },
  {
    id: "ksuid",
    label: "KSUID",
    modes: [{ leaf: "ksuid", id: "ksuid", label: "KSUID", path: "/ksuid" }],
  },
];

// Flat leaf order — matches the ⌥⇧1…5 jump-key order in useKeyboardShortcuts.
export const LEAF_ORDER = FAMILIES.flatMap((family) =>
  family.modes.map((mode) => mode.leaf)
);

// leaf -> { family, mode }
const LEAF_INDEX = Object.fromEntries(
  FAMILIES.flatMap((family) =>
    family.modes.map((mode) => [mode.leaf, { family, mode }])
  )
);

const DEFAULT_LEAF = FAMILIES[0].modes[0].leaf;

// The family that owns a leaf (falls back to the first family for unknowns).
export function familyOfLeaf(leaf) {
  return (LEAF_INDEX[leaf] ?? LEAF_INDEX[DEFAULT_LEAF]).family;
}

// The mode descriptor for a leaf.
export function modeOfLeaf(leaf) {
  return (LEAF_INDEX[leaf] ?? LEAF_INDEX[DEFAULT_LEAF]).mode;
}

// Human label for the live-region announcement, e.g. "UUID Generate" or "ULID".
// Single-mode families speak only the family name (the mode adds nothing).
export function announceLabel(leaf) {
  const entry = LEAF_INDEX[leaf];
  if (!entry) return leaf;
  const { family, mode } = entry;
  return family.modes.length > 1 ? `${family.label} ${mode.label}` : family.label;
}

// Canonical path for a leaf, e.g. generator -> "/uuid/generate".
export function pathForLeaf(leaf) {
  return modeOfLeaf(leaf).path;
}

// Legacy single-segment routes, kept alive so old links and bookmarks survive
// the rebrand. (/bulk had already folded into the validator.)
const LEGACY_PATHS = {
  "/generator": "generator",
  "/validator": "validator",
  "/bulk": "validator",
  "/converter": "converter",
};

// Resolve any pathname (new canonical, bare family, or legacy) to a leaf.
export function leafForPath(pathname) {
  if (pathname.startsWith("/uuid")) {
    const mode = FAMILIES[0].modes.find((m) => pathname.startsWith(m.path));
    return mode ? mode.leaf : DEFAULT_LEAF; // bare /uuid -> first mode
  }
  if (pathname.startsWith("/ulid")) return "ulid";
  if (pathname.startsWith("/nanoid")) return "nanoid";
  if (pathname.startsWith("/ksuid")) return "ksuid";
  for (const [prefix, leaf] of Object.entries(LEGACY_PATHS)) {
    if (pathname.startsWith(prefix)) return leaf;
  }
  return DEFAULT_LEAF;
}

export default FAMILIES;
