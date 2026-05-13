# Implementation Plan: UUID Validator & Decoder

**Branch**: `010-uuid-decode` | **Date**: 2026-05-13 | **Spec**: [spec.md](./spec.md)

## Summary

Add a validator panel to the existing single-page app that accepts a UUID string, validates it against RFC 4122, decodes its version and component fields, and extracts the embedded timestamp for v1 and v7 UUIDs. Navigation between the generator and the new validator is handled by a two-tab toolbar in the existing top bar. All decoding runs client-side with no new runtime dependencies.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 18  
**Primary Dependencies**: `uuid` (existing), `vitest` + `@testing-library/react` (existing)  
**Storage**: N/A — validator state is ephemeral (in-memory only)  
**Testing**: Vitest (jsdom), @testing-library/react  
**Target Platform**: Modern browsers — Chrome, Safari, Firefox, Edge; desktop + mobile  
**Project Type**: Single-page web application  
**Performance Goals**: Validation result visible in <200ms after input (constitution IV); SC-001 target is <1s  
**Constraints**: No new runtime dependencies; all styling via existing CSS custom properties and token classes; no client-side routing library  
**Scale/Scope**: Single panel added to existing app; no scale concerns

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ Pass | No dead code; lint-clean required |
| II. Testing (NON-NEGOTIABLE) | ✅ Pass | `src/utils/uuidDecoder.js` MUST have test file; coverage ≥85% maintained |
| III. UX Consistency | ✅ Pass | Validator uses same design tokens, layout patterns, and theme system |
| IV. Performance | ✅ Pass | Client-side decode is O(1); well under 200ms |
| V. Architecture | ✅ Pass | New code in `src/utils/`, `src/hooks/`, `src/components/` per layout rules |
| VI. Execution (NON-NEGOTIABLE) | ✅ Pass | `npm run test`, `npm run lint`, `npm run build` required after every task |
| VII. Cross-Platform | ✅ Pass | Mobile: breakdown stacks vertically (clarification Q3) |
| VIII. Theme Support | ✅ Pass | CSS custom properties throughout; segment colors use design tokens |
| IX. Skill-Driven | ✅ Pass | `/commit-message`, `/speckit-*` skills followed |

*No constitution violations. Complexity Tracking section omitted.*

## Project Structure

### Documentation (this feature)

```text
specs/010-uuid-decode/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/
│   └── ui-contracts.md  ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
src/
├── utils/
│   ├── uuidDecoder.js        ← NEW: pure decode/parse functions
│   └── uuidDecoder.test.js   ← NEW: required Vitest tests
├── hooks/
│   ├── useActiveTab.js       ← NEW: tab state (generator | validator)
│   ├── useActiveTab.test.js  ← NEW
│   ├── useUuidValidator.js   ← NEW: validator input + decoded result state
│   └── useUuidValidator.test.js ← NEW
├── components/
│   ├── ToolbarNav.jsx        ← NEW: two-tab nav rendered inside .topbar-nav
│   ├── ValidatorPanel.jsx    ← NEW: validator screen root
│   ├── UuidInput.jsx         ← NEW: controlled text field with clear button
│   ├── ValidationBadge.jsx   ← NEW: valid/invalid status chip
│   ├── UuidBreakdown.jsx     ← NEW: 5-segment color-coded visualization
│   ├── DecodedFields.jsx     ← NEW: timestamp + sequence + node + variant display
│   └── components.test.jsx   ← MODIFIED: add tests for new components
├── App.jsx                   ← MODIFIED: integrate useActiveTab + ToolbarNav,
│                                conditionally render generator vs validator
└── index.css                 ← MODIFIED: tab nav, validator layout, breakdown CSS
```
