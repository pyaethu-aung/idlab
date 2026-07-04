# idlab — develop-web-feature baseline

## Gates
`npm run test && npm run lint && npm run build` (also `npm run test:coverage` ≥85%, `npm run test:e2e` for e2e).
Gate runner: `dwf-gates` (add `--coverage` / `--e2e`). Confirmed green 2026-07-05 after
adding `.github/hooks`/`.github/skills` to eslint ignores (impeccable skill install
vendors JS there; not app source — mirrors existing `.claude`/`.agents` ignores).
NOT a gate: no formatter backlog found; `test:e2e:ui` is interactive only, not a CI gate.

## Feature pattern (single-mode ID family, e.g. ULID/NanoID → template for KSUID)
- `src/utils/<id>.js` — generation/decode/entropy logic, no framework deps.
- `src/utils/<id>.test.js` — vitest, one file per util (required, 85% coverage floor).
- `src/hooks/use<Id>.js` — owns all state/derived values for the tab; `App.jsx` stays a
  pure composition layer.
- `src/hooks/use<Id>.test.js`.
- `src/components/<Id>Panel.jsx` — reuses the shared validator workbench shell classes
  (`.v-workbench` / `.v-rail` / `.v-panel-view`, `.ulid-repr`, `.cx-row`/`.cx-copy`,
  `RowCopyButton`). No new CSS needed for a family that fits this shell.
- `src/data/tabs.js` — add a `FAMILIES` entry `{ id, label, modes: [{ leaf, id, label, path }] }`
  for a single-mode family; extend `LEAF_ORDER` (flat list, drives `⌥⇧1…5` jump keys);
  `pathForLeaf`/`leafForPath` need the new route.
- `src/data/shortcuts.js` — add a tab-scoped group `{ group, tab: "<leaf>", items: [...] }`
  using the unified verbs (`⌘Enter` generate, `⌥⇧C` copy-all, `⌥⌫` clear).
- `src/hooks/useKeyboardShortcuts.js` — `TAB_ORDER`/`tabActions` map already generic;
  add the new leaf's `{ generate, copyAll, clear }` slot (missing slot = no-op).
- `App.jsx` — import hook + panel, instantiate hook, add `tabActions` entry, conditional
  render block (`display: activeTab === "<leaf>" ? "" : "none"`).
- `e2e/<id>.spec.js` — Playwright, one scenario per test, role-based selectors.
- `src/data/codeSnippets.js` — per-version snippet rows if the family gets a "Copy as
  code" panel (existing convention: js/py/go/java/sql tokenized by `highlightCode.js`).

Hook API shape varies by family intent: `useUlid` is inspect-first (rawInput/result/
generate/clearInput/loadSample/copyValue); `useNanoId` is generate-first with a batch
(size/count/alphabetId/ids/stats/regenerate/copyAll). KSUID (timestamp+payload, no
batch UI planned per PRODUCT.md) is closer to the ULID shape — decide exact API in
Phase 1 craft/shape, not copied blindly.

## Enforcement
No PreToolUse hooks in `.claude/settings.json` for commit/PR routing (only the
impeccable post-edit design-detector hook). Branch naming: `<type>/<slug>` per user's
own convention (see memory). No pre-push hook blocking default-branch pushes currently.
Commits/PRs route through `git-workflow:commit-message` / `git-workflow:create-pr`
skills per user preference, not a hard hook gate.

## Design system
Tokens: `src/design-system/tokens.css` (OKLCH, warm-void neutral ramp hue 60°, one
swappable accent via `[data-accent]`). Register: `product` (PRODUCT.md/DESIGN.md at
repo root, both current and thorough — no refresh needed). "Terminal-luxury": dense,
monospace-first (Geist Mono for chrome/data, Geist Sans for display/prose only),
1px hairline borders, no shadows except modal lift, slashed-zero font feature on all
mono text. PRODUCT.md explicitly names KSUID as a planned family ("room for more
families (KSUID, Snowflake)").

## What is NOT a gate
Root-level stray files (screenshots, `.impeccable/critique/` snapshots, `REVIEW.md`)
are pre-existing clutter noted in an existing `REVIEW.md` review doc, unrelated to
this feature — do not clean up as part of KSUID work unless asked.
