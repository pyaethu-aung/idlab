---
name: uuidlab
description: "Terminal-luxury — a dense, monospace-forward developer tool that earns the right to feel calm."
colors:
  accent-lime: "oklch(0.86 0.20 130)"
  accent-amber: "oklch(0.82 0.18 65)"
  accent-cobalt: "oklch(0.74 0.18 250)"
  accent-magenta: "oklch(0.78 0.20 340)"
  on-accent: "oklch(0.18 0.01 130)"
  bg: "oklch(0.16 0.005 60)"
  bg-2: "oklch(0.18 0.005 60)"
  bg-3: "oklch(0.21 0.006 60)"
  seam: "oklch(0.28 0.006 60)"
  seam-2: "oklch(0.36 0.008 60)"
  ink: "oklch(0.97 0.004 60)"
  ink-2: "oklch(0.78 0.005 60)"
  ink-3: "oklch(0.55 0.005 60)"
  ink-4: "oklch(0.40 0.006 60)"
  error: "oklch(0.72 0.17 25)"
  on-error: "oklch(0.15 0.02 25)"
typography:
  display:
    fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif'
    fontSize: "clamp(48px, 6.5vw, 88px)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.035em"
    fontFeature: '"ss01", "ss02", "cv11"'
  headline:
    fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif'
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "-0.01em"
  body:
    fontFamily: '"Geist Mono", ui-monospace, "JetBrains Mono", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: '"zero", "ss01"'
  label:
    fontFamily: '"Geist Mono", ui-monospace, "JetBrains Mono", monospace'
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontFeature: '"zero", "ss01"'
  title:
    fontFamily: '"Geist Mono", ui-monospace, "JetBrains Mono", monospace'
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontFeature: '"zero", "ss01"'
rounded:
  xs: "4px"
  sm: "5px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  sp-1: "2px"
  sp-2: "4px"
  sp-3: "6px"
  sp-4: "8px"
  sp-5: "10px"
  sp-6: "12px"
  sp-7: "14px"
  sp-8: "16px"
  sp-9: "18px"
  sp-10: "22px"
  sp-11: "24px"
  sp-12: "28px"
  sp-13: "36px"
  sp-14: "40px"
  sp-15: "80px"
components:
  button-cta:
    backgroundColor: "{colors.accent-lime}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-cta-hover:
    backgroundColor: "{colors.accent-lime}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-ghost-hover:
    backgroundColor: "{colors.bg-3}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-row-copy:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  button-row-copy-active:
    backgroundColor: "{colors.accent-lime}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  tab-btn:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    padding: "0 12px"
  tab-btn-active:
    textColor: "{colors.accent-lime}"
    padding: "0 12px"
---

# Design System: uuidlab

## 1. Overview

**Creative North Star: "Terminal-Luxury"**

uuidlab operates at the intersection of CLI discipline and considered craft. It is dense where
developers are scanning, spacious where developers are reading, and entirely at rest when not
responding to input. The default state is a deep near-black — not a styled brand gesture, but
the literal dark that a terminal earns after years of daily use. Every surface decision asks:
does this earn its square pixels?

This system rejects all three of its closest failure modes by name. It is not SaaS-dashboard grey
(blue-tinted panels, sidebar chrome, card-grid layouts, feature-overview decoration inside a task
tool). It is not flashy developer marketing (gradient-heavy dark mode, stacked neon accents,
glassmorphism as atmosphere). It is not the bare-bones utility that mistakes zero effort for
minimal design. "Terminal-luxury" names the space between the second and third failure: a tool
with genuine craft opinions that never asks for attention.

The accent color — lime by default, swappable across four palettes — is used nowhere decoratively.
It appears only as a consequence of action: the currently selected version row, the regenerate
button, the status pulse, the active slider thumb, the copied row. Its rarity is structural. The
whole system holds its breath so the accent can breathe.

**Key Characteristics:**
- Dark-native by conviction, with a warm-grey neutral ramp (hue 60°) that reads as ink-and-paper, not blue-shift
- Monospace-forward: Geist Mono is the body and chrome; Geist Sans is display and prose only
- Restrained color strategy: one accent, no secondary palette, no semantic color beyond the accent
- Hairline-border structure: 1px seams define space; no drop shadows except the modal lift
- Keyboard-first: every action has a shortcut; hover is a hint, not a requirement
- Theme-switchable: dark by default, light override via `[data-theme="light"]`; accent swappable via `[data-accent]`

