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
- `useActiveTab` — maps `/generator`, `/validator`, `/converter`, `/ulid`, and `/nanoid` paths to the active tab via `pushState`; listens for `popstate` so the browser back/forward buttons stay in sync. No client-side router needed. The retired `/bulk` path resolves to the validator (and rewrites the URL to `/validator` on load) since bulk validation is now folded in.
- `useUuidValidator` — the unified validator hook: handles one UUID or many by always parsing the textarea input as a list (`parseUuidList`), so a single UUID is just a list of one. Owns parse options, the parsed rows + valid/invalid/total summary, which row is expanded (a lone row auto-expands; many rows start collapsed), the expanded row's v1↔v6 conversion, per-row and copy-all-valid clipboard state, and a check counter that increments each time the valid set grows from empty. Replaces the former separate `useUuidBulk`.
- `useUuidConverter` — owns the converter's raw input and per-row copy state; delegates all representation math to `convertUuid` in `uuidConvert.js`.
- `useUlid` — owns ULID/UUIDv7 input, drives `inspectIdentifier` for decode, and exposes generate/clear/sample/copy helpers; tracks which sample pill is active.
- `useNanoId` — owns size, count, and alphabet selection; re-mints the full batch on every control change with explicit overrides so output stays in sync without waiting for a state flush; exposes entropy stats (bit strength, 1%-collision id count).
- `useTheme` — persists the selected theme to `localStorage` and writes `data-theme` on `<html>`. Returns `dark` by default and derives the initial value from `localStorage` falling back to `prefers-color-scheme`.
- `useBrowserThemeSync` — a side-effect-only hook that listens for OS-level `prefers-color-scheme` changes and syncs them while the app is open. Kept separate from `useTheme` so the media query listener lifecycle is isolated.
- `useKeyboardShortcuts` — attaches a single `keydown` listener on `window` and maps all keyboard shortcuts. Skips events when the target is a text input or when the shortcut overlay is open.

**Theming:** All design tokens (colour, type, space, radius, motion) are defined in `src/design-system/tokens.css` and imported by `index.css`. Theme-sensitive colours are set under `:root`/`[data-theme="dark"]` and `[data-theme="light"]`; accent palettes are set via `[data-accent="<name>"]`. The living token reference is `src/design-system/Design System.html` — open it directly in a browser. Tailwind is present via `@tailwindcss/vite` but all custom styling uses the token-based CSS classes defined in `index.css`.

**UUID utilities (`src/utils/uuid.js`):** All generation, conversion, and formatting logic is here. `buildBatch` produces arrays, `formatUuid` applies the three output options (uppercase, trimHyphens, wrapBraces) in order. `uuidGenerators` wraps the `uuid` npm package (v1/v3/v4/v5/v6/v7 plus the nil/max sentinels) with a `crypto.randomUUID` fallback for environments where the package functions are unavailable. `convertTimeUuid(value, version)` converts between the v1 and v6 forms of the same identifier via the package's `v1ToV6`/`v6ToV1`, returning `null` for any other version; it backs the validator's v1↔v6 conversion.

**ULID utilities (`src/utils/ulid.js`):** ULID generate/decode plus ULID↔UUIDv7 conversion, with no new runtime dependency. `generateUlid(seedTime?)` mints a 26-char Crockford Base32 ULID (48-bit ms timestamp + 80-bit `crypto.getRandomValues` randomness). `decodeUlid` parses a ULID back to timestamp/randomness/UUID forms; `ulidToUuid`/`uuidToUlid` do the lossless 128-bit reinterpretation (the same Crockford Base32 the Converter's `base32` row uses). `inspectIdentifier` is the ULID tab's single entry point: it accepts a ULID or a UUIDv7 (the only UUID version that shares ULID's ms-timestamp layout) and returns one decoded shape. Backed by the `useUlid` hook and `ULID` tab (`UlidPanel`); reuses `formatRelativeTime` from `uuidDecoder.js`.

**NanoID utilities (`src/utils/nanoid.js`):** NanoID generation plus entropy math, with no new runtime dependency. `generateNanoId(size, alphabet)` mints one URL-safe id using NanoID's own rejection-sampling algorithm over `crypto.getRandomValues` (a bit mask, not modulo, so the distribution stays uniform). `NANOID_ALPHABETS` holds the five presets (url-safe/alphanumeric/lowercase/hex/numbers); `alphabetById` resolves one. `idEntropyBits` and `collisionExponent` back the panel's entropy readout (bit strength and the log10 id count for a 1% birthday-bound collision). Backed by the `useNanoId` hook and `NanoID` tab (`NanoIdPanel`); generation-first, so the panel reuses the validator workbench shell rather than a paste/decode flow.

**Static data (`src/data/shortcuts.js`):** The keyboard shortcut reference overlay is driven entirely from this data file — `useKeyboardShortcuts` and `ShortcutReference` must stay in sync with it manually.

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

### Validation Checklist

Before marking any task complete, verify:

```bash
npm run test    # All tests pass, coverage ≥85%
npm run lint    # No linting errors
npm run build   # Build succeeds
```

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

