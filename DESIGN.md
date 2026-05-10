# uuidlab — Design System

> **Terminal-luxury.** A dense, monospace-forward developer tool that earns the right to feel calm. Hairline seams, one accent at a time, generous whitespace where it matters, ruthless density where it doesn't.

This document distills the design tokens and patterns implemented in `UUID Generator.html` / `app.jsx` / `styles.css` into a reusable system. Tokens are authored once in `tokens.json` (W3C Design Tokens spec) and surfaced as CSS custom properties in `tokens.css`.

---

## 1. Design principles

1. **Earn every pixel.** Real estate is leased to content (UUIDs, controls, status), not to ornamentation. Borders are 1px hairlines, never decorative frames.
2. **One accent at a time.** A single hue carries focus, active state, glow, and CTA. Switch by hue — never stack accents.
3. **Mono is the body.** Code-like content (UUIDs, keys, status, kbd) lives in Geist Mono with `font-feature-settings: "zero"`. Sans (Geist) carries display and prose.
4. **Lowercase keys, uppercase flags.** Rail keys (`version`, `batch`, `format`) are lowercase + tracked. Status flags (`UPPER`, `STRIP`) are uppercase to signal state.
5. **Motion as feedback, not decoration.** Hover swaps in 120ms, modals settle in 220ms, regenerate spins for ~380ms. No springs, no bounces, no parallax.
6. **The keyboard is the primary input.** Every action has a shortcut; the status bar advertises `?` for the full list. Hover affordances are hints, not requirements.

---

## 2. Color

Authored in **OKLCH** for perceptual uniformity. Neutrals share a warm-grey hue (~60°) at chroma ≤ 0.008 — they read as paper and ink, not as blue-grey or sepia.

### 2.1 Neutral ramps

| Token       | Dark                       | Light                      | Use                                   |
| ----------- | -------------------------- | -------------------------- | ------------------------------------- |
| `--bg`      | `oklch(0.16 0.005 60)`     | `oklch(0.985 0.003 60)`    | App canvas, top bar, rail surface     |
| `--bg-2`    | `oklch(0.18 0.005 60)`     | `oklch(0.965 0.004 60)`    | Workbench shell, panel surface        |
| `--bg-3`    | `oklch(0.21 0.006 60)`     | `oklch(0.945 0.005 60)`    | Row hover, kbd surface                |
| `--seam`    | `oklch(0.28 0.006 60)`     | `oklch(0.88 0.005 60)`     | Hairline borders, dashed dividers     |
| `--seam-2`  | `oklch(0.36 0.008 60)`     | `oklch(0.74 0.006 60)`     | Hover/elevated border step            |
| `--ink`     | `oklch(0.97 0.004 60)`     | `oklch(0.18 0.006 60)`     | Primary content, headings             |
| `--ink-2`   | `oklch(0.78 0.005 60)`     | `oklch(0.34 0.006 60)`     | Body text, ghost button labels        |
| `--ink-3`   | `oklch(0.55 0.005 60)`     | `oklch(0.50 0.006 60)`     | Meta, hints, dashed copy              |
| `--ink-4`   | `oklch(0.40 0.006 60)`     | `oklch(0.65 0.006 60)`     | Tertiary — index numbers, dashes      |

> **Rule:** never invent intermediate steps. Step down for less weight; step up only for primary content. `--ink-4` is the floor for legibility — anything lighter is decorative.

### 2.2 Accent palettes

Four palettes are interchangeable. All share **L = 0.78–0.86, C = 0.18–0.20** — they read at the same visual weight, so swapping does not require relayout. Vary hue only.

| Palette   | Accent                       | On-accent (text on accent fills) |
| --------- | ---------------------------- | -------------------------------- |
| `lime`    | `oklch(0.86 0.20 130)`       | `oklch(0.18 0.01 130)`           |
| `amber`   | `oklch(0.82 0.18 65)`        | `oklch(0.18 0.01 65)`            |
| `cobalt`  | `oklch(0.74 0.18 250)`       | `oklch(0.16 0.01 250)`           |
| `magenta` | `oklch(0.78 0.20 340)`       | `oklch(0.18 0.01 340)`           |

**Where the accent shows up** — and only here:
- Brand mark dot, with `0 0 12px` glow
- Active version row (border + 10% tint background + 2px inset bar)
- Active format option (border + 8% tint background)
- CTA button fill (`regenerate`)
- Range slider thumb + 1px halo
- Status bar live dot (pulsing) and feedback arrow `→`
- Hover-reveal of the version segment in a UUID (`.seg-2`)
- Copied row tint (12% accent over `--bg-2`)