## 2. Colors: The Warm-Void Palette

A single warm-grey neutral ramp (OKLCH hue 60°, chroma ≤ 0.008) plus one swappable accent.
Color values are authored in OKLCH throughout; all four accents share equivalent visual weight
(L 0.78–0.86, C 0.18–0.20) so switching hue does not require layout changes.

### Primary

- **Terminal Lime** (`oklch(0.86 0.20 130)`, token `--accent` / `[data-accent="lime"]`): The
  default accent. Used exclusively at interaction points — active selection, the CTA button fill,
  the slider thumb, the status live-dot, and the copied-row tint. Never decorative. On light
  theme: adjusted to `oklch(0.62 0.22 130)` for WCAG AA compliance.

### Secondary (accent swaps — same structural role, different hue)

- **Ember Amber** (`oklch(0.82 0.18 65)`, token `[data-accent="amber"]`): Warm ochre. Same role as lime.
- **Cold Cobalt** (`oklch(0.74 0.18 250)`, token `[data-accent="cobalt"]`): Blue-violet.
- **Signal Magenta** (`oklch(0.78 0.20 340)`, token `[data-accent="magenta"]`): Fuchsia.

### Neutral

- **Deep Void** (`oklch(0.16 0.005 60)`, token `--bg`): App canvas, top bar, rail surface.
- **Warm Recess** (`oklch(0.18 0.005 60)`, token `--bg-2`): Workbench shell, panel surface.
- **Elevated Surface** (`oklch(0.21 0.006 60)`, token `--bg-3`): Row hover, `<kbd>` fill.
- **Hairline** (`oklch(0.28 0.006 60)`, token `--seam`): 1px borders, dashed dividers. Full opacity only — never a fill.
- **Elevated Hairline** (`oklch(0.36 0.008 60)`, token `--seam-2`): Hover/focus border step.
- **Warm White** (`oklch(0.97 0.004 60)`, token `--ink`): Primary content — headings, UUID values, primary labels.
- **Body Ink** (`oklch(0.78 0.005 60)`, token `--ink-2`): Secondary content, ghost button labels.
- **Muted Ink** (`oklch(0.55 0.005 60)`, token `--ink-3`): Metadata, hints, UUID length readout. Never actionable primary.
- **Ghost Ink** (`oklch(0.40 0.006 60)`, token `--ink-4`): Index numbers, tertiary decoration. Absolute floor for informational text.
- **Error Red** (`oklch(0.72 0.17 25)` dark / `oklch(0.50 0.20 25)` light, token `--error`): Invalid UUID state — used for text, borders, fills, and the status dot glow. Follows the same contract as `--accent`: one role, never decorative. On light theme, lightness drops to 0.50 for WCAG AA contrast against near-white surfaces.
- **On-Error** (`oklch(0.15 0.02 25)` dark / `oklch(0.97 0.004 60)` light, token `--on-error`): Text on error-colored fills (validator banner icon). Inverts between themes to stay readable.

### Named Rules

**The One-Accent Rule.** The accent color appears only as a consequence of user action or current
selection — never for decoration, illustration, or section markers. Its rarity is structural: when
it appears, it means something.

**The Warm-Void Rule.** All neutral surfaces share hue 60° at chroma ≤ 0.008. Never introduce
blue-grey, cool neutrals, or true-neutral (chroma 0). The warm micro-tint keeps the system from
reading as generic dark-mode.

**The Floor Rule.** `--ink-4` is the dimmest token used for informational text. Anything lighter
is decorative. Never use a lighter value for actionable copy.

## 3. Typography: Terminal Discipline

**Display Font:** Geist (sans) — headings and prose only.
**Chrome/Body Font:** Geist Mono — UUIDs, labels, keys, status, `<kbd>`, and all UI chrome.

**Character:** The system reads as a terminal because almost everything is mono. Geist Sans
appears only when language, not data, needs to breathe. The pairing is not decorative contrast —
mono carries the signal, sans carries the context.

### Hierarchy

- **Display** (Geist 600, `clamp(48px, 6.5vw, 88px)`, line-height 0.96, tracking -0.035em): Hero
  heading only. The one place Geist Sans performs. Never bold — 600 is enough at this scale.
- **Headline** (Geist 700, 36px, line-height 1.0, tracking -0.01em): Batch counter; the one large
  number in the workbench chrome.
- **Title** (Geist Mono 600, 13px, tracking +0.04em): Rail section keys in lowercase (`version`,
  `batch`); status flags in uppercase (`UPPER`, `STRIP`). Never title case.
