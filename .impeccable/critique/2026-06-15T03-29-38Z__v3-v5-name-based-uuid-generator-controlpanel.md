---
target: v3/v5 name-based UUID generator ControlPanel
total_score: 26
p0_count: 0
p1_count: 1
timestamp: 2026-06-15T03-29-38Z
slug: v3-v5-name-based-uuid-generator-controlpanel
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active namespace not surfaced in output panel; only visible in sidebar |
| 2 | Match System / Real World | 3 | Placeholder `e.g. example.com` misleads for OID / X.500 contexts |
| 3 | User Control and Freedom | 2 | No one-action clear on the name field; namespace shortcuts absent |
| 4 | Consistency and Standards | 4 | Perfect rail vocabulary match; `mono`, `is-active`, `rail-head` used correctly |
| 5 | Error Prevention | 1 | Empty name silently produces N identical UUIDs — correctness trap with no warning |
| 6 | Recognition Rather Than Recall | 3 | DNS/URL familiar; OID/X.500 opaque without tooltip; placeholder aids DNS only |
| 7 | Flexibility and Efficiency | 3 | Chips are keyboard-accessible; no shortcut keys for namespace unlike version/format |
| 8 | Aesthetic and Minimalist Design | 4 | 2×2 chip grid is the right choice; no visual noise; every element earns its space |
| 9 | Error Recovery | 1 | No error state for empty name; no maxLength; no whitespace-only guard |
| 10 | Help and Documentation | 2 | Version description explains determinism, but only in version selector; no inline hint at name field |
| **Total** | | **26/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM Assessment**: No AI slop detected. The namespace section is visually indistinguishable from the surrounding rail — it uses `rail-head`, `mono`, `is-active`, and `color-mix(in oklch, var(--accent) 12%, var(--bg))` consistently with `batch`, `format`, and `version` sections. The 2×2 chip grid serves a real semantic purpose (four RFC 4122 constants) and does not read as a generic card grid. No gradient text, no glassmorphism, no eyebrow labels, no side-stripe borders. The section feels designed-together with the tool, not grafted on.

**Deterministic scan**: One finding.
- `overused-font` (warning) — `src/index.css` line 1: "Google Fonts: Geist." **False positive.** Geist is the project's committed identity font documented in DESIGN.md and PRODUCT.md as a terminal-luxury design choice. The mono/sans pairing is structural, not reflexive. Disregard.

**Browser visualization**: Dev server confirmed running at localhost:5175. v3/v5 selection reveals namespace chips and name input correctly. Live UUID output updates on every chip click and keystroke. No rendering anomalies observed.

## Overall Impression

The implementation is compositionally strong and visually faithful. It slots into the tool as though it was always there. The live-update feedback loop — tap a chip, see the UUID change — is the feature's best moment: it demonstrates the determinism contract without any documentation.

The single biggest problem is silent correctness failure: an empty name field generates N identical UUIDs with no warning. For a tool that earns authority by being "exactly right," this is a trust-destroying edge case that the target user will hit on first exploration. Fix the empty-name state and this feature is ready to ship.

## What's Working

**1. Visual vocabulary fidelity.** The namespace section is executed as if the original design system specified it. `rail-head + mono + is-active` chain is identical to `version`, `batch`, `format`. No new abstractions invented.

**2. The live determinism feedback loop.** Clicking a namespace chip while viewing the output pane teaches the determinism contract instantly. No documentation needed. This is the feature's strongest UX moment.

**3. Chip grid over dropdown.** All four options are simultaneously visible, one tap to switch, no focus trap. The 2×2 grid is exactly right for four fixed options.

## Priority Issues

**[P1] Silent empty-name identical UUIDs**
- **Why it matters**: An empty `name` field is a valid but semantically degenerate state — `v3("", namespace)` produces a real UUID, but one derived from an empty string. The batch shows N identical values with no visual signal that the name field is empty. A developer who copies these into a database seed will get unique constraint violations when the batch contains duplicates, or produce collisions across seeds. The "precisely right" brand promise is broken silently at the expert user's highest-stakes moment.
- **Fix**: When `name` is empty or whitespace-only, show an inline hint below the name input ("Output is derived from an empty name — type a name to generate unique deterministic UUIDs") and optionally tint the name field border with `--seam-2`. Do not block generation — the empty-string UUID is technically valid — but make the state visible.
- **Suggested command**: /impeccable harden

**[P2] Active namespace invisible in output panel**
- **Why it matters**: The output panel header shows `v3 · default` (version + format flags). The active namespace — the other half of the generation parameters — is visible only in the sidebar rail, which may be scrolled off-screen. An expert returning to the tool after a context switch cannot confirm their generation parameters from the output panel alone. The status bar shows `ver v3` but not the namespace.
- **Fix**: Extend the `UuidList` panel-flag to include namespace and name summary when `isNameBased` is true. Example: `v3 · dns · example.com` or `v5 · url · (empty)`. The StatusBar `ver` cell could similarly show `ver v3/dns`.
- **Suggested command**: /impeccable clarify