Accent **tints** are computed inline with `color-mix(in oklch, var(--accent) N%, var(--bg))` rather than tokenized, because `N` is context-specific (8/10/12).

---

## 3. Type

Two families, no third. Sans is **Geist** (display, prose). Mono is **Geist Mono** (every piece of UI chrome, every UUID, every kbd, every key label). The system reads as a terminal because almost everything is mono.

### 3.1 Scale

| Token         | Value                       | Use                                        |
| ------------- | --------------------------- | ------------------------------------------ |
| `--fs-xxs`    | 10px                        | Hint text, dashed-divider meta             |
| `--fs-xs`     | 11px                        | kbd, status cells, eyebrow, row index      |
| `--fs-sm`     | 12px                        | Top bar links, ghost button, panel title   |
| `--fs-base`   | 13px                        | Dense controls, version titles             |
| `--fs-md`     | 14px                        | UUID rows                                  |
| `--fs-lg`     | 16px                        | Brand name, hero subhead                   |
| `--fs-xl`     | 36px                        | Batch counter                              |
| `--fs-hero`   | `clamp(48px, 6.5vw, 88px)`  | Hero display only                          |

### 3.2 Weight + tracking

- Display (`hero-title`): **600**, tracking `-0.035em`, line-height `0.96`. Never bold.
- Brand name: **700**, tracking `-0.01em`.
- Body: **400–500**.
- Mono labels (rail keys, panel flag): **600**, tracking `0.04em`, lowercase or UPPERCASE — never title case.

### 3.3 Mono feature settings

Mono **must** ship with `font-feature-settings: "zero", "ss01"`. The slashed zero is non-negotiable for UUID legibility — a dotted-zero `0` reads as `O` in a 32-char string and breaks the whole proposition.

### 3.4 Sans feature settings

Sans uses `"ss01", "ss02", "cv11"` to soften default Geist letterforms — the result has slightly less geometric stiffness in headings.

---

## 4. Spacing

A 4px-leaning scale — fine-grained at the bottom (2/4/6/8) for chrome, then jumps (16, 22, 28, 36, 40, 80) for containers. **Component padding is composed from these.** There is no `--component-pad` token; if you need a value that isn't in the scale, you're using the wrong one.

| Token | Value | Token | Value | Token  | Value |
| ----- | ----- | ----- | ----- | ------ | ----- |
| `--sp-0` | 0    | `--sp-6`  | 12px | `--sp-12` | 28px |
| `--sp-1` | 2px  | `--sp-7`  | 14px | `--sp-13` | 36px |
| `--sp-2` | 4px  | `--sp-8`  | 16px | `--sp-14` | 40px |
| `--sp-3` | 6px  | `--sp-9`  | 18px | `--sp-15` | 80px |
| `--sp-4` | 8px  | `--sp-10` | 22px |
| `--sp-5` | 10px | `--sp-11` | 24px |

---

## 5. Radius

Five steps. **Most chrome lives at `--r-md` (6px).** Larger surfaces (workbench, modal) get `--r-lg` (10px). Tiny elements (kbd, version-tag) get `--r-xs` (4px).

| Token      | Value  |
| ---------- | ------ |
| `--r-xs`   | 4px    |
| `--r-sm`   | 5px    |
| `--r-md`   | 6px    |
| `--r-lg`   | 10px   |
| `--r-pill` | 999px  |

Avoid mixing radii within a single composite — a 6px button inside a 10px panel is correct; a 10px button inside a 6px panel is not.

---

## 6. Borders, shadows, glow

The system uses **borders, not shadows**, to define structure. The only proper drop shadow is on the modal.

- `1px solid var(--seam)` — default hairline
- `1px solid var(--seam-2)` — hover/elevated step
- `1px dashed var(--seam)` — section dividers (hero strip)
- `inset 2px 0 0 var(--accent)` — active rail row indicator
- `0 0 12px var(--accent)` — brand-mark dot glow
- `0 0 8px var(--accent)` — status pulse glow
- `0 20px 60px rgba(0,0,0,0.4)` — modal lift (dark) / `0.15` (light)

`backdrop-filter: blur(10px)` on the sticky top bar; `blur(6px)` on the modal scrim.

---

## 7. Motion

