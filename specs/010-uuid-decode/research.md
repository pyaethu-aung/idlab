# Research: UUID Validator & Decoder

**Feature**: `010-uuid-decode` | **Date**: 2026-05-13

## Decision 1: UUID Parsing Library

**Decision**: No new library. Parse UUID fields with a regex + bit extraction in a new `src/utils/uuidDecoder.js` utility.

**Rationale**: The existing `uuid` npm package only generates UUIDs; it provides no decode API. Alternative libraries (`uuid-parse`, `uuidjs`) add dependency weight for functionality that is trivially implemented in ~80 lines of vanilla JS. The RFC 4122/9562 field layout is fixed and well-documented. A purpose-built local utility is easier to test, keeps the bundle lean, and fits the single-responsibility model in `src/utils/`.

**Alternatives considered**:
- `uuidjs` — provides parsing but adds ~9KB; rejected (overkill).
- `uuid-parse` — unmaintained; rejected.

---

## Decision 2: UUID Format Validation Strategy

**Decision**: Two-step validation — format check first, then version/variant extraction.

**Step 1 – Format**: Match against `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` after normalizing (trim whitespace, strip surrounding `{}`).

**Step 2 – Fields**: Extract version nibble (character at index 14 in the hyphen-free form, or position 14 in the standard `8-4-4-4-12` string), and variant from byte 8 (characters 19-20 in the hyphenated string).

**Rationale**: Splitting validation from field extraction keeps each function pure and individually testable. The regex is the standard format gate; the nibble check is a separate semantic layer.

---

## Decision 3: v7 Timestamp Extraction

**Decision**: Extract the top 48 bits of the UUID as a Unix millisecond timestamp.

**Algorithm**:
```
hex = uuid.replace(/-/g, '')          // 32 chars
ms  = parseInt(hex.slice(0, 12), 16)  // top 48 bits = Unix ms since epoch
seq = parseInt(hex.slice(13, 16), 16) // 12-bit sequence (after version nibble)
```

**Rationale**: RFC 9562 §5.7 defines UUIDv7 as: 48-bit Unix ts_ms | 4-bit version (0111) | 12-bit seq | 2-bit variant | 62-bit random. The top 48 bits are a plain `Date.now()` value, no epoch conversion needed.

---

## Decision 4: v1 Timestamp Extraction

**Decision**: Reassemble the 60-bit Gregorian epoch timestamp from the three UUID time fields and subtract the RFC 4122 Gregorian offset.

**Algorithm**:
```
// From hyphenated UUID: positions 0-7 = time_low, 9-12 = time_mid, 13-16 = time_high+version
timeLow  = parseInt(hex.slice(0, 8),  16)  // 32 bits
timeMid  = parseInt(hex.slice(8, 12), 16)  // 16 bits
timeHigh = parseInt(hex.slice(12, 16), 16) & 0x0fff  // 12 bits (mask off version nibble)

// Reassemble as 60-bit value (BigInt to avoid precision loss)
ticks = (BigInt(timeHigh) << 48n) | (BigInt(timeMid) << 32n) | BigInt(timeLow)

// Gregorian epoch offset: Oct 15, 1582 to Jan 1, 1970 = 122192928000000000 ticks (100ns units)
GREGORIAN_OFFSET = 122192928000000000n
unixMs = Number((ticks - GREGORIAN_OFFSET) / 10000n)  // convert 100ns → ms
```

**Rationale**: BigInt is required for 60-bit arithmetic without floating-point precision loss. The Gregorian offset is a fixed RFC 4122 constant. The result is a standard Unix millisecond timestamp usable with `new Date(unixMs)`.

---

## Decision 5: Relative Time Formatting

**Decision**: Implement a minimal `formatRelativeTime(date)` function using the `Intl.RelativeTimeFormat` API; no external library.

**Thresholds**:
| Range | Unit |
|-------|------|
| < 60s | seconds |
| < 60m | minutes |
| < 24h | hours |
| < 30d | days |
| else  | `date.toLocaleString()` (absolute) |

**Rationale**: `Intl.RelativeTimeFormat` has 97%+ browser support (all target browsers). No library dependency. Consistent with the constitution's "no unnecessary dependencies" stance.

---

## Decision 6: Segment Colors for UUID Breakdown

**Decision**: Assign each of the 5 UUID fields a distinct CSS custom property using existing design token accent values extended with muted tones from the ink ramp.

| Field | CSS class | Rationale |
|-------|-----------|-----------|
| time-low | `--seg-a: var(--accent)` | Accent = lime (default), most prominent |
| time-mid | `--seg-b: var(--ink-2)` | Slightly muted |
| time-high-and-version | `--seg-c: oklch(0.72 0.15 250)` | Cobalt-family muted |
| clock-seq | `--seg-d: oklch(0.72 0.15 65)` | Amber-family muted |
| node | `--seg-e: oklch(0.72 0.15 340)` | Magenta-family muted |

Colors are hardcoded as OKLCH values mirroring the token palette style; they are not theme-sensitive (segment visualization is decorative, not semantic).

---

## Decision 7: Tab State Management

**Decision**: A new `useActiveTab` hook holds a single string state: `'generator' | 'validator'`. No URL synchronization, no persistence to localStorage.

**Rationale**: Clarification Q1 confirmed no URL routing. Tab state resets on page reload; this is acceptable for a session tool. Keeping it out of localStorage avoids stale-state issues across visits.

---

## Decision 8: Hook Architecture for Validator

**Decision**: A dedicated `useUuidValidator` hook owns all validator state: raw input string, normalized value, and the decoded result object returned by `parseUuid()`.

**Rationale**: Mirrors `useUuidGenerator` in structure and responsibility. `App.jsx` remains a pure composition layer (constitution Principle V). The hook is independently testable.
