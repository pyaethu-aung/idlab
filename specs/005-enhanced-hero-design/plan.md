# Implementation Plan: Compact Hero Section Design

**Branch**: `005-enhanced-hero-design` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-enhanced-hero-design/spec.md`

## Summary

Implement a flat, compact hero header to align with the "Compact Hero Section Design" from Stitch. The design removes gradients and primary/secondary CTA buttons in the header itself, focusing on branding (Fresh IDs badge), clear typography ("Instant UUID generator built for flow"), and a descriptive subheadline. The layout remains responsive and supports light/dark theme switching smoothly using CSS variables.

## Technical Context

**Language/Version**: JavaScript (React + Vite)
**Primary Dependencies**: React, TailwindCSS, Vanilla CSS (for custom variables)
**Testing**: Vitest (Unit), Manual (Visual/Responsive)
**Target Platform**: Web (Responsive: Mobile to Desktop)
**Performance Goals**: Hero render < 100ms LCP contribution.
**Constraints**: 
- Must use existing styling framework (Vanilla CSS variables + utility classes).
- Must verify full support for Light/Dark modes.
- No gradients on hero background (Flat colors only).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Code Quality**: Will use existing linting/formatting.
- [x] **II. Testing**: Will update unit tests for `Hero.jsx`.
- [x] **III. UX**: Consistent with "Compact" aesthetic, premium feel.
- [x] **VII. Cross-Platform**: Responsive design adjustment.
- [x] **VIII. Theme Support**: Explicitly planned for Light/Dark modes.
- [x] **IX. Skill-Driven**: Utilizing `react-components` for alignment.

## Phase 0: Research & Unknowns

**Status**: [Resolved]

- **Layout Strategy**: The Compact design header is shallower (`pt-12 pb-8`). 
- **Theming**: Flat colors (`#030712` and `#f8fafc`) replace previous gradients.

## Phase 1: Design & Contracts

**Status**: [Skipped]

## Phase 2: React Component Design

### Components

#### `Hero` (Modified)
- **Props**: `feedback` (string, optional)
- **State**: None
- **Structure**:
    - Outer Wrapper: `section`, `relative`, `hero-bg`.
    - Inner Container: `max-w-4xl`, `mx-auto`, `px-4`.
    - Content:
        - Badge: "Fresh IDs"
        - H1: "Instant UUID generator built for flow"
        - P: Subheadline (Batch info)
        - Background: Flat hex color (No gradients).

## Project Structure

### Documentation (this feature)

```text
specs/005-enhanced-hero-design/
├── plan.md              # This file
├── spec.md              # Feature specification
├── tasks.md             # Execution tasks
└── assets/              # Compact Design references (Updated)
    ├── design.png
    └── design.html
```