**[P3] No keyboard shortcut for namespace selection**
- **Why it matters**: The tool's identity is keyboard-first: version has ⌥1–5, batch has ⌥↑/↓, format has ⌥U/H/B. Namespace chips are pointer-only. This inconsistency is jarring for a power user who never reaches for the mouse — and who chose this tool precisely because everything else has a shortcut.
- **Fix**: Add ⌥← / ⌥→ (or ⌥N + 1–4) to cycle through DNS/URL/OID/X.500 when a name-based version is active. Update `useKeyboardShortcuts` and `src/data/shortcuts.js` accordingly.
- **Suggested command**: /impeccable harden

**[P3] Placeholder misleads for OID and X.500 namespaces**
- **Why it matters**: `e.g. example.com` is a valid DNS name. An OID name should be a dotted arc string (`1.2.840.113549`) and an X.500 name should be a distinguished name (`cn=John Doe,dc=example,dc=com`). Entering `example.com` under the OID namespace produces a valid UUID — but not the one the developer expects if they're actually working with OID identifiers. The placeholder silently implies an incorrect input format.
- **Fix**: Make the placeholder reactive to the active namespace chip. When DNS is active: `e.g. example.com`. URL: `e.g. https://example.com`. OID: `e.g. 1.2.840.113549`. X.500: `e.g. cn=John Doe,dc=example,dc=com`.
- **Suggested command**: /impeccable clarify

## Persona Red Flags

**Alex (Power User — seeding databases, keyboard-first):**
Selects v3, sees 8 identical UUIDs in the output (empty name state), hits ⌘+Shift+C or copy-all, pastes into a seed script. No warning appears. The seed script runs; the unique constraint fails on rows 2–8. Alex checks the generator, sees the empty name field for the first time, realizes the trap. This is the most serious confidence failure for the target user. Additionally: Alex tries to find a keyboard shortcut for DNS→URL via ⌥ + something. There isn't one. This is the second failure, smaller but noticed.

**Sam (Accessibility-Dependent — screen reader, keyboard nav):**
The grouping (`role="group" aria-label="Namespace preset"`) and individual `aria-pressed` states are solid. The `aria-label` on the name input is descriptive. No click-only interactions. However: the empty-name state (P1) has no programmatic announcement — the `stageFeedback` mechanism exists but is not used here. A screen reader user who skips the name field and copies output receives no audible warning that the output is in a degenerate state. The `panel-flag` in the output panel does not communicate active namespace to AT.

**Riley (Stress Tester):**
- Empty name → N identical UUIDs, no guard. Already documented.
- Whitespace-only name (`"   "`) → produces a UUID different from `""` with no visual distinction. Developer entering trailing space gets a UUID they cannot reproduce by typing the same string without the space.
- No `maxLength` on the name input → pasting a very large string calls `syncVisibleBatch` synchronously on every paste event with no debounce. Potential main-thread stall for multi-KB inputs (unlikely in practice but unguarded).

## Minor Observations

- The `name-input` CSS lacks `font-feature-settings: "zero", "ss01"` — the system's **Slashed-Zero Rule** requires all mono elements to carry it. The input renders UUIDs as part of the output, not within itself, but any typed name containing zeros (like OID arcs `1.2.0.3`) will show undotted zeros inconsistently with the surrounding chrome. Should match `.mono` class behavior.
- Two `rail-head` elements inside a single `rail-section` is a structural irregularity; every other section has one. Namespace + name could be considered one "name config" unit, but two headers inside it is semantically awkward.
- The version hint in the rail now reads `⌥1·⌥2·⌥3·⌥4·⌥5` (no spaces around `·`) while the format hint reads `⌥U · ⌥H · ⌥B` (spaces). Minor cosmetic inconsistency.
- The `style={{ marginTop: "var(--sp-7)", marginBottom: "var(--sp-4)" }}` inline on the name `rail-head` element breaks the CSS-class-only architecture. Should be a modifier class.

## Questions to Consider

1. **Should an empty name block copy-all, or just warn?** The empty-string UUID is RFC-valid — is a warning sufficient, or should the copy action require a name to be filled to protect the developer from the most common mistake?
2. **Why doesn't the output panel echo the full generation signature?** The tool is precise. `v3 · dns · example.com` in the panel-flag is four tokens, exactly as expressive as a terminal command. What's the argument against it?
3. **Does "regenerate" need to exist for name-based versions?** For v4/v7 it generates new random output. For v3/v5 with identical inputs it produces identical output. Should the button be relabeled "copy params" or hidden when a name-based version is active?
4. **Is the 2×2 chip layout reflecting information or just coincidence?** DNS and URL account for ~95% of real use cases. OID and X.500 are enterprise legacy. Should the layout reflect frequency (DNS/URL prominent, OID/X.500 secondary) rather than RFC ordering (all four equal)?
