# Tasks: UUID Validator & Decoder

**Input**: Design documents from `specs/010-uuid-decode/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ui-contracts.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no in-phase dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Establish baseline before adding new code

- [x] T001 Run `npm run test` to confirm all existing tests pass before starting feature work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core decode utility that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create `src/utils/uuidDecoder.js` — export `normalizeInput(raw)`, `extractFields(uuid)`, `detectVariant(hex)`, `parseUuid(raw)`, `decodeUuidV1(fields)`, `decodeUuidV7(fields)`, `formatRelativeTime(date)` per `specs/010-uuid-decode/research.md` decisions 2–5 and `specs/010-uuid-decode/data-model.md` entity definitions
- [x] T003 Create `src/utils/uuidDecoder.test.js` — test all exports: `normalizeInput` trims whitespace and strips braces; `parseUuid` returns `valid:false` for malformed input; `parseUuid` detects v1/v4/v7 with correct version and variant; `decodeUuidV7` extracts correct Unix ms timestamp and 12-bit sequence (use a known v7 UUID); `decodeUuidV1` extracts correct Gregorian-to-Unix timestamp and node field; `formatRelativeTime` returns correct label per threshold table in research.md decision 5

**Checkpoint**: `npm run test` passes; `src/utils/uuidDecoder.js` coverage ≥85%

---

## Phase 3: User Story 1 — Validate a UUID (Priority: P1) 🎯 MVP Part 1

**Goal**: Validator screen accepts a UUID string, normalizes it, and shows a clear valid/invalid status badge — no navigation yet.

**Independent Test**: Import `ValidatorPanel` directly in a dev render. Enter a well-formed v4 UUID → "Valid — UUID v4 (random)" badge appears. Enter garbage → "Invalid UUID" badge. Enter `{uuid-string}` → braces stripped, validates correctly.

- [x] T004 [P] Create `src/hooks/useUuidValidator.js` — `useState('')` for rawInput; derive result synchronously via `parseUuid(normalizeInput(rawInput))`; return `{ rawInput, setRawInput, result }` per `specs/010-uuid-decode/contracts/ui-contracts.md`
- [x] T005 [P] [US1] Create `src/components/UuidInput.jsx` — controlled `<input type="text" spellCheck={false} autoComplete="off">` with placeholder `"Paste or type a UUID…"`; renders a visible `×` clear button when value is non-empty; clear sets value to `""`; props: `{ value, onChange, placeholder? }` per contracts
- [x] T006 [P] [US1] Create `src/components/ValidationBadge.jsx` — renders nothing when `result` is `null`; renders `"Invalid UUID"` chip using `.validation-badge--invalid` when `!result.valid`; renders `"Valid — UUID v{N} (label)"` using `.validation-badge--valid` when `result.valid`; version labels: v1=time-based, v4=random, v7=time-ordered, others=no label; props: `{ result }` per contracts
- [x] T007 [US1] Create `src/hooks/useUuidValidator.test.js` — tests: default `rawInput` is `""`; setting a valid v4 UUID yields `result.valid === true` and `result.version === 4`; setting garbage yields `result.valid === false`; nil UUID (all-zeros) is valid; `{uuid}` wrapped input is normalized and validated correctly; clearing input resets result to `null`
- [x] T008 [US1] Create `src/components/ValidatorPanel.jsx` — calls `useUuidValidator()`; renders a hero section ("Decode any UUID at a glance." + subtitle); renders `<UuidInput>` bound to `rawInput`/`setRawInput`; renders `<ValidationBadge result={result} />`; wraps content in `.validator-panel` container; no breakdown or decoded sections yet (added in Phase 5–6)
- [x] T009 [P] [US1] Add validator CSS to `src/index.css` — `.validator-panel` (full-width flex column, same padding as `.bench`); `.uuid-input-wrap` (relative container for input + clear button); `.uuid-input-field` (full-width, monospace font, same height as existing ghost-btn, uses `var(--bg-2)` + `var(--seam)` border); `.uuid-input-clear` (absolute-positioned, uses `var(--ink-3)`); `.validation-badge` base; `.validation-badge--valid` (uses `var(--accent)` color); `.validation-badge--invalid` (uses a muted red OKLCH value)
- [x] T010 [US1] Add tests for `UuidInput` and `ValidationBadge` to `src/components/components.test.jsx` — UuidInput: renders input with placeholder, clear button hidden when empty, clear button visible when value present, clear button resets value; ValidationBadge: renders nothing for null result, renders invalid badge for invalid result, renders correct version label for v4/v7/v1

**Checkpoint**: `ValidatorPanel` is self-contained and testable in isolation. US1 acceptance scenarios 1–5 all pass. `npm run test && npm run lint` pass.

---

## Phase 4: User Story 2 — Navigate Between Generator and Validator (Priority: P1) 🎯 MVP Complete

**Goal**: A two-tab toolbar appears in the top bar on both screens; clicking a tab switches the visible panel without unmounting either; the brand tag updates to reflect the active tool.

**Independent Test**: Run the dev server. Both "Generator" and "Validator" tabs are visible in the top bar. Clicking "Validator" shows the validator panel. Clicking "Generator" restores the UUID list. Previously generated UUIDs and any UUID typed in the validator are both preserved across switches.

- [x] T011 [P] Create `src/hooks/useActiveTab.js` — `useState('generator')`; return `{ activeTab, setActiveTab }`; calling `setActiveTab` with the current tab is a no-op per contracts
- [x] T012 [P] [US2] Create `src/components/ToolbarNav.jsx` — renders two `<button>` elements inside `.topbar-nav`; active tab button has `aria-current="page"` and `.tab-btn--active` class; clicking the inactive tab calls `onTabChange`; clicking the active tab does NOT call `onTabChange`; props: `{ activeTab, onTabChange }` per contracts
- [x] T013 [US2] Create `src/hooks/useActiveTab.test.js` — tests: default tab is `'generator'`; `setActiveTab('validator')` updates activeTab; calling `setActiveTab` with current tab causes no re-render (state unchanged)
- [x] T014 [US2] Update `src/App.jsx` — import and call `useActiveTab()`; pass `activeTab`/`setActiveTab` as `onTabChange` to `<ToolbarNav>`; wrap the generator `<section className="bench">` and `<ValidatorPanel />` each with `style={{ display: activeTab === '...' ? '' : 'none' }}` so both remain mounted (do NOT conditionally render/unmount); update `<span className="brand-tag">` to show `/ generator` or `/ validator` based on `activeTab`; `<ToolbarNav>` renders inside the existing `<nav className="topbar-nav">` element
- [x] T015 [P] [US2] Add toolbar nav CSS to `src/index.css` — `.topbar-nav .tab-btn` (monospace, ghost-btn style, font-size `var(--fs-sm)`); `.topbar-nav .tab-btn--active` (color `var(--accent)`, border-bottom `2px solid var(--accent)`); hover state for inactive tab
- [x] T016 [US2] Add tests for `ToolbarNav` to `src/components/components.test.jsx` and tab-switching to `src/App.test.jsx` — ToolbarNav: renders two buttons, active tab has aria-current, clicking inactive tab calls onTabChange, clicking active tab does not call onTabChange; App: clicking Validator tab shows ValidatorPanel, clicking Generator tab shows generator bench, both panels remain in DOM

**Checkpoint**: Full MVP is functional. Both tabs switch cleanly. US2 acceptance scenarios 1–3 all pass. `npm run test && npm run lint && npm run build` pass.

---

## Phase 5: User Story 3 — Inspect UUID Component Breakdown (Priority: P2)

**Goal**: Valid UUIDs display a color-coded visualization of their 5 RFC 4122 fields below the validation badge.

**Independent Test**: Enter a valid v4 UUID in the validator → 5 color-coded segment blocks appear, each showing a hex substring and its field name. Enter an invalid UUID → breakdown disappears.

- [x] T017 [P] [US3] Create `src/components/UuidBreakdown.jsx` — renders nothing when `fields` is `null`; renders 5 `.uuid-breakdown__seg` blocks inside `.uuid-breakdown` for the 5 fields (timeLow, timeMid, timeHighAndVersion, clockSeqAndReserved, node); each block shows hex value in monospace and field name as a label below; applies `.seg-a` through `.seg-e` color classes; props: `{ fields }` per contracts
- [x] T018 [P] [US3] Add breakdown CSS to `src/index.css` — `.uuid-breakdown` (flex row, gap `var(--space-4)`, flex-wrap `wrap`); `.uuid-breakdown__seg` (flex column, padding `var(--space-4)`; border `1px solid var(--seam)`, border-radius `var(--r-md)`); `.seg-a` through `.seg-e` with border-top `3px solid` using OKLCH colors per research.md decision 6 (seg-a: `var(--accent)`; seg-b: `var(--ink-2)`; seg-c: `oklch(0.72 0.15 250)`; seg-d: `oklch(0.72 0.15 65)`; seg-e: `oklch(0.72 0.15 340)`); `@media (max-width: 920px)` — `.uuid-breakdown` switches to flex-direction column per clarification Q3
- [x] T019 [US3] Integrate `UuidBreakdown` into `src/components/ValidatorPanel.jsx` — add `import UuidBreakdown` and render `<UuidBreakdown fields={result?.valid ? result.fields : null} />` below `<ValidationBadge>`
- [x] T020 [US3] Add `UuidBreakdown` tests to `src/components/components.test.jsx` — renders nothing for `null` fields; renders 5 segment blocks for valid parsed fields; each block contains the correct hex substring; renders nothing when result is invalid

**Checkpoint**: Color-coded field breakdown visible for valid UUIDs; hidden for invalid input. US3 acceptance scenarios 1–3 pass. `npm run test && npm run lint && npm run build` pass.

---

## Phase 6: User Story 4 — Extract Timestamp from Time-Based UUIDs (Priority: P3)

**Goal**: v1 and v7 UUIDs display the embedded timestamp (relative + ISO), sequential counter (v7), and node field (v1) in a decoded properties panel; v4 and other non-time-based UUIDs show only the variant.

**Independent Test**: Enter a known v7 UUID → decoded panel shows relative time (e.g. "2 minutes ago"), ISO-8601 datetime, and sequential counter. Enter a v4 UUID → decoded panel shows only variant; no timestamp section. Enter a v1 UUID → decoded panel shows timestamp and node field.

- [x] T021 [P] [US4] Create `src/components/DecodedFields.jsx` — renders nothing when both `decoded` and `variant` are `null`; renders `.decoded-row` for variant whenever `variant` is non-null; renders timestamp relative + ISO rows when `decoded` is non-null; renders sequence row when `decoded.sequence !== null`; renders node row when `decoded.node !== null`; each row is a `.decoded-label` / `.decoded-value` pair; props: `{ decoded, variant }` per contracts
- [x] T022 [P] [US4] Add decoded fields CSS to `src/index.css` — `.decoded-fields` (flex column, gap `var(--space-3)`, margin-top `var(--space-8)`); `.decoded-row` (flex row, gap `var(--space-8)`, align-items baseline); `.decoded-label` (font-size `var(--fs-xs)`, color `var(--ink-3)`, monospace, min-width 160px); `.decoded-value` (font-size `var(--fs-base)`, color `var(--ink)`, monospace); `.decoded-timestamp-rel` (font-size `var(--fs-md)`, font-weight `var(--fw-semibold)`, color `var(--ink)`)
- [x] T023 [US4] Integrate `DecodedFields` into `src/components/ValidatorPanel.jsx` — add `import DecodedFields` and render `<DecodedFields decoded={result?.decoded ?? null} variant={result?.valid ? result.variant : null} />` below `<UuidBreakdown>`
- [x] T024 [US4] Add `DecodedFields` tests to `src/components/components.test.jsx` — v7 UUID result shows relative timestamp, ISO string, and sequence value; v1 UUID result shows timestamp and node field; v4 UUID result shows variant only, no timestamp section; null props render nothing

**Checkpoint**: Full decode panel functional for v1 and v7. US4 acceptance scenarios 1–4 pass. `npm run test && npm run lint && npm run build` pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and visual consistency across themes and viewports

- [ ] T025 [P] Verify dark/light theme rendering on validator panel — toggle theme via ThemeToggle and confirm all CSS custom properties (`var(--bg)`, `var(--seam)`, `var(--ink)`, `var(--accent)`) resolve correctly on `.validator-panel`, `.uuid-input-field`, `.validation-badge`, and `.decoded-fields`
- [ ] T026 [P] Verify mobile responsive layout — inspect validator at ≤920px viewport: `.uuid-input-field` fills full width, `.uuid-breakdown` segments stack vertically (no horizontal overflow), `.decoded-fields` rows wrap correctly
- [ ] T027 Run `npm run test` — verify all tests pass and coverage ≥85%
- [ ] T028 Run `npm run lint` — fix any linting errors before marking done
- [ ] T029 Run `npm run build` — verify production build succeeds with no warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 (uses `parseUuid`)
- **US2 (Phase 4)**: Depends on Phase 3 (`ValidatorPanel` must exist to mount conditionally in App.jsx)
- **US3 (Phase 5)**: Depends on Phase 2 (uses `UuidFields` from decoder) and Phase 3 (integrates into `ValidatorPanel`)
- **US4 (Phase 6)**: Depends on Phase 2 (uses `DecodedData` from decoder) and Phase 3 (integrates into `ValidatorPanel`)
- **Polish (Phase 7)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Foundational — no dependency on US2, US3, US4
- **US2 (P1)**: Depends on US1 completing (`ValidatorPanel` must exist before App.jsx integration)
- **US3 (P2)**: Can start after Foundational — `UuidBreakdown` is independent, integration is one line in `ValidatorPanel`
- **US4 (P3)**: Can start after Foundational — `DecodedFields` is independent, integration is one line in `ValidatorPanel`

> **Note**: US3 and US4 can be developed in parallel with US2 since their component files are independent. Only the ValidatorPanel integration steps (T019, T023) require US1 to be complete.

### Within Each Phase

- Models/hooks before composite components (e.g., T004 before T008)
- CSS tasks [P] are always parallel with component tasks (different files)
- Integration tasks (T014, T019, T023) always come last within their phase

### Parallel Opportunities

- **Phase 3**: T004, T005, T006, T009 can all run in parallel (4 different files)
- **Phase 4**: T011, T012, T013, T015 can run in parallel (4 different files)
- **Phase 5**: T017, T018 can run in parallel (component + CSS)
- **Phase 6**: T021, T022 can run in parallel (component + CSS)
- **Cross-phase**: US3 (Phase 5) and US4 (Phase 6) component + CSS tasks can begin while US2 (Phase 4) integration is in progress

---

## Parallel Example: Phase 3 (US1)

```
# All four can start simultaneously after Phase 2:
T004 Create src/hooks/useUuidValidator.js
T005 Create src/components/UuidInput.jsx
T006 Create src/components/ValidationBadge.jsx
T009 Add validator CSS to src/index.css