- **Body** (Geist Mono 400, 14px, line-height 1.55): UUID row values — the primary content
  surface. Feature settings: `"zero"` (slashed zero), `"ss01"`.
- **Label** (Geist Mono 600, 11px, tracking +0.04em): `<kbd>`, status cells, row index numbers.
  The smallest legible mono step.

### Named Rules

**The Slashed-Zero Rule.** All monospace text — every UUID, every label, every `<kbd>` — must
render with `font-feature-settings: "zero", "ss01"`. A dotted zero reads as `O` in a 32-character
UUID and destroys legibility. Non-negotiable.

**The Mono-First Rule.** New UI elements default to Geist Mono unless they are display headings
or prose paragraphs. When in doubt, mono.

**The Title-Case Ban.** Rail keys are lowercase tracked. Status flags are UPPERCASE. Nothing is
Title Case. Title case reads as generic app UI; this tool has a voice.

## 4. Elevation

This system is flat by structure. Surfaces are differentiated by tonal steps in the neutral ramp
(`--bg` → `--bg-2` → `--bg-3`), not by shadows. Borders are 1px hairlines at `--seam` or
`--seam-2`. The word "shadow" is nearly absent from this system.

The one exception is the modal, which lifts above the page-level chrome and earns a drop shadow
to signal it is outside the normal flow. Two accent glows (brand mark and status dot) communicate
active system state, not spatial elevation.

### Shadow Vocabulary

- **Modal lift** (`0 20px 60px rgba(0,0,0,0.4)` dark / `rgba(0,0,0,0.15)` light, token `--shadow-modal`): The shortcut reference modal and any future dialogs. The only drop shadow in the system.
- **Brand glow** (`0 0 12px var(--accent)`): The brand icon dot. Signals identity, not depth.
- **Status glow** (`0 0 8px var(--accent)`): The live status indicator pulse. Communicates active system.
- **Top bar frost** (`backdrop-filter: blur(10px)`, token `--blur-topbar`): Sticky top bar. Separation without shadow.
- **Modal scrim** (`backdrop-filter: blur(6px)`, token `--blur-scrim`): Behind the modal. Recedes content, not elevation.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. If you are about to add `box-shadow` to
a card, panel, or button, use `--seam` border + `--bg-3` tonal step instead. The shadow is
already taken by the modal.

## 5. Components

### Buttons

Three roles, no more. Never invent a fourth.

- **Shape:** 6px radius (`--r-md`) on CTA and ghost. 5px (`--r-sm`) on the row copy button to stay flush with UUID row height.
- **CTA (Regenerate):** Accent fill + on-accent text. 8px/16px padding. Attached `<kbd>` at 11px. One per panel. On hover: `translateY(-1px)` over 80ms. No color shift — it is already at full saturation.
- **Ghost:** `--bg-2` fill, 1px `--seam` border, `--ink-2` text. 6px/12px padding. Secondary actions (Copy All, Download, theme toggle). On hover: `--bg-3` fill, `--seam-2` border, `--ink` text over 120ms.
- **Row copy (transparent):** No fill or border at rest. `--ink-3` label. 4px/8px padding. Opacity 0.4 until parent row is hovered (→ 1). On button hover: `--bg-3` fill, `--ink` text. On copied state: accent fill, on-accent text, "✓ copied" label. Settles in 140ms.

### UUID Row

The signature component. Four-column grid: index (50px) / UUID code (1fr) / length (50px) / copy button (90px). Separated by 1px `--seam` bottom border.

- **Index:** `--ink-4`, 11px Geist Mono, right-aligned. Informational; never actionable.
- **UUID code:** 14px Geist Mono, `--ink`, `"zero" "ss01"`. Segments individually wrapped — segment 2 (the version nibble, e.g. `4` in v4) gets accent color on row hover to surface the UUID version.
- **Length:** `--ink-3`, 11px Geist Mono. Hidden below 920px breakpoint.
- **Row hover:** `--bg-3` background over 80ms. Copy button opacity 0→1. Version nibble accent-colored.
- **Copied state:** Row background tints to `color-mix(in oklch, var(--accent) 12%, var(--bg-2))`.

### Version Row

Three-column grid: tag (32px) / meta (1fr) / pip (14px).

