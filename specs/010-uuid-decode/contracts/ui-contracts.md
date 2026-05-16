# UI Contracts: UUID Validator & Decoder

**Feature**: `010-uuid-decode` | **Date**: 2026-05-13

These contracts define the public prop surface for each new component and the return shape of each new hook. They are the boundary between implementation units and must be respected when changing any component's interface.

---

## Hooks

### `useActiveTab()`

```js
// Returns:
{
  activeTab: 'generator' | 'validator',
  setActiveTab: (tab: 'generator' | 'validator') => void,
}
```

**Invariants**:
- Default value is `'generator'`.
- Calling `setActiveTab` with the current tab is a no-op.

---

### `useUuidValidator()`

```js
// Returns:
{
  rawInput: string,
  setRawInput: (value: string) => void,
  result: ParsedUuid | null,
  // result is null only when rawInput is empty after normalization
}
```

**Invariants**:
- `result` is recomputed synchronously on every `setRawInput` call.
- `result.valid === false` when the normalized input does not match UUID format.
- `result.decoded` is `null` for any version other than 1 and 7.

---

## Components

### `<ToolbarNav>`

Renders two tab buttons inside `.topbar-nav`.

```jsx
<ToolbarNav
  activeTab={'generator' | 'validator'}  // required
  onTabChange={(tab) => void}            // required
/>
```

**Invariants**:
- The active tab button carries `aria-current="page"`.
- Clicking the already-active tab must not fire `onTabChange`.

---

### `<UuidInput>`

Controlled text input for UUID entry.

```jsx
<UuidInput
  value={string}           // required — rawInput from useUuidValidator
  onChange={(v) => void}   // required — calls setRawInput
  placeholder={string}     // optional — default: 'Paste or type a UUID…'
/>
```

**Invariants**:
- Renders a visible clear (×) button when `value` is non-empty.
- Clearing sets value to `''`.
- Input is `type="text"`, `spellCheck={false}`, `autoComplete="off"`.

---

### `<ValidationBadge>`

Displays the validation status chip.

```jsx
<ValidationBadge
  result={ParsedUuid | null}  // required
/>
```

**States**:
| `result` | Renders |
|---------|---------|
| `null` (empty input) | Nothing (hidden) |
| `result.valid === false` | "Invalid UUID" chip — error color |
| `result.valid === true` | "Valid — UUID v{N} ({label})" chip — accent color |

**Version labels** (for valid):
| Version | Label |
|---------|-------|
| 1 | time-based |
| 4 | random |
| 7 | time-ordered |
| other | — (no label) |

---

### `<UuidBreakdown>`

Color-coded 5-segment visualization.

```jsx
<UuidBreakdown
  fields={UuidFields | null}  // required — null hides the component
/>
```

**Invariants**:
- Renders nothing when `fields` is `null`.
- Each segment shows the hex substring and a field name label below it.
- On narrow viewports (≤920px), segments wrap or stack vertically — no horizontal overflow.

---

### `<DecodedFields>`

Decoded properties panel.

```jsx
<DecodedFields
  decoded={DecodedData | null}  // required
  variant={string | null}       // required — RFC 4122 variant string or null
/>
```

**Invariants**:
- Renders nothing when both `decoded` and `variant` are `null`.
- Timestamp row (`timestampRelative` + `timestampIso`) hidden when `decoded` is `null`.
- Sequence row hidden when `decoded.sequence` is `null`.
- Node row hidden when `decoded.node` is `null`.
- Variant row shown whenever `variant` is non-null (all valid UUIDs).

---

### `<ValidatorPanel>`

Validator screen root — composes all validator components.

```jsx
<ValidatorPanel />
// Self-contained: calls useUuidValidator() internally.
// No required props.
```

**Invariants**:
- Renders `<UuidInput>`, `<ValidationBadge>`, `<UuidBreakdown>`, `<DecodedFields>` in DOM order.
- On mobile (≤920px), `UuidBreakdown` and `DecodedFields` stack below the input/badge row.

---

## App.jsx Integration Contract

`App.jsx` is responsible for:
1. Calling `useActiveTab()` and passing `activeTab` / `onTabChange` to `<ToolbarNav>`.
2. Rendering `<ToolbarNav>` inside the existing `.topbar-nav` slot.
3. Rendering `<section className="bench">` (generator) when `activeTab === 'generator'`.
4. Rendering `<ValidatorPanel />` when `activeTab === 'validator'`.
5. Updating `brand-tag` text: `/ generator` or `/ validator` based on active tab.

Both panels remain mounted in the DOM (using CSS `display:none`) to preserve their state per FR-003 and clarification Q1. Implementation detail: use `hidden` attribute or a CSS visibility class — do not unmount.
