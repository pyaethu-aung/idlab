# Design Test Report — uuidlab

**Date:** 2026-05-15
**Executor:** Playwright MCP (CLI chromium not downloaded; fell back from CLI 1.60.0)
**Viewport:** 1440×900 desktop
**URL:** http://localhost:5173/
**Theme at test time:** Light (OS default, no localStorage override)
**Design source:** `design.pen` (4 frames: Generator Dark/Light, Validator Dark/Light)
**Design system:** `src/design-system/tokens.json` + `src/design-system/tokens.css`

---

## Summary

```
Tokens          64/64  ✅  all correct
Components      27/27  ✅  all present
Layout           8/9   ⚠️  1 divergence
Visual snapshot  2/2   ✅  screenshots saved (no pixel-diff — pixelmatch not installed)
Usability        2❌   ⚠️  2 failures, 2 warnings
```

Screenshots: `.test-design/diffs/`

---

## Check 1: Design Tokens

**Result: 64/64 PASS ✅**

All 64 CSS custom properties match `tokens.css` exactly. The 9 theme-color variables
(`--bg`, `--bg-2`, `--bg-3`, `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--seam`,
`--seam-2`) read as light-mode values — correct because the app loaded in light mode.

| Category | Tokens | Result |
|----------|--------|--------|
| Typography (family, weight, size, tracking, line-height) | 19 | ✅ all pass |
| Spacing (`--sp-0` – `--sp-15`) | 16 | ✅ all pass |
| Radius (`--r-xs` – `--r-pill`) | 5 | ✅ all pass |
| Layout (`--container-max`, `--gutter`, `--rail-w`, `--modal-max`) | 4 | ✅ all pass |
| Motion (durations + easing) | 10 | ✅ all pass |
| Accent + on-accent | 2 | ✅ all pass |
| Theme color vars (light-mode values) | 9 | ✅ correct for active theme |

---

## Check 2: Component Presence

**Result: 27/27 PASS ✅**

### Generator tab (19/19)

| Component | Selector | Count |
|-----------|----------|-------|
| Root container | `.root` | 1 |
| Topbar | `.topbar` | 1 |
| Brand | `.brand` | 1 |
| Brand name | `.brand-name` | 1 |
| Brand tag | `.brand-tag` | 1 |
| Topbar nav | `.topbar-nav` | 1 |
| Tab buttons | `.tab-btn` | 2 |
| Topbar right | `.topbar-right` | 1 |
| Shortcuts button | `.ghost-btn` | 4 |
| Theme toggle | `button[aria-label*="ight"]` | 1 |
| Main | `.main` | 1 |
| Hero | `.hero` | 1 |
| Hero title | `.hero-title` | 1 |
| Accent mark | `.accent-mark` | 1 |
| Bench | `.bench` | 1 |
| Rail (ControlPanel) | `.rail` | 1 |
| Panel (UuidList) | `.panel` | 1 |
| UUID rows | `.row` | 1 |
| Status bar | `.status` | 1 |

### Validator tab (8/8)

| Component | Selector | Count |
|-----------|----------|-------|
| Validator panel | `.validator-panel` | 1 |
| Validator hero | `.validator-hero` | 1 |
| Validator headline | `.validator-hero__headline` | 1 |
| Accent text | `.accent-text` | 1 |
| UUID input | `input[type="text"]` | 1 |
| Validation badge | `[class*="valid"]` | 7 |
| UUID breakdown / segments | `[class*="seg"]` | 32 |
| Decoded fields / props | `.v-props-section` | 3 |

---

## Check 3: Layout & Spacing

**Result: 8/9 — 1 warning**

| Check | Expected | Live | Status |
|-------|----------|------|--------|
| Topbar height | 44px | **63px** | ⚠️ |
| Topbar padding-left | 28px | 28px | ✅ |
| Topbar padding-right | 28px | 28px | ✅ |
| Status bar height | 32px | 33.5px | ✅ (within 2px tolerance) |
| Main padding-top | 40px | 40px | ✅ |
| Main padding-left | 28px | 28px | ✅ |
| Main padding-bottom | 80px | 80px | ✅ |
| Rail width | 320px | 320px | ✅ |
| Bench border-radius | 10px | 10px | ✅ |

### ⚠️ Topbar height divergence

- **Design spec** (`design.pen`): `height: 44`, `padding: [0, 28]`
- **Live CSS** (`src/index.css`): `padding: 14px 28px` — no explicit height
- **Result**: tallest child (`.topbar-right` at 34px) + 28px vertical padding = **63px**

Fix options:
1. Set `height: 44px; padding: 0 28px; overflow: hidden` on `.topbar` in CSS
2. Update `design.pen` topbar frame height to 63px to match implementation

---

## Check 4: Visual Snapshot

**Result: 2/2 screenshots captured ✅**
Pixel-diff skipped — `pixelmatch` not in `node_modules`. Install with
`npm i -D pixelmatch pngjs` to enable automated diff on future runs.

Screenshots saved to `.test-design/diffs/`:
- `generator-desktop.png` — generator tab, 1440×900
- `validator-desktop.png` — validator tab, 1440×900

### Visual observations

The structural composition matches the design closely across both tabs. The most visible
difference is theme: the design frames are dark (`data-theme="dark"`), the live app
defaulted to light mode. Structural layout, typography scale, and component placement
are faithful to the design.