- **Default:** `--bg-2` fill, 1px `--seam` border, `--r-md` radius. Tag: `--bg-3` background, `--ink-3` text. Pip hidden.
- **Active:** `color-mix(in oklch, var(--accent) 10%, var(--bg-2))` fill, `--accent` border, `inset 2px 0 0 var(--accent)` left bar. Tag: accent fill, on-accent text. Pip visible.
- **Hover (inactive):** `--bg-3` fill, `--seam-2` border over 120ms.

### Format Option (Checkbox)

Two-column grid: check glyph (18px) / label text. Uses real `<input type="checkbox">` visually
hidden for full keyboard operability. Visible state is the row.

- **Unchecked:** `--ink-4` check glyph. `--bg-2` row background.
- **Checked:** `--accent` check glyph. `color-mix(in oklch, var(--accent) 8%, var(--bg-2))` row background, `--accent` border.

### `<kbd>`

11px Geist Mono, `"zero" "ss01"`, 2px/6px padding. `--bg` fill. 1px `--seam` border with
**2px bottom border** — the cap-style depth cue. Only use `border-bottom: 2px` here; this is the
only bottom-heavy border in the system. `--r-xs` (4px) radius.

### Top Bar

Sticky, `backdrop-filter: blur(10px)`. `height: 44px`. 0 vertical padding (tab buttons stretch
to full height). `padding: 0 28px`. 1px `--seam` bottom hairline.

Three-column grid (`grid-template-columns: auto 1fr auto`): brand on the left, tab navigation
centered in the `1fr` column, utility controls on the right.

- **Left:** brand mark icon (16×16 SVG, `--accent`-colored) + brand name (Geist Sans 700, 16px,
  tracking -0.01em). No route label — the active tab communicates current location.
- **Center:** six tab buttons (see Tab Navigation), centered via `justify-content: center`.
- **Right:** ghost shortcut button + theme toggle button.

### Tab Navigation

Five tabs (Generator / Validator / Converter / ULID / NanoID), rendered inside a flex
container that stretches to the topbar's full 44px height (`align-items: stretch`). The
Validator absorbed the former Bulk tab: it validates one UUID or a pasted list, with each
row expandable into the full inspector.