# After T004 completes:
T007 Create src/hooks/useUuidValidator.test.js

# After T005 + T006 complete:
T010 Add UuidInput + ValidationBadge tests to components.test.jsx

# After T004 + T005 + T006 complete:
T008 Create src/components/ValidatorPanel.jsx
```

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Complete Phase 1: Setup baseline check
2. Complete Phase 2: Foundational decoder utility
3. Complete Phase 3: US1 — validator logic and panel
4. Complete Phase 4: US2 — navigation toolbar, App.jsx integration
5. **STOP and VALIDATE**: Both tabs switch; validator accepts input and shows valid/invalid
6. Ship or demo as MVP

### Incremental Delivery

1. Setup + Foundational → decoder utility ready
2. US1 complete → validator panel with input + status badge
3. US2 complete → **MVP**: navigable two-tool app ← *demo point*
4. US3 complete → component breakdown visualization ← *demo point*
5. US4 complete → full timestamp decode ← *demo point*
6. Polish → production-ready

---

## Notes

- `[P]` tasks touch different files — safe to run in parallel
- `[Story]` label maps each task to its user story for traceability
- Both generator and validator panels MUST stay mounted (CSS hide) — do NOT use conditional rendering that unmounts (FR-003)
- `uuidDecoder.js` uses `BigInt` for v1 timestamp — no polyfill needed for target browsers
- Segment colors (`.seg-a` through `.seg-e`) are hardcoded OKLCH values — they are decorative, not theme-sensitive
- Run `npm run test && npm run lint && npm run build` at every phase checkpoint before marking complete (constitution Principle VI)
