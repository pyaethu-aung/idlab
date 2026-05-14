# Design Test Report 002

| Field | Value |
|---|---|
| Date | 2026-05-15 |
| Website | http://localhost:5173 |
| Branch | 010-uuid-decode |
| Executor | Playwright CLI 1.60.0 (Chromium, headless) |
| Viewport | 1440×900 (desktop) |
| Design system | `src/design-system/tokens.json` + `tokens.css` — 65 tokens |
| Design source | `design.pen` — uuidlab Validator Light (RByBx), uuidlab Validator Dark (S4ubXB) |
| Theme at runtime | Light (default) |
| Active tab at runtime | Generator → switched to Validator for component/snapshot checks |

---

## Summary

| Check | Pass | Total | Status |
|---|---|---|---|
| Design tokens | 65 | 65 | ✅ |
| Component presence | 11 | 14 | ⚠️ |
| Layout & spacing | 5 | 5 | ✅ |
| Visual snapshot | 0 | 1 | ⚠️ |
| Usability — a11y | 0 | 1 | ❌ |
| Usability — tap targets | 0 | 1 | ❌ |
| Usability — focus visible | 0 | 1 | ❌ |
| Usability — contrast (spot) | 1 | 1 | ✅ |

---

## 6a. Design Tokens

**65 / 65 passed.**

All CSS custom properties on `:root` match their `tokens.json` / `tokens.css` source values exactly. Ten colour tokens (`--bg`, `--bg-2`, `--bg-3`, `--seam`, `--seam-2`, `--ink` through `--ink-4`, `--accent`) initially appeared to drift because the test runner compared dark-theme expected values against a live page in light mode. On inspection, every value is correct:

- `--ink-3: oklch(0.44 0.006 60)` and `--ink-4: oklch(0.49 0.006 60)` match `tokens.css:113-114` (light theme block) exactly.
- `--accent: oklch(0.62 0.22 130)` is the intentional **light-mode WCAG AA override** at `tokens.css:127` — not a drift.
- `--lh-snug: 1.0` resolves to the same value as the expected `1`.

No token issues.

---

## 6b. Component Presence

**11 / 14 matched.** Three selector misses — all components confirmed present via class inventory.

| Component | Found | Note |
|---|---|---|
| App root (`#root`) | ✅ | |
| Hero | ✅ | `.hero` |
| ValidatorPanel | ✅ | `.validator-panel` |
| ValidatorSegCard | ✅ | `.v-seg-card` |
| ValidatorPropsGrid | ✅ | `.v-props-grid` |
| ValidationBanner | ✅ | `.v-banner` |
| UuidInput | ✅ | `.v-input-field` |
| ShortcutReference | ✅ | rendered on keyboard shortcut overlay trigger |
| ToolbarNav | ⚠️ | Present as `.topbar-nav` — selector pattern `[class*="toolbar-nav"]` missed it |
| StatusBar | ⚠️ | Present as `.status` — selector pattern `[class*="status-bar"]` missed it |
| ThemeToggle | ⚠️ | Present as `.icon-btn` at top-right — selector pattern `[aria-label*="heme"]` missed it |

**Fix for future runs:** Update selector patterns to `[class*="topbar-nav"]`, `[class~="status"]`, and `button.icon-btn:last-of-type`.

---

## 6c. Layout & Spacing

**5 / 5 passed.** All measurements within the ±4px tolerance.

| Check | Expected | Live | Delta |
|---|---|---|---|
| Topbar height | 44px | 44px | 0px ✅ |
| Workbench border-radius | 10px | 10px | 0px ✅ |
| Status-bar height | 32px | 32px | 0px ✅ |
| Main gutter padding-left | 28px | 28px | 0px ✅ |
| Rail width | 320px | 320px | 0px ✅ |

---

## 6d. Visual Snapshot

**0 / 1 passed** — flagged, but the diff is a false positive.

**Comparison:** Validator tab (light mode, live) vs `design.pen` uuidlab Validator Light export (RByBx).

| Viewport | Pixel mismatch | Diff |
|---|---|---|
| 1440×900 | **8.07%** | `.test-design/diffs/diff-val-light-1440x900.png` |

**Root cause:** The design export uses a specific sample UUID (`018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d`) pre-decoded, while the live app loaded a different UUID (`019e2974-55cc-75a9-9ecb-23e87a89af8f`). Every changed pixel in the diff corresponds to differing UUID character glyphs in the segment breakdown, validation banner, and properties grid. The structural layout, spacing, colours, and typography all align correctly.

