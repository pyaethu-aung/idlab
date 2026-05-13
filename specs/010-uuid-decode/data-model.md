# Data Model: UUID Validator & Decoder

**Feature**: `010-uuid-decode` | **Date**: 2026-05-13

All types are JavaScript objects (no DB schema). All state is ephemeral (in-memory).

---

## UuidInput (raw user entry)

Held in `useUuidValidator` as `rawInput: string`.

| Field | Type | Description |
|-------|------|-------------|
| rawInput | string | Exactly what the user typed/pasted; unmodified |

**Normalization** (applied before parsing, not stored):
1. Trim leading/trailing whitespace
2. Strip surrounding `{` and `}` characters
3. Lowercase

---

## ParsedUuid (result of `parseUuid(normalizedInput)`)

Returned by `src/utils/uuidDecoder.js`. Held in `useUuidValidator` as `result`.

```js
{
  valid: boolean,          // false → only this field is meaningful
  raw: string,             // normalized input that was parsed

  // Present only when valid === true:
  version: number,         // 1–8, extracted from nibble at hex position 12
  variant: string,         // 'RFC 4122' | 'NCS' | 'Microsoft' | 'Reserved'
  fields: UuidFields,      // the 5 RFC 4122 component fields
  decoded: DecodedData | null,  // non-null only for v1 and v7
}
```

---

## UuidFields (component breakdown)

```js
{
  timeLow:              string,  // 8 hex chars  (positions 0–7)
  timeMid:              string,  // 4 hex chars  (positions 9–12)
  timeHighAndVersion:   string,  // 4 hex chars  (positions 13–16)
  clockSeqAndReserved:  string,  // 4 hex chars  (positions 17–20)
  node:                 string,  // 12 hex chars (positions 21–32)
}
```

All values are lowercase hex strings as they appear in the canonical UUID format. The hyphen separators in the source string are stripped before slicing; field boundaries are fixed by the RFC.

---

## DecodedData (time-based UUIDs only)

Present in `ParsedUuid.decoded` when `version === 1 || version === 7`.

```js
{
  // Common to v1 and v7:
  timestamp: Date,          // JavaScript Date object for the embedded time
  timestampIso: string,     // ISO-8601 string in local time zone
  timestampRelative: string,// human-readable, e.g. "2 minutes ago"

  // v7 only (null for v1):
  sequence: number | null,  // 12-bit integer from bits 64–75

  // v1 only (null for v7):
  node: string | null,      // 12-char hex (48-bit MAC/random node ID)
  clockSeq: number | null,  // 14-bit clock sequence integer
}
```

---

## ActiveTab (UI state)

Held in `useActiveTab` hook.

```js
activeTab: 'generator' | 'validator'
```

No persistence. Defaults to `'generator'` on load.

---

## Entity Relationships

```
useActiveTab
  └── activeTab ('generator' | 'validator')
        ↓ controls which panel is visible in App.jsx

useUuidValidator
  └── rawInput: string
        ↓ normalizeInput()
  └── normalizedInput: string
        ↓ parseUuid()
  └── result: ParsedUuid | null
        ├── fields: UuidFields        → UuidBreakdown component
        └── decoded: DecodedData      → DecodedFields component
```

---

## State Transitions

```
[empty]
  │  user types/pastes
  ▼
[input present]
  │  normalizeInput() + parseUuid()
  ├── valid=false  → ValidationBadge shows "Invalid UUID"
  │                   UuidBreakdown hidden
  │                   DecodedFields hidden
  └── valid=true   → ValidationBadge shows "Valid — UUID vN (label)"
                      UuidBreakdown shows 5 color-coded fields
                      DecodedFields shows variant + (timestamp/seq/node if applicable)

[user clears input]
  └── rawInput = ''  → all panels reset to empty state
```
