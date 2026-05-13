# Feature Specification: UUID Validator & Decoder

**Feature Branch**: `010-uuid-decode`
**Created**: 2026-05-13
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Validate a UUID (Priority: P1)

A user who has a UUID string wants to quickly know whether it is valid and which RFC 4122 version it represents. They paste or type the string into the validator and immediately see a clear status badge.

**Why this priority**: Core feature value — validation is the primary reason to visit the validator screen.

**Independent Test**: Can be fully tested by entering a well-formed UUID and confirming a "Valid — UUID vN" badge appears, and by entering garbage text and confirming an "Invalid" state is shown.

**Acceptance Scenarios**:

1. **Given** the user is on the validator screen, **When** they type a well-formed v4 UUID, **Then** the system shows "Valid — UUID v4 (random)" as the status.
2. **Given** the user pastes a malformed string, **When** the input changes, **Then** the system shows an "Invalid UUID" error state with no component breakdown displayed.
3. **Given** the user pastes a nil UUID (all zeros), **When** the input is committed, **Then** the system identifies it as a valid nil UUID.
4. **Given** the user pastes a UUID wrapped in curly braces `{uuid}`, **When** the input is committed, **Then** the system strips the braces and validates the inner string.
5. **Given** the user pastes a UUID with surrounding whitespace, **When** the input changes, **Then** the system trims the whitespace before validation.

---

### User Story 2 - Navigate between generator and validator (Priority: P1)

A user who is generating UUIDs wants to switch to the validator to inspect one, and vice versa, without losing their current work in either panel.

**Why this priority**: Navigation between the two tools is essential for the single-page app to be coherent; it must work before the validator delivers any value.

**Independent Test**: Can be fully tested by checking that a toolbar with "Generator" and "Validator" tabs is visible on both screens and that clicking between them switches the active panel while preserving state.

**Acceptance Scenarios**:

1. **Given** the user is on the generator screen, **When** they click the "Validator" tab in the toolbar, **Then** the validator panel is displayed.
2. **Given** the user navigates to the validator and then back to the generator, **Then** the previously generated UUID list is still present.
3. **Given** the user has typed a UUID into the validator input, **When** they switch to the generator and return, **Then** the validator input retains its value.

---

### User Story 3 - Inspect UUID component breakdown (Priority: P2)

A developer wants to see the individual byte fields of a UUID displayed as a color-coded visual breakdown so they can understand the internal structure of the identifier.

**Why this priority**: High educational and debugging value for developers, but only meaningful once validation is working.

**Independent Test**: Can be fully tested by entering a valid UUID and confirming that 5 color-coded segments are shown with their corresponding hex values and field names.

**Acceptance Scenarios**:

1. **Given** a valid UUID is entered, **When** it validates, **Then** the 32 hex characters are presented as 5 color-coded groups matching the UUID field layout (time-low, time-mid, time-high-and-version, clock-seq, node).
2. **Given** a UUID v4 is entered, **When** the breakdown is shown, **Then** the version nibble and variant bits are visually distinguished.
3. **Given** an invalid UUID is entered, **When** the error state is shown, **Then** no component breakdown is displayed.

---

### User Story 4 - Extract timestamp from time-based UUIDs (Priority: P3)

A developer with a v1 or v7 UUID wants to know the exact creation time embedded in it, displayed as both a human-readable relative time and an absolute ISO-8601 timestamp.

**Why this priority**: High value for debugging and auditing, but only relevant for a subset of UUID versions.

**Independent Test**: Can be fully tested by entering a known v7 UUID and confirming that both the relative time and the ISO-8601 datetime match the UUID's embedded timestamp.

**Acceptance Scenarios**:

1. **Given** a valid v7 UUID, **When** decoded, **Then** the system displays the embedded timestamp as relative time (e.g., "2 minutes ago") and as an ISO-8601 date-time string.
2. **Given** a valid v1 UUID, **When** decoded, **Then** the system extracts the 100-nanosecond-precision timestamp and displays both the adjusted time and ISO date-time.
3. **Given** a v4 UUID (no embedded timestamp), **When** decoded, **Then** no timestamp section is shown in the output.
4. **Given** a v7 UUID, **When** decoded, **Then** the sequential counter value extracted from the UUID is displayed.

---

### Edge Cases

