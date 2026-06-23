# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # start dev server at http://localhost:5173
npm run build            # production build to dist/
npm run lint             # ESLint with cache
npm run test             # run all tests once
npm run test:coverage    # run tests with V8 coverage report
npm run docker:build     # build Docker image locally
npm run docker:run       # run container on port 8080
```

Run a single test file:
```bash
npx vitest run src/hooks/useUuidGenerator.test.js
```

## Architecture

This is a single-page React app with all state managed in custom hooks. `App.jsx` is a pure composition layer — it wires hooks together and passes values down to components; it contains no business logic of its own.

**Hook responsibilities:**
- `useUuidGenerator` — the central hook. Owns batch size (1–200), UUID version, formatting options, raw UUID array, copy/download state, and all derived values. The visible preview is capped at 20 (`visibleBatchSize`) while downloads generate the full `batchSize` (up to 200).
- `useActiveTab` — maps URL paths to the active **leaf** (`generator`, `validator`, `converter`, `ulid`, `nanoid`) via `pushState`; listens for `popstate` so the browser back/forward buttons stay in sync. No client-side router needed. The canonical scheme is family/mode: `/uuid/generate`, `/uuid/validate`, `/uuid/convert`, `/ulid`, `/nanoid` (a bare `/uuid` resolves to `/uuid/generate`). All routing knowledge lives in `src/data/tabs.js` (`leafForPath`, `pathForLeaf`); the hook just consumes it. On load it canonicalises the URL: `/`, bare `/uuid`, and every legacy path (`/generator`, `/validator`, `/bulk`, `/converter`) `replaceState` to the new scheme so old bookmarks survive the `idlab` rebrand. Every switch flows through `activeTab` (the leaf), which `TabAnnouncer` (a single always-mounted `role="status"` live region in `App`) reads via `announceLabel` to announce the new tool to screen readers (e.g. "UUID Generate", "ULID"), covering keyboard-shortcut switches that move no focus. It stays silent on first load via a previous-value ref comparison (StrictMode-safe; a boolean first-render flag would announce the default tab on load).
- `useUuidValidator` — the unified validator hook: handles one UUID or many by always parsing the textarea input as a list (`parseUuidList`), so a single UUID is just a list of one. Owns parse options, the parsed rows + valid/invalid/total summary, which row is expanded (a lone row auto-expands; many rows start collapsed), the expanded row's v1↔v6 conversion, per-row and copy-all-valid clipboard state, and a check counter that increments each time the valid set grows from empty. Replaces the former separate `useUuidBulk`.
- `useUuidConverter` — owns the converter's raw input and per-row copy state; delegates all representation math to `convertUuid` in `uuidConvert.js`.
- `useUlid` — owns ULID/UUIDv7 input, drives `inspectIdentifier` for decode, and exposes generate/clear/sample/copy helpers; tracks which sample pill is active.
- `useNanoId` — owns size, count, and alphabet selection; re-mints the full batch on every control change with explicit overrides so output stays in sync without waiting for a state flush; exposes entropy stats (bit strength, 1%-collision id count).
- `useCodeSnippets` — owns the Generator's "Copy as code" panel view state: the `inline`/`full` toggle (defaults to `full`, the complete runnable program; flip the `useState` initial to make inline the default), the transient per-language copied flash, and a `clipboardError` flag for the unavailable-clipboard fallback. The snippet text itself is static data from `snippetsFor` (`src/data/codeSnippets.js`); the hook adds no generation logic. State lives here rather than in the component so the same `toggleFull`/`copyDefault` actions are driven by both the panel buttons and the keyboard map (`⌥F`/`⌥S`). `copyDefault` copies the JS row (`DEFAULT_LANG`) for the current version, honoring the toggle. Backed by `CodeSnippets`.
- `useTheme` — persists the selected theme to `localStorage` and writes `data-theme` on `<html>`. Returns `dark` by default and derives the initial value from `localStorage` falling back to `prefers-color-scheme`.
- `useBrowserThemeSync` — a side-effect-only hook that listens for OS-level `prefers-color-scheme` changes and syncs them while the app is open. Kept separate from `useTheme` so the media query listener lifecycle is isolated.
- `useKeyboardShortcuts` — attaches a single `keydown` listener on `window` and maps all keyboard shortcuts. Skips events when the target is a text input or when the shortcut overlay is open. Receives `activeTab`, `setActiveTab`, and a `tabActions` map (`{ [tab]: { generate, copyAll, clear } }`) so the shared verb keys dispatch to the active tab. Unified verbs: `⌘Enter` generates/mints (generator regenerate, ulid generate, nanoid regenerate), `⌥⇧C` copies all output (generator, nanoid), `⌥⌫` clears the input (validator, converter, ulid); a missing slot makes the verb a no-op (and does not `preventDefault`) on that tab. Global: `⌥⇧1…5` jump to a tool (the five leaves in `LEAF_ORDER`: UUID Generate/Validate/Convert, ULID, NanoID) and `⌥⇧←/→` cycle them (checked before the version digits so shifted digits route to tools, not versions). The nav presents these five leaves grouped under three ID families (UUID/ULID/NanoID); the jump keys still address leaves directly, so the keyboard map is unchanged by the family/mode grouping. Generator-only: `⌥C` cycles export format, `⌥F` flips the "Copy as code" panel between inline and full, `⌥S` copies the JS snippet for the current version (distinct from `⌘⌥S` download, which is checked first), plus the version/batch/format keys. Validator-only: the accept-option keys (`⌥R`, `⌥[`, `⌥-`) fire when `activeTab === "validator"`.

**Theming:** All design tokens (colour, type, space, radius, motion) are defined in `src/design-system/tokens.css` and imported by `index.css`. Theme-sensitive colours are set under `:root`/`[data-theme="dark"]` and `[data-theme="light"]`; accent palettes are set via `[data-accent="<name>"]`. The living token reference is `src/design-system/Design System.html` — open it directly in a browser. Tailwind is present via `@tailwindcss/vite` but all custom styling uses the token-based CSS classes defined in `index.css`.

**UUID utilities (`src/utils/uuid.js`):** All generation, conversion, and formatting logic is here. `buildBatch` produces arrays, `formatUuid` applies the three output options (uppercase, trimHyphens, wrapBraces) in order. `uuidGenerators` wraps the `uuid` npm package (v1/v3/v4/v5/v6/v7 plus the nil/max sentinels) with a `crypto.randomUUID` fallback for environments where the package functions are unavailable. `convertTimeUuid(value, version)` converts between the v1 and v6 forms of the same identifier via the package's `v1ToV6`/`v6ToV1`, returning `null` for any other version; it backs the validator's v1↔v6 conversion.

**ULID utilities (`src/utils/ulid.js`):** ULID generate/decode plus ULID↔UUIDv7 conversion, with no new runtime dependency. `generateUlid(seedTime?)` mints a 26-char Crockford Base32 ULID (48-bit ms timestamp + 80-bit `crypto.getRandomValues` randomness). `decodeUlid` parses a ULID back to timestamp/randomness/UUID forms; `ulidToUuid`/`uuidToUlid` do the lossless 128-bit reinterpretation (the same Crockford Base32 the Converter's `base32` row uses). `inspectIdentifier` is the ULID tab's single entry point: it accepts a ULID or a UUIDv7 (the only UUID version that shares ULID's ms-timestamp layout) and returns one decoded shape. Backed by the `useUlid` hook and `ULID` tab (`UlidPanel`); reuses `formatRelativeTime` from `uuidDecoder.js`.

**NanoID utilities (`src/utils/nanoid.js`):** NanoID generation plus entropy math, with no new runtime dependency. `generateNanoId(size, alphabet)` mints one URL-safe id using NanoID's own rejection-sampling algorithm over `crypto.getRandomValues` (a bit mask, not modulo, so the distribution stays uniform). `NANOID_ALPHABETS` holds the five presets (url-safe/alphanumeric/lowercase/hex/numbers); `alphabetById` resolves one. `idEntropyBits` and `collisionExponent` back the panel's entropy readout (bit strength and the log10 id count for a 1% birthday-bound collision). Backed by the `useNanoId` hook and `NanoID` tab (`NanoIdPanel`); generation-first, so the panel reuses the validator workbench shell rather than a paste/decode flow.

**Syntax highlighting (`src/utils/highlightCode.js`):** A minimal, dependency-free tokenizer for the "Copy as code" snippet corpus only (js/py/go/java/sql). Not a general highlighter: it recognizes line comments, quoted strings, the handful of per-language keywords that appear in the snippets, call names (an identifier followed by `(`), and integers; everything else is `plain`. Returns a flat `{ type, text }` list (adjacent same-type tokens coalesced) that `CodeSnippets` maps to `<span class="tok-{type}">`. Colours are the `--syn-*` tokens in `tokens.css` (a deliberate, documented exception to the one-accent rule, held to the neutral ramp's lightness band); comments reuse `--ink-3`.

**Static data (`src/data/tabs.js`):** The ID-family navigation model and the URL routing for it. `FAMILIES` groups the five internal **leaf** ids (`generator`/`validator`/`converter`/`ulid`/`nanoid`, which still drive panel rendering in `App.jsx` and the keyboard map) under three ID families: `uuid` (modes Generate/Validate/Convert), `ulid`, and `nanoid` (single-mode). The leaves stay the source of truth; this file is the presentation + routing layer. Exports: `LEAF_ORDER` (flat, matches `⌥⇧1…5`), `familyOfLeaf`/`modeOfLeaf`, `announceLabel` (for `TabAnnouncer`), and `pathForLeaf`/`leafForPath` (for `useActiveTab`, including legacy-path fallbacks). `ToolbarNav` renders the families; `ModeSwitcher` renders a family's modes (only when there's more than one). Keep `LEAF_ORDER` aligned with the `⌥⇧1…5` jump keys and `TAB_ORDER` in `useKeyboardShortcuts`.

**Static data (`src/data/shortcuts.js`):** The keyboard shortcut reference overlay is driven entirely from this data file, a list of scope-grouped sections (`{ group, tab?, items: [{ combo, description }] }`): Global, UUID Generate, UUID Validate, UUID Convert, ULID, NanoID. Group labels are display strings; the `tab` ids stay the internal leaf ids (`generator`/`validator`/`converter`/`ulid`/`nanoid`) that `ShortcutReference` matches against `activeTab`. A group with no `tab` is global; a tab-scoped group carries its `tab` id and `ShortcutReference` shows it only when `activeTab` matches (so the overlay is context-aware). `useKeyboardShortcuts` and `ShortcutReference` must stay in sync with it manually. `ShortcutReference` also accepts a flat `{ combo, description }` array (it normalizes either shape) so tests can pass the simple form.

## Testing

Tests live alongside their source files. `src/setupTests.js` imports `@testing-library/jest-dom/vitest` for DOM matchers. Vitest runs in a jsdom environment with globals enabled — no explicit imports of `describe`, `it`, or `expect` needed in test files.

- Every file in `src/utils/` MUST have a corresponding test file (Vitest)
- Tests must be deterministic, fast, and independent
- Regression tests are required for all bug fixes
- Maintain coverage at or above 85%

## Governance

### Core Principles Summary

| # | Principle | Key Rule |
|---|-----------|----------|
| I | Code Quality & Craftsmanship | No dead code, lint-clean, readable, modular |
| II | Testing & Execution Discipline | 85% coverage, every utility has tests, TDD encouraged |
| III | User Experience Consistency | Consistent interfaces, docs match implementation |
| IV | Performance Requirements | <200ms response, O(n) preferred, bounded resources |
| V | Architecture & Structure | `src/components`, `src/hooks`, `src/utils`, `src/data`, `src/design-system` |
| VI | Execution Discipline | Run `npm run test`, `npm run lint`, `npm run build` after every task |
| VII | Cross-Platform & Browser Compatibility | Chrome, Safari, Firefox, Edge; desktop & mobile |
| VIII | Theme Support Planning | CSS custom properties, prefers-color-scheme, localStorage persistence |
| IX | YAGNI (You Aren't Gonna Need It) | Build only what a real caller needs now; no speculative code |

### YAGNI (Principle IX)

Default to the simplest thing that satisfies a present, real requirement. Do not
add code in anticipation of a need that does not yet exist. This refines
Principle I ("No dead code") into a rule that applies *before* code is written,
not just after.

**Do not add:**
- Exported functions, constants, or data with no importer (e.g. config/metadata
  arrays the UI never reads). Define values where they are used.
- Parameters, options, or config keys with only one caller that always passes the
  same value. Add the second path when a second real caller arrives.
- Setters, hooks, or wrappers that exist "for completeness" but nothing calls
  (e.g. an explicit setter when only a toggle is used).
- Abstractions with a single implementation/caller, unless the indirection
  measurably aids readability. Prefer inlining.
- Defensive handling for inputs or states that cannot occur given actual callers.

**Do keep (not YAGNI violations):**
- Functions that back a real feature but are exported only for unit-test
  granularity. A test is not a "use," but the feature it tests is. Removing it
  would delete working, tested behaviour. Prefer narrowing the export to keeping
  it tested. Never delete tested feature code just because no component imports it.
- Small local helpers used more than once, or stable lookup tables that make a
  component readable. Simplicity, not maximal deletion, is the goal.

**When adding generality, justify it.** If a change introduces a parameter,
option, or abstraction, the same change must include the real caller that needs
it. "We might need it later" is not a justification: add it later, when later
arrives. When unsure, choose the less general option and note the trade-off.

Mechanical enforcement of unused *exports* across modules is not configured;
ESLint `no-unused-vars` only catches unused locals (and its `^[A-Z_]` ignore
pattern skips capitalized consts). Reviewers and authors must catch unused
exports by hand, or by grepping for an export's name across `src/` before keeping
it. Adding `eslint-plugin-import`'s `import/no-unused-modules` is the option if
automated enforcement becomes worthwhile (weigh the dependency against the need,
per this principle).

### Validation Checklist

Before marking any task complete, verify:

```bash
npm run test    # All tests pass, coverage ≥85%
npm run lint    # No linting errors
npm run build   # Build succeeds
```

Also confirm no YAGNI violations were introduced (Principle IX): every new
export has a real caller, no new single-use parameter/option/abstraction was
added without the caller that needs it, and any dead code touched was removed.

### Commit Discipline

- **Subject line**: ≤50 characters, imperative mood, no period
- **Body lines**: ≤72 characters
- **Prefix**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Rule**: One commit per completed task/phase

## Active Features Context

### 002-auto-vuln-updates

**Automated Dependency Vulnerability Updates**

- **Configuration**: Managed via `.github/dependabot.yml` (npm ecosystem, daily schedule).
- **Auto-Merge Policy**: **STRICTLY FORBIDDEN**. All security PRs must be manually reviewed.
- **Key Files**: `.github/dependabot.yml`.

### 003-docker-containerization

**Docker Integration**

- **Build**: Multi-stage `Dockerfile` (Node 20 -> Nginx Alpine).
- **Security**: Non-root user, read-only FS, Trivy scanning (blocking fixable HIGH/CRITICAL).
- **Target**: Linux/AMD64 only (<5min build time).
- **Registry**: GHCR.