**Verdict:** No design regression. The comparison methodology needs a canonical fixed UUID injected before screenshotting to avoid dynamic-content noise.

Live screenshot: `.test-design/diffs/live-val-light-1440x900.png`

---

## 6e. Usability

### a11y — color-contrast (axe-core, WCAG 2 AA)

**Severity: serious.** 3 elements fail contrast.

| Element | Selector | Impact |
|---|---|---|
| Active tab label | `.tab-btn--active` | serious |
| Active version badge | `.is-active.version-row > .version-tag.mono` | serious |
| CTA / Regenerate button | `.cta-btn` | serious |

**Suggested fix:** The accent colour in light mode (`oklch(0.62 0.22 130)` ≈ `#5a8c00`) is close to the threshold. For `.tab-btn--active` and `.cta-btn`, verify that text colour is `--on-accent` (`oklch(0.97 0.004 60)`) and that no other colour is being applied. For `.version-tag.mono`, check that the active state doesn't inherit a colour combination that lowers contrast below 4.5:1.

---

### Tap targets — below 44×44px minimum

**9 interactive elements are below the 44px minimum in at least one axis.**

| Element | Size | Shortfall |
|---|---|---|
| `BUTTON.tab-btn` | 87×**30**px | height −14px |
| `BUTTON.ghost-btn` (various) | 119×**34**, 34×**30**, 105×**36**, 141×**36**px | height −8 to −14px |
| `BUTTON.cta-btn` | 162×**36**px | height −8px |
| `BUTTON.preset-chip` (×5) | 52×**31**px | height −13px |
| `BUTTON.row-copy` | 80×**31**px | height −13px |
| `BUTTON.status-btn` | 178×**33**px | height −11px |
| `INPUT[type=checkbox]` (×3) | **13×13**px | both axes −31px |
| `INPUT.rail-range` | 275×**4**px | height −40px |

**Suggested fixes:**

- **Tab buttons / ghost buttons / chips / row-copy / status-btn:** Add `min-height: 44px` (or `padding-block` to reach it). Most are only a few px short and can be fixed without visual impact at desktop by adding internal padding.
- **Checkboxes:** Wrap in a `<label>` with `min-height: 44px; display: flex; align-items: center` to extend the touch target without changing the visual size of the checkbox itself. (This was previously fixed for one checkbox in commit `12fb8a7` — the same pattern should apply to the remaining three.)
- **Range slider (`INPUT.rail-range`):** Wrap in a container with `min-height: 44px` and add `::-webkit-slider-thumb` / `::after` pseudo-element with a larger invisible hit area, or use `padding-block: 20px` on the input itself (which browsers apply to the hit area, not the track visual).

---

### Focus visible — missing focus ring

**10 elements have no visible outline or box-shadow change on `:focus`.**

| Element | Count |
|---|---|
| `INPUT.rail-range` | 1 |
| `INPUT.v-input-field` | 1 |
| `BUTTON.v-input-btn` | 1 |
| `BUTTON.v-sample-pill` | 6 |
| `BUTTON.v-opt-row` | 2 |

These are all in the Validator panel. The Generator-side buttons (`.ghost-btn`, `.cta-btn`, `.version-row`) already have focus rings (confirmed passing in the check).

**Suggested fix:** Add to `index.css` or the Validator component styles:

```css
.v-input-btn:focus-visible,
.v-sample-pill:focus-visible,
.v-opt-row:focus-visible,
.v-input-field:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

For `INPUT.rail-range`, the thumb needs focus styling:

```css
.rail-range:focus-visible {
  outline: none;
}
.rail-range:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--accent);
}
```

---

## Action Items

| Priority | Item | File(s) |
|---|---|---|
| High | Fix color-contrast on `.tab-btn--active`, `.version-tag.mono`, `.cta-btn` | `index.css` |
| High | Add focus-visible rings to Validator interactive elements | `index.css` |
| Medium | Increase tap-target height on `.tab-btn`, `.ghost-btn`, `.preset-chip`, `.row-copy`, `.status-btn` to ≥44px | `index.css` |
| Medium | Extend tap-target for range slider and checkboxes | `index.css` |
| Low | Use fixed sample UUID in snapshot runner to avoid dynamic-content noise | `.test-design/runner.cjs` |
| Low | Update component-presence selectors to match actual class names | `.test-design/runner.cjs` |