| Area | Design | Live | Match |
|------|--------|------|-------|
| Topbar structure | brand + nav + right | brand + nav + right | ✅ |
| Hero copy | correct | correct | ✅ |
| Workbench rail | 320px, rounded | 320px, rounded | ✅ |
| UUID panel | right of rail | right of rail | ✅ |
| Status bar | bottom strip | bottom strip | ✅ |
| Validator layout | input left, decode right | input left, decode right | ✅ |
| Topbar height | 44px | 63px | ⚠️ |
| Theme | dark | light | ℹ️ (not a bug) |

---

## Check 5: Usability

### 5a. Accessibility (axe-core WCAG 2.1 A/AA)

#### ❌ [critical] Form element missing label — `#batch-size`

- **Rule:** `label`
- **Impact:** critical
- **Nodes:** 1 — `#batch-size` (range input in ControlPanel)
- **WCAG:** 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)
- **Fix:** Add a visually hidden label in `src/components/ControlPanel.jsx`:
  ```jsx
  <label htmlFor="batch-size" className="sr-only">Batch size</label>
  <input id="batch-size" type="range" ... />
  ```

#### ❌ [serious] Color contrast failures — light mode

- **Rule:** `color-contrast`
- **Impact:** serious
- **WCAG:** 1.4.3 Contrast Minimum (AA) — requires 4.5:1 for normal text, 3:1 for large text

**Generator tab (9 nodes):**
- `.accent-mark` — lime `oklch(0.86 0.20 130)` on light background (large text, needs 3:1)
- `.rail-hint.mono` (×2) — secondary hint text on panel background

**Validator tab (14 nodes):**
- `.accent-text` — lime `oklch(0.86 0.20 130)` on light background (large text)
- `.v-rail-hint.mono` — hint text in validator rail
- `.v-input-meta-text` — input meta text

**Root cause:** `--accent` (`oklch(0.86 0.20 130)`) and `--ink-3`/`--ink-4` were optimised
for dark mode. In light mode, the lime accent washes out against light backgrounds and the
secondary ink steps lack sufficient contrast.

**Fix options:**
- Introduce a light-mode accent variant with lower lightness, e.g. `oklch(0.62 0.22 130)`
- Darken `--ink-3` and `--ink-4` light-mode values in `tokens.css`
- Use `--ink-2` instead of `--ink-3` for hint text in light mode

---

### 5b. Tap Targets

Many interactive elements fall below 44×44px. Most are intentional for the dense
terminal aesthetic (the design matches). Checkboxes are the most actionable issue.

| Element | Size | Note |
|---------|------|------|
| `.tab-btn` (Generator, Validator) | 87×30px | By design — dense topbar |
| `.ghost-btn` "? shortcuts" | 119×34px | By design |
| `.ghost-btn.icon-btn` theme toggle | 34×30px | By design |
| `.preset-chip` (1/8/25/100/200) | 52×31px | By design |
| `.rail-range` range track | 275×4px | Track height only; actual grab area is larger |
| `.row-copy` copy button | 80×31px | By design |
| `.status-btn` | 178×33px | By design |
| Checkboxes (×3) | 13×13px | ⚠️ Actionable — too small for accurate tapping |

**Fix for checkboxes:** Wrap in a `<label>` with `min-height: 44px` and center the
native checkbox visually — this expands the hit area without changing the visible size.

---

### 5c. Focus Visible

**Result: ⚠️ No focus rings on any interactive element**

All 11 sampled focusable elements (`button`, `input`, version rows) have
`outline-style: none` and no `box-shadow` change on focus. Keyboard users receive
no visual indication of which element is focused.

**WCAG:** 2.4.7 Focus Visible (AA)

**Affected elements:** tab buttons, shortcuts button, theme toggle, version row buttons,
batch-size range input, preset chips.

**Fix:** Add to `src/index.css`:
```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--r-xs);
}
```
Scope to `:focus-visible` (not `:focus`) so mouse clicks don't show the ring.

---

## Action Priority

| # | Priority | Issue | File(s) |
|---|----------|-------|---------|
| 1 | P1 🔴 | Add `<label>` to `#batch-size` range input | `src/components/ControlPanel.jsx` |
| 2 | P1 🔴 | Fix contrast: tune light-mode accent + ink-3/4 | `src/design-system/tokens.css` |
| 3 | P2 🟡 | Add `:focus-visible` outline rule | `src/index.css` |
| 4 | P3 🟢 | Reconcile topbar height (CSS 63px ↔ design 44px) | `src/index.css` or `design.pen` |
| 5 | P3 🟢 | ~~Expand checkbox hit areas~~ ✅ | `src/index.css` |
| 6 | P3 🟢 | Install `pixelmatch` + `pngjs` to enable pixel-diff | `package.json` |

---

## Notes

- **Executor fallback:** Playwright CLI 1.60.0 is installed but Chromium browser binary
  is not downloaded. Run `npx playwright install chromium` (~150 MB) to enable the CLI
  runner. MCP was used as fallback for this run.
- **Pixel-diff:** Visual snapshot comparison was skipped. Install `pixelmatch` and `pngjs`
  as dev dependencies to enable automated pixel-level diffing on future runs.
- **Contrast check method:** Custom OKLCH→RGB contrast check produced invalid ratios;
  axe-core results (which handle OKLCH natively) are the authoritative source for
  contrast violations.
- **Mobile viewport:** Not tested in this run (browser_resize was not approved).
  Recommend re-running with 390×844 to validate responsive layout.