- What happens when an all-uppercase UUID is entered? (System treats UUID input as case-insensitive.)
- What happens with a max UUID (all `f` characters)? (System identifies it as a valid max UUID.)
- What happens with a version 3, 5, or 6 UUID? (System shows the correct version number; detailed field decoding is limited to v1, v4, and v7.)
- What happens when the user clears the input? (System resets to an empty state with no status or breakdown shown.)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a validator screen accessible via a "Validator" tab in the app toolbar.
- **FR-002**: System MUST display a persistent toolbar with "Generator" and "Validator" navigation tabs on both screens.
- **FR-003**: System MUST preserve the state of each panel (generated UUID list, validator input) when the user switches tabs.
- **FR-004**: System MUST accept a UUID string via a text input field on the validator screen.
- **FR-005**: System MUST treat UUID input as case-insensitive and strip surrounding whitespace and curly braces before validation.
- **FR-006**: System MUST validate the input string against RFC 4122 UUID format rules in real-time as the user types or pastes.
- **FR-007**: System MUST display a clear valid or invalid status indicator after each input change; invalid input shows a single "Invalid UUID" label with no breakdown of the failure reason.
- **FR-008**: System MUST detect and display the UUID version (v1, v4, v7, and other versions by number) for valid inputs.
- **FR-009**: System MUST display the RFC 4122 variant for any valid UUID.
- **FR-010**: System MUST display the 5 standard UUID fields as a color-coded visual breakdown for any valid UUID.
- **FR-011**: System MUST extract and display the embedded timestamp as both relative time and ISO-8601 date-time for v1 and v7 UUIDs.
- **FR-012**: System MUST display the sequential counter value for v7 UUIDs.
- **FR-013**: System MUST display the node field value for v1 UUIDs.
- **FR-014**: System MUST hide the timestamp and node sections when the UUID version does not encode those fields (e.g., v4).

### Key Entities

- **UUID Input**: A raw string entered by the user; normalized by trimming whitespace and stripping surrounding braces before evaluation.
- **Validation Result**: The outcome of checking a UUID string; includes validity status, detected version, and variant.
- **UUID Component**: One of the five standard UUID fields (time-low, time-mid, time-high-and-version, clock-seq-and-reserved, node); displayed with a distinct color and its hex value.
- **Decoded Timestamp**: The wall-clock time embedded in a v1 or v7 UUID; expressed as a relative duration (e.g., "2 minutes ago") and as an absolute ISO-8601 date-time in the user's local time zone.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can paste any UUID and see a complete validation result within 1 second of input.
- **SC-002**: 100% of valid RFC 4122 v1, v4, and v7 UUIDs are correctly classified and decoded.
- **SC-003**: Users can switch between the generator and validator without losing their work in either panel, completing the action in a single click.
- **SC-004**: The relative timestamp for v1 and v7 UUIDs is accurate to within 1 second of the actual embedded time.
- **SC-005**: The validator screen is fully usable on both desktop and mobile viewport sizes, consistent with the generator screen. On narrow screens, the color-coded breakdown segments and decoded properties panel stack vertically; no information is hidden.

## Assumptions

- UUID validation and decoding is performed entirely in the browser; no network requests are made.
- Initial scope covers v1, v4, and v7 for full field decoding; versions v3, v5, v6, and v8 are identified by version number only, with no field-level decoding.
- Toolbar navigation does not change the browser URL; no client-side routing library is introduced.
- Timestamps are displayed using the user's browser local time zone.
- The validator screen uses the same design tokens, theme, and accent palette system as the existing generator screen.
- Copying the decoded result to the clipboard is out of scope for this initial implementation.
- There is no direct hand-off from the generator to the validator; users copy a UUID from the generator and paste it into the validator manually.
- No new keyboard shortcuts are introduced for the validator; the existing shortcut system remains unchanged.

## Clarifications

### Session 2026-05-13

- Q: Should the generator provide a direct hand-off to pre-fill the validator? → A: No; users copy the UUID manually and paste it into the validator.
- Q: Should keyboard shortcuts be added for the validator or tab navigation? → A: No new shortcuts; existing shortcut system remains unchanged.
- Q: How should the component breakdown adapt on mobile? → A: Stack segments and decoded properties vertically; no information hidden.
- Q: How descriptive should the invalid UUID error message be? → A: Single "Invalid UUID" label; no breakdown of why it failed.