- **Default:** `--ink-3` text, 2px `transparent` bottom border, no border-radius (zero radius
  keeps the underline flush with the topbar's hairline without a gap). 0/12px padding.
- **Hover:** `--ink-2` text, `--seam-2` bottom border, over `var(--d-swap)`.
- **Active:** `--accent` text, `--accent` 2px bottom border. The underline sits flush against the
  topbar's own `--seam` bottom hairline — it reads as a continuation of that edge, not a
  floating decoration.
- **Font:** Geist Mono, `var(--fs-sm)` (11px), label weight.

### Status Bar

Sticky bottom. Mono throughout, 11px. 1px `--seam` right-divider between cells. Three cells:

- **Live status:** `--accent` dot (6px, border-radius 50%) pulses at 2s (`animation: pulse 2000ms ease-in-out infinite`). Followed by mono text describing current state.
- **Hint:** Keyboard shortcut reminder. `--ink-3`.
- **Feedback:** Flashes `→ {verb}` (e.g. "→ copied", "→ downloaded") in `--accent` for 2 seconds on action. Returns to `--ink-3` at rest.

### Shortcut Reference Modal

560px max width (`--modal-max`). Scrim: `--scrim` + `blur(6px)`. Entry animation: slide-up
(`translateY(16px)` → 0) + scale (0.97 → 1) over 220ms on `--ease-standard`. Two-column body
grid (200px / 1fr): key combinations / descriptions. All text Geist Mono. Closed by Esc.

### Validator Input & Results

Multi-line textarea for one UUID or many (one per line). `--bg-2` fill, 1px `--seam` border,
`--r-md` radius. Geist Mono body, 14px. On focus: `--seam-2` border, no glow (flat system). The
rail carries a char/line meta row, clear + sample-list buttons, version sample pills, and the
shared parse options.

Every non-blank line becomes a row in a triage table (`bulk-table`): index / uuid / status /
version / variant / time, with a valid/invalid/total summary and "copy N valid" above it. Each
row carries a chevron expand button (`v-row-toggle`, 28px, accent `:focus-visible` ring); clicking
it reveals the full inspector inline (`v-row-detail` on a recessed `--bg` surface): validation
banner, parsed-structure segment card, properties grid, the v1↔v6 conversion, and a copy button.
A lone UUID auto-expands; many rows start collapsed. The detail reuses the standalone inspector
sections flush, so the expanded row and a single-UUID inspection look identical.

### ULID Panel

Reuses the validator workbench shell (`v-workbench` / `v-rail` / `v-panel-view`). Accepts a
ULID or a UUIDv7 (the only UUID version that shares ULID's 48-bit millisecond timestamp layout);
`inspectIdentifier` determines which path to take.

- **Rail:** three sections — generate ("mint a ulid" primary CTA), paste input (text field with
  live-valid indicator and char-count meta row; clear button), sample pills (ulid / uuidv7).
- **Decoded view (valid):** validation banner (accent ✓), decoded section (`v-props-grid`:
  timestamp UTC + relative, epoch ms, randomness), representations section (three `cx-row`
  items: ulid / uuid / compact — each with inline row-copy button). A prose note explains
  the lossless 128-bit reinterpretation.
- **Empty / invalid state:** centered `v-empty-msg mono` text; `v-empty-msg--error` modifier on
  invalid input shows the parse failure reason.

### NanoID Panel

Reuses the validator workbench shell. Generation-first — no paste/decode flow.

- **Rail:** three sections — generate ("mint nanoids" primary CTA + count slider 1–N), length
  slider (2–36 chars), alphabet preset pills (url-safe / alphanumeric / lowercase / hex / numbers).
- **Generated list:** `ulid-repr` container of `cx-row` items (2-digit zero-padded index / value
  code / copy button), mirroring the ULID representation rows. Header row (`v-props-head`) shows
  count and a copy-all button.
- **Entropy section:** `v-props-grid` with alphabet size, length, and bit strength; prose note
  below quotes the 1%-birthday-bound collision threshold as `~10^N`.

## 6. Do's and Don'ts

### Do:

- **Do** use `--accent` only at interaction points: active selection, CTA fill, slider thumb, status pulse, copied-row tint. The accent's rarity is what makes it meaningful.
- **Do** use Geist Mono for all UI chrome, labels, `<kbd>`, and data values. Reserve Geist Sans for display headings and prose paragraphs.
- **Do** apply `font-feature-settings: "zero", "ss01"` to every monospace element. The slashed zero is non-negotiable in UUID display.
- **Do** use 1px `--seam` hairlines to define structure. Borders, not shadows.
- **Do** carry state via shape and position alongside color — active rows have a left bar (`inset 2px 0 0 var(--accent)`) and pip glyph in addition to the accent tint.
- **Do** provide a keyboard shortcut for every primary action and keep `src/data/shortcuts.js` and the shortcut overlay in sync.
- **Do** honor `prefers-reduced-motion` by replacing transitions with instant state swaps.
- **Do** compute accent tints inline: `color-mix(in oklch, var(--accent) N%, var(--bg))` where N is context-specific (8%, 10%, 12%). Do not tokenize these intermediate values.
- **Do** keep the light-theme accent overrides lower in lightness (0.50–0.62 range) to maintain WCAG AA.

### Don't:

- **Don't** use blue-tinted surfaces, sidebar navigation chrome, card-grid layouts, or feature-overview patterns inside the tool. This is not SaaS-dashboard grey.
- **Don't** stack multiple accent colors on a single screen. Switch the active palette via `[data-accent]` — never introduce a second accent hue as decoration.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards, panels, or list items. The 2px left-bar on active version rows is `box-shadow: inset 2px 0 0 var(--accent)` — structural, not a border stripe.
- **Don't** use gradient text (`background-clip: text` + gradient). Use a single solid `--accent` for emphasis.
- **Don't** use `backdrop-filter` decoratively. It appears only on the sticky top bar and modal scrim.
- **Don't** add `box-shadow` to cards, panels, or buttons. The system is flat; `--shadow-modal` is the only drop shadow.
- **Don't** use Title Case in UI labels. Rail keys are lowercase tracked; status flags are UPPERCASE; everything else is sentence case.
- **Don't** animate layout properties (width, height, top, left). Animate `transform` and `opacity` only.
- **Don't** add page-load choreography or staggered entrance sequences. Motion is feedback: state changes, copy confirmation, regenerate spin.
- **Don't** invent a fourth button variant. Three roles (CTA, ghost, row-copy) are complete.
- **Don't** use `--ink-4` or lighter for actionable copy. Ghost Ink is the informational floor; anything lighter is decoration.
- **Don't** use `border-bottom: 2px` as a depth cue on anything other than `<kbd>` (the
  key-cap affordance). The only other sanctioned 2px bottom is the active tab underline on
  `.tab-btn--active`, where it is a directional indicator, not a depth cue.
