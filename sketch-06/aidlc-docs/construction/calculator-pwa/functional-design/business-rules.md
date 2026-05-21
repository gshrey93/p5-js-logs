# Business Rules — Calculator PWA

## BR-01: Decimal Precision

- All computed results (arithmetic and unit conversion) SHALL be rounded to a maximum of 6 decimal places using standard rounding (round half up).
- Trailing zeros after the decimal point SHALL be stripped (e.g. `3.500000` → `3.5`; `4.000000` → `4`).
- Integer results SHALL be displayed without a decimal point.

---

## BR-02: Digit Input Rules

- A new number entry begins with the first digit tapped.
- Leading zeros are not permitted except as `0` before a decimal point (e.g. `0.5` is valid; `007` is not — entering `7` after `0` replaces the `0`).
- A maximum of 12 significant digits may be entered per operand. Further digit input is ignored once the limit is reached.
- If `awaitingOperand` is true (just after `=` or an operator), the next digit starts a fresh operand and clears the previous display.

---

## BR-03: Operator Input Rules

- If an operator is entered when `currentOperand` is empty and `previousOperand` is not empty, the new operator replaces the pending operator (chained operator replacement).
- If an operator is entered after `=`, the result becomes `previousOperand` and the new operator is set (chained calculation).
- Entering an operator when both operands are empty has no effect.

---

## BR-04: Context-Aware Percentage (`%`)

**Standalone mode** (no pending operator):
- `%` divides `currentOperand` by 100.
- Example: `50 %` → `0.5`

**In-expression mode** (a pending operator exists):
- `%` computes `previousOperand × (currentOperand / 100)` and uses that as the effective second operand.
- Example: `200 + 15 %` → effective second operand = `200 × 0.15 = 30` → result = `230`
- Example: `200 - 15 %` → effective second operand = `200 × 0.15 = 30` → result = `170`
- This mirrors the behaviour of iOS/Android native calculators.

---

## BR-05: Sign Toggle (`+/-`)

- Negates `currentOperand` if it is non-zero and non-empty.
- Has no effect on `0` or an empty operand.
- Does not affect `previousOperand` or the pending operator.

---

## BR-06: Decimal Point Input

- A decimal point may only be added once per operand.
- If `currentOperand` already contains `.`, the input is ignored.
- If `currentOperand` is empty when `.` is pressed, it is treated as `0.` (prepend `0`).

---

## BR-07: Backspace

- Removes the last character from `currentOperand`.
- If `currentOperand` becomes empty after backspace, it is treated as `0`.
- Backspace has no effect when `isError` is true or when `awaitingOperand` is true after `=`.

---

## BR-08: Clear (AC)

- Resets all fields of `CalculatorState` to their initial values.
- Clears `expression`, `currentOperand`, `previousOperand`, `operator`, `result`, `errorMessage`, `isError`, `awaitingOperand`.
- Does NOT clear history.

---

## BR-09: Evaluate (`=`)

- Requires both `previousOperand` and `currentOperand` to be non-empty and a valid `operator` to be set.
- If `currentOperand` is empty when `=` is pressed, `currentOperand` is treated as `previousOperand` (repeat last operation).
- Computes the result and applies BR-01 (6 decimal places, strip trailing zeros).
- Sets `awaitingOperand = true` after evaluation.
- Emits `calculation-complete` with `{ expression: "12 + 5", result: "17" }`.
- If the result is `Infinity`, `-Infinity`, or `NaN`, triggers BR-10.

---

## BR-10: Error States

| Condition | Error Message |
|-----------|---------------|
| Division by zero | `"Cannot divide by zero"` |
| Result is `Infinity` or `-Infinity` | `"Result is too large"` |
| Result is `NaN` | `"Invalid operation"` |
| Expression is malformed | `"Invalid expression"` |

- On error: set `isError = true`, set `errorMessage`, clear `currentOperand` and `result`.
- On next digit input while `isError = true`: clear the error state and start fresh (auto-clear).
- Chained operations are blocked while `isError = true`.

---

## BR-11: Long-Press Copy

- A long-press is defined as a pointer/touch held on the result area for ≥ 600 ms.
- On long-press trigger: set `longPressActive = true` and render the clipboard icon overlay.
- On tap of the clipboard icon: copy `result` to the system clipboard via the Clipboard API (`navigator.clipboard.writeText`).
- On release before 600 ms: cancel the timer, `longPressActive` remains false.
- The clipboard icon dismisses automatically after 3 seconds or on any other user interaction.
- If `result` is empty or `isError` is true, long-press has no effect.

---

## BR-12: Keyboard Mapping

| Key | Action |
|-----|--------|
| `0`–`9` | `inputDigit` |
| `+` | `inputOperator('+')` |
| `-` | `inputOperator('-')` |
| `*` | `inputOperator('*')` |
| `/` | `inputOperator('/')` |
| `.` | `inputDecimal` |
| `%` | `inputPercent` |
| `Enter` or `=` | `evaluate` |
| `Backspace` | `backspace` |
| `Escape` or `c` / `C` | `clear` |

- Keyboard events are only active when the Calculator tab is visible.
- Default browser behaviour for these keys is prevented (`event.preventDefault()`).

---

## BR-13: History Entry Rules

- A new `HistoryEntry` is created on every `calculation-complete` or `conversion-complete` event.
- Entries are prepended (newest at top of the panel).
- When the entry count exceeds 20, the oldest entry (last in array) is removed.
- Tapping an entry sets `currentOperand` in `CalculatorEngine` to `entry.result` and switches to the Calculator tab if the Converter tab is active.
- "Clear History" removes all entries from memory and from `localStorage`.

---

## BR-14: Unit Conversion Rules

- Conversion is triggered on every change to `inputValue`, `sourceUnit`, or `targetUnit`.
- If `inputValue` is empty or non-numeric, `result` is set to empty string (no error shown).
- If `sourceUnit === targetUnit`, `result` equals `inputValue` (identity conversion).
- Temperature conversions use exact formulas:
  - °C → °F: `(value × 9/5) + 32`
  - °F → °C: `(value − 32) × 5/9`
  - °C → K: `value + 273.15`
  - K → °C: `value − 273.15`
  - °F → K: `(value − 32) × 5/9 + 273.15`
  - K → °F: `(value − 273.15) × 9/5 + 32`
- All other categories use SI base-unit pivot conversion:
  - Convert `fromUnit → SI base` then `SI base → toUnit` using stored factors.
- Negative values are permitted for Temperature; all other categories reject negative input (result shown as empty).

---

## BR-15: Theme Resolution Priority

1. Check `localStorage` key `calc_theme`.
2. If a stored value exists (`'light'` or `'dark'`), apply it — this overrides OS preference.
3. If no stored value, read `window.matchMedia('(prefers-color-scheme: dark)')`.
4. Apply `theme-dark` CSS class to `document.documentElement` for dark mode; remove it for light mode.
5. On toggle: flip the current theme, apply it, and write the new value to `localStorage`.
