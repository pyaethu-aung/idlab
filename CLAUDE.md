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
- `useTheme` — persists the selected theme to `localStorage` and writes `data-theme` on `<html>`. Returns `dark` by default and derives the initial value from `localStorage` falling back to `prefers-color-scheme`.
- `useBrowserThemeSync` — a side-effect-only hook that listens for OS-level `prefers-color-scheme` changes and syncs them while the app is open. Kept separate from `useTheme` so the media query listener lifecycle is isolated.
- `useKeyboardShortcuts` — attaches a single `keydown` listener on `window` and maps all keyboard shortcuts. Skips events when the target is a text input or when the shortcut overlay is open.

**Theming:** All design tokens (colour, type, space, radius, motion) are defined in `src/design-system/tokens.css` and imported by `index.css`. Theme-sensitive colours are set under `:root`/`[data-theme="dark"]` and `[data-theme="light"]`; accent palettes are set via `[data-accent="<name>"]`. The living token reference is `src/design-system/Design System.html` — open it directly in a browser. Tailwind is present via `@tailwindcss/vite` but all custom styling uses the token-based CSS classes defined in `index.css`.

**UUID utilities (`src/utils/uuid.js`):** All generation and formatting logic is here. `buildBatch` produces arrays, `formatUuid` applies the three output options (uppercase, trimHyphens, wrapBraces) in order. `uuidGenerators` wraps the `uuid` npm package with a `crypto.randomUUID` fallback for environments where the package functions are unavailable.

**Static data (`src/data/shortcuts.js`):** The keyboard shortcut reference overlay is driven entirely from this data file — `useKeyboardShortcuts` and `ShortcutReference` must stay in sync with it manually.

## Testing

Tests live alongside their source files. `src/setupTests.js` imports `@testing-library/jest-dom/vitest` for DOM matchers. Vitest runs in a jsdom environment with globals enabled — no explicit imports of `describe`, `it`, or `expect` needed in test files.

- Every file in `src/utils/` MUST have a corresponding test file (Vitest)
- Tests must be deterministic, fast, and independent
- Regression tests are required for all bug fixes
- Maintain coverage at or above 85%

## Governance

Refer to `.specify/memory/constitution.md` (v2.3.1) for the authoritative governance document.

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
| IX | Skill-Driven Development | Consult any skill under `.agents/skills/` as primary source truth |

### Required Skills

Consult any skill present under `.agents/skills/` (invocable via `/<skill-name>`) as Primary Source Truth during planning and implementation. Where a skill governs a domain touched by the current task, consult it before generating code or artifacts.

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
