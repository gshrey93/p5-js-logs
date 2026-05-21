# Domain Entities — Calculator PWA

## E-01: CalculatorState

Represents the live state of the calculator engine at any point in time.

| Field | Type | Description |
|-------|------|-------------|
| `expression` | `string` | The full expression being built (e.g. `"12 + 5"`) |
| `currentOperand` | `string` | The operand currently being entered (e.g. `"5"`) |
| `previousOperand` | `string` | The operand before the last operator (e.g. `"12"`) |
| `operator` | `string \| null` | The pending operator (`+`, `-`, `*`, `/`) or null |
| `result` | `string` | The last computed result, or empty string |
| `errorMessage` | `string \| null` | Active error message, or null if no error |
| `isError` | `boolean` | True when the display is showing an error |
| `awaitingOperand` | `boolean` | True immediately after `=` or an operator — next digit starts fresh |
| `longPressActive` | `boolean` | True when the long-press copy affordance is visible |

---

## E-02: HistoryEntry

A single record in the shared history panel.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (timestamp-based) |
| `type` | `'calculation' \| 'conversion'` | Source of the entry |
| `label` | `string` | Human-readable string (e.g. `"12 + 5 = 17"` or `"5 km → 3.106856 mi"`) |
| `result` | `string` | Numeric result as string (used when tapping to reuse) |
| `timestamp` | `number` | Unix timestamp (ms) of when the entry was created |

---

## E-03: ConversionState

Represents the live state of the unit converter.

| Field | Type | Description |
|-------|------|-------------|
| `category` | `string` | Selected category (e.g. `"Length"`) |
| `sourceUnit` | `string` | Selected source unit (e.g. `"km"`) |
| `targetUnit` | `string` | Selected target unit (e.g. `"mile"`) |
| `inputValue` | `string` | Raw string input from the user |
| `result` | `string` | Converted result rounded to 6 decimal places, or empty |
| `isValid` | `boolean` | False if inputValue is empty, non-numeric, or negative where not allowed |

---

## E-04: ConversionFormula

Defines how to convert between two units within a category.

| Field | Type | Description |
|-------|------|-------------|
| `category` | `string` | Category name |
| `fromUnit` | `string` | Source unit identifier |
| `toUnit` | `string` | Target unit identifier |
| `convert` | `(value: number) => number` | Conversion function |

Temperature uses custom functions (non-linear). All other categories use multiplicative factors via a base unit (SI unit as pivot).

---

## E-05: ThemePreference

| Field | Type | Description |
|-------|------|-------------|
| `source` | `'os' \| 'manual'` | Whether the theme was set by OS or user |
| `value` | `'light' \| 'dark'` | The active theme |

---

## Entity Relationships

```
CalculatorState  --[emits on evaluate]--> HistoryEntry (type: calculation)
ConversionState  --[emits on convert]---> HistoryEntry (type: conversion)
HistoryEntry[]   --[stored in]----------> localStorage (key: calc_history, max 20)
HistoryEntry     --[tapped by user]------> CalculatorState.currentOperand (reuse)
ThemePreference  --[stored in]----------> localStorage (key: calc_theme)
ConversionFormula --[used by]-----------> ConversionState (via ConversionFormulaRegistry)
```
