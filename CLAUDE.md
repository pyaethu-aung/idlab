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

**Theming:** Tailwind is loaded via the `@tailwindcss/vite` plugin (no `tailwind.config.js`). All theme-sensitive colours are CSS custom properties defined in `index.css` under `:root` (dark, the default) and `:root[data-theme="light"]`. Components reference these via utility class names like `theme-text-primary`; no Tailwind `dark:` variant is used.

**UUID utilities (`src/utils/uuid.js`):** All generation and formatting logic is here. `buildBatch` produces arrays, `formatUuid` applies the three output options (uppercase, trimHyphens, wrapBraces) in order. `uuidGenerators` wraps the `uuid` npm package with a `crypto.randomUUID` fallback for environments where the package functions are unavailable.

**Static data (`src/data/shortcuts.js`):** The keyboard shortcut reference overlay is driven entirely from this data file — `useKeyboardShortcuts` and `ShortcutReference` must stay in sync with it manually.

## Testing

Tests live alongside their source files. `src/setupTests.js` imports `@testing-library/jest-dom/vitest` for DOM matchers. Vitest runs in a jsdom environment with globals enabled — no explicit imports of `describe`, `it`, or `expect` needed in test files.
