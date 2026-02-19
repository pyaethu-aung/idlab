---
description: "Task list for Compact Hero Section Design implementation"
---

# Tasks: Compact Hero Section Design

**Input**: Design documents from `specs/005-enhanced-hero-design/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Include unit test tasks for every story to keep global coverage ≥85%.
Tests are mandatory for new or changed behavior. After each task, run
`npm run test`, `npm run lint`, and `npm run build` before merge.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create documentation folder `specs/005-enhanced-hero-design/` and ensure assets exist in `specs/005-enhanced-hero-design/assets`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Allow full-bleed layout by refactoring `src/App.jsx` layout structure
- [x] T003 [P] Define flat background color variables in `src/index.css`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Compact Hero Section (Priority: P1)

**Goal**: As a visitor, I want to see a modern, compact and clean hero header immediately.

**Independent Test**: Load landing page, verify Hero matches "Compact" design (Badge, Typography, Background).

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Create unit test for Hero content and structure in `src/components/Hero.test.jsx`

### Implementation for User Story 1

- [x] T005 [US1] Implement new Hero structure (Badge, H1, Subhead) in `src/components/Hero.jsx`
- [x] T006 [US1] Apply flat theme-aware background to `.hero-bg` in `src/index.css`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Seamless Theme Switching (Priority: P1)

**Goal**: As a user, I want the hero section to look consistent and beautiful in my preferred theme.

**Independent Test**: Toggle Light/Dark mode, observe Hero background changes.

### Tests for User Story 2 ⚠️

- [x] T007 [P] [US2] Update unit tests to verify theme-specific class presence in `src/components/Hero.test.jsx`

### Implementation for User Story 2

- [x] T008 [US2] Ensure smooth transition properties apply to new Hero elements in `src/App.css`
- [x] T009 [US2] Verify high-contrast color palette in Light and Dark modes in `src/index.css`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 [P] Verify responsiveness on mobile (stacking) vs desktop in `src/components/Hero.jsx`
- [x] T011 Run full lint check `npm run lint` and fix any new style issues (e.g., unused vars)
- [x] T012 Verify `npm run build` passes with new components
- [x] T013 Update design assets in `specs/005-enhanced-hero-design/assets/` to match "Compact" screen
- [x] T014 Verify Hero section LCP contribution is <100ms (SC-001) using Chrome DevTools/Lighthouse

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrated with US1 components

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Structure before styles
- Story complete before moving to next priority

### Parallel Opportunities

- T004 (Tests US1) and T007 (Tests US2) can be written in parallel
- Once T002 (Layout) is done, visual work in T005/T006 and theme work in T008/T009 can partly overlap

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational (Layout refactor)
2. Add User Story 1 (Hero Content) → Test independently
3. Add User Story 2 (Theming) → Test independently
4. Polish & Final Verify
