# idlab: AI-Oriented Overview

This document summarizes the project structure, behaviors, and extension points so an AI agent can quickly reason about and modify the app. Paths are workspace-relative.

## Purpose & UX

- React + Vite single-page app for generating RFC 4122 UUID batches with formatting controls.
- Shows up to 20 UUIDs live; download up to 200 as newline-delimited text. Copy individual UUIDs with feedback.
- Tailwind-driven styling with light/dark themes stored in `localStorage`; gradients and glassmorphism aesthetic.
- Keyboard shortcuts cover regeneration, download, format toggles, version switches, and batch size tweaks.

## Build, Run, Test

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Tests: `npm test` (Vitest + Testing Library)

## Entry & Layout

- Mount: [src/main.jsx](src/main.jsx) renders `<App />` inside `#root` with `StrictMode`.
- Shell: [src/App.jsx](src/App.jsx) orchestrates theme, keyboard shortcuts, and generator state. Layout = hero + main card (insights + list + actions) + control panel + shortcut modal.

## State & Core Logic

- UUID state hook: [src/hooks/useUuidGenerator.js](src/hooks/useUuidGenerator.js)
  - `batchSize` (1–200), `visibleBatchSize` (1–20), `selectedVersion` (`v1|v4|v7`), `options` (uppercase, trim hyphens, wrap braces).
  - Builds batches via `buildBatch` + `uuidGenerators` from [src/utils/uuid.js](src/utils/uuid.js); formats through `formatUuid` respecting options.
  - Actions: `regenerate`, `handleVersionChange`, `toggleOption`, `setBatchSizeAndCommit`, `commitBatchSize`, `handleCopy` (Clipboard API guarded), `downloadList` (Blob + timestamped filename), feedback + busy states with timers.
- Keyboard shortcuts: [src/hooks/useKeyboardShortcuts.js](src/hooks/useKeyboardShortcuts.js)
  - Ignores inputs/content-editables; binds combos (meta/ctrl + enter, meta/ctrl + alt + S, etc.) to generator actions and modal toggle.
- Theme: [src/hooks/useTheme.js](src/hooks/useTheme.js)
  - Persists `dark|light` to `localStorage`, syncs `data-theme` attribute, toggle helper returned.

## UI Components (key pieces)

- Hero: [src/components/Hero.jsx](src/components/Hero.jsx) with headline and feedback banner.
- InsightCards: [src/components/InsightCards.jsx](src/components/InsightCards.jsx) showing version, batch size, and character count.
- UuidList: [src/components/UuidList.jsx](src/components/UuidList.jsx) renders numbered list with copy buttons and copied-state feedback.
- ControlPanel: [src/components/ControlPanel.jsx](src/components/ControlPanel.jsx)
  - Batch slider (1–200) commits on pointer/key release; notes preview vs download counts.
  - Version selector uses `versionChoices`; option toggles use `optionDescriptors` (both from utils).
  - Primary generate button + clipboard warning fallback.
- ThemeToggle: [src/components/ThemeToggle.jsx](src/components/ThemeToggle.jsx) switches light/dark.
- ShortcutReference: [src/components/ShortcutReference.jsx](src/components/ShortcutReference.jsx) modal using `focus-trap-react`, restores focus on close. Shortcuts data in [src/data/shortcuts.js](src/data/shortcuts.js).

## UUID Utility Surface
- Generators: `uuidGenerators` chooses `uuid` package `v1|v4|v7`, falling back to `crypto.randomUUID` or RFC4122 JS template in [src/utils/uuid.js](src/utils/uuid.js).
- Formatting: `formatUuid` applies trim hyphens, uppercase, wrap braces. `buildBatch` bulk-creates arrays.

## Event & Size Limits
- Preview limited to 20 to keep UI responsive; downloads clamped to 200.
- Copy requires `navigator.clipboard.writeText`; shows fallback message when unsupported.
- Download guarded by busy flag to avoid double-click; adds timestamped filename.

## Extension Pointers
- Add new UUID version: extend `uuidGenerators`, `versionChoices`, and wire into version selector; keyboard shortcuts can map additional digits.
- Add format option: extend `defaultOptions`, `optionDescriptors`, and update `formatUuid`.
- Analytics/telemetry hook points: `regenerate`, `handleCopy`, `downloadList`, and `handleVersionChange` already centralize side effects.
- Accessibility: shortcut modal focus trap; keyboard shortcuts skip inputs; buttons include aria labels. Ensure new UI respects `shouldIgnoreTarget` rules when adding shortcuts.

## Testing Notes
- Vitest + React Testing Library configured; tests live under `src/**/*.test.*` (see examples like [src/hooks/useUuidGenerator.test.js](src/hooks/useUuidGenerator.test.js) and [src/components/components.test.jsx](src/components/components.test.jsx)).

## Styling Notes
- Global styles in [src/App.css](src/App.css) and [src/index.css](src/index.css). Theme colors driven by CSS variables set via `data-theme` attribute. Tailwind plugin (`@tailwindcss/vite`) used but component styles rely on authored CSS utility-like classes.
