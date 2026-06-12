# Product

## Register

product

## Users

Developer-fluent engineers who need UUIDs routinely: seeding databases, constructing test fixtures,
wiring API contracts, generating IDs during prototyping. They know what v4 vs v7 means, work
primarily from the keyboard, and return dozens of times a week. The tool earns trust by
disappearing into the task.

## Product Purpose

uuidlab removes every marginal step between "I need a UUID" and having it ready. It generates
batches (v1/v4/v7, 1–200 entries) with formatting options (uppercase, no hyphens, braces),
validates and decodes existing UUIDs, and exposes every action via keyboard shortcut. Success
means a developer never opens another tab for UUIDs.

## Brand Personality

Terminal-luxury. Precise. Calm. Expert. The tool has confident opinions — dark-native,
monospace-first, one accent at a time — and does not explain itself. It earns authority by
being exactly right, not by performing effort.

## Anti-references

- **SaaS dashboard grey**: blue-tinted surfaces, sidebar navigation chrome, generic card grids,
  feature-overview decoration inside a task tool
- **Flashy developer marketing**: gradient-heavy dark modes, neon accent stacking, glassmorphism
  as decoration, oversaturated hero sections
- **Bare-bones utility**: no effort in UX, raw unstyled output, zero considered affordances,
  Hacker News aesthetic

## Design Principles

1. **Earn every pixel.** Real estate is leased to content (UUIDs, controls, status), not
   ornamentation. Borders are 1px hairlines. Decoration earns its place or doesn't appear.
2. **One accent at a time.** A single hue carries focus, active state, glow, and CTA. Never
   stack accents; the rarity of the accent is structural, not stylistic.
3. **The keyboard is the primary input.** Every action has a shortcut. Hover affordances are
   hints. The status bar advertises the shortcut overlay.
4. **Motion as feedback, not decoration.** Hover swaps in 120 ms, modals settle in 220 ms,
   regenerate spins for ~380 ms. No springs, no bounces, no page-load choreography.
5. **Consistency over surprise.** Same button shape, same form vocabulary, same icon style
   across all screens. Delight lives in micro-interactions; layout invention is not delight.

## Accessibility & Inclusion

WCAG AA throughout. All four accent palettes pass AA against their on-accent text values.
`--ink-4` (oklch ~0.40 in dark) is the dimmest legible token; never use it for actionable copy.
Color is never the sole carrier of state (active rows have a left bar and pip glyph alongside
accent tinting). Real `<input>` elements underpin all custom controls. `prefers-reduced-motion`
respected with instant state-swap alternatives.