| Token         | Value   | Use                                              |
| ------------- | ------- | ------------------------------------------------ |
| `--d-tap`     | 80ms    | Tap depress (`translateY(1px)`)                  |
| `--d-swap`    | 120ms   | Hover/active state swaps                         |
| `--d-settle`  | 140ms   | Row copy button settle                           |
| `--d-scrim`   | 160ms   | Modal scrim fade                                 |
| `--d-modal`   | 220ms   | Modal slide+scale                                |
| `--d-panel`   | 280ms   | Panel grid fade on regenerate                    |
| `--d-regen`   | 380ms   | Refresh icon spin window                         |
| `--d-spin`    | 700ms   | Continuous spinner (loading)                     |
| `--d-pulse`   | 2000ms  | Status live dot pulse                            |

Single easing for entries: `cubic-bezier(0.2, 0.7, 0.3, 1)` — a flat curve, not a bouncy one. Everything else is `linear` or browser-default `ease`.

---

## 8. Components

### 8.1 Top bar
Sticky, 14×28 padding, 1px bottom hairline, `backdrop-filter: blur(10px)`. Brand mark + name + mono `/ tag` left; ghost shortcut button + theme toggle right.

### 8.2 Workbench shell
`grid-template-columns: 320px 1fr` on desktop, single column below 920px. 1px outer border, `--r-lg` corner radius, `--bg-2` ground. Rail and panel are separated by a 1px hairline, never a shadow.

### 8.3 Rail sections
22px padding, separated by 1px hairlines (last section grows to fill). Each section has a `rail-head` (lowercase mono key + 10px shortcut hint), then content. **Never add a third section style** — three is the cap.

### 8.4 Version row
Three-column grid (`32px 1fr 14px`): tag, meta, pip. Active state = accent border + accent-tint background + inset 2px accent bar + accent-filled tag. The pip (`●`) only renders when active.

### 8.5 Format option
Two-column grid (`18px 1fr`): check glyph + text. Uses real `<input type="checkbox">` visually-hidden for a11y; the visible state is the row.

### 8.6 UUID row
Four-column grid (`50px 1fr 50px 90px`): index, code, length, copy button. The copy button sits at 0.4 opacity until row hover, then fully visible. UUID segments are individually wrapped (`<span class="uuid-seg seg-N">`) so segment-2 (the version nibble) can highlight on hover.

### 8.7 Buttons
Three roles, no more:
- **Ghost** — `--bg-2` fill, `--seam` border, `--ink-2` label. Most actions.
- **CTA** — accent fill, on-accent label, attached `kbd`. One per panel.
- **Row copy** — transparent, opacity 0.4 → 1 on row hover, ink-fill on direct hover, accent-fill when copied.

### 8.8 kbd
11px mono, 2×6 padding, `--bg` fill, 1px border with **2px bottom border** (the only place a bottom-heavy border is used — it keys-cap the element). `--r-xs`.

### 8.9 Status bar
Sticky bottom, mono throughout, 1px right-divider per cell. Live dot pulses at 2s. Feedback cell flashes a `→` arrow + lowercase verb message for 2 seconds.

### 8.10 Modal
560px max width, scrim with `blur(6px)`, slide-up entry on `--ease-standard` over 220ms. Two-column body grid (`200px 1fr`): keys + description.

---

## 9. Layout

- Container max width: **1440px**, gutters: **28px**.
- Workbench rail: **320px** fixed.
- Workbench fold: **920px** — below this, rail stacks above panel and the row drops its `length` cell.
- Hero subhead: **620px** max — text-wrap balanced.

---

## 10. Accessibility & a11y notes

- All accents pass WCAG AA against their on-accent companions when used as text on fill.
- `--ink-4` is the dimmest legible token; do not use it for actionable text.
- Real `<input type="checkbox">` and `<input type="range">` underpin custom controls — keyboard works without JS.
- Focus styles are inherited browser defaults; future work should add an explicit `:focus-visible` ring at `0 0 0 2px var(--accent)`.
- Color is never the sole carrier of state: the active row also gets a left bar and a pip glyph; copied rows get a `✓ copied` label.

---

## 11. Files

- `tokens.json` — W3C-format source of truth.
- `tokens.css` — CSS custom properties, dark + light themes, accent overrides via `[data-accent]`.
- `DESIGN.md` — this document.

To rotate accents at runtime, set `data-accent="lime|amber|cobalt|magenta"` on `:root` or any ancestor. To switch theme, set `data-theme="dark|light"` on `:root`.
