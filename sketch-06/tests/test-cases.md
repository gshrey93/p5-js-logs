# Calculator PWA — Test Cases

> Designed for future test automation. Each test case has a unique ID, preconditions, steps, and expected result.

---

## TC-01: Core Arithmetic

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-01-01 | Addition of integers | `5 + 3 =` | `8` |
| TC-01-02 | Addition of decimals | `1.5 + 2.3 =` | `3.8` |
| TC-01-03 | Subtraction | `10 - 4 =` | `6` |
| TC-01-04 | Subtraction yielding negative | `3 - 7 =` | `-4` |
| TC-01-05 | Multiplication | `6 * 7 =` | `42` |
| TC-01-06 | Multiplication by zero | `5 * 0 =` | `0` |
| TC-01-07 | Division | `15 / 4 =` | `3.75` |
| TC-01-08 | Division yielding long decimal | `10 / 3 =` | `3.333333` |
| TC-01-09 | Large number addition | `999999 + 1 =` | `1000000` |
| TC-01-10 | Negative × Negative | `-3 * -4 =` (via +/- toggle) | `12` |

---

## TC-02: Decimal Precision (6 places max)

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-02-01 | Result rounds to 6 places | `1 / 7 =` | `0.142857` |
| TC-02-02 | Trailing zeros stripped | `1.5 + 1.5 =` | `3` (not `3.000000`) |
| TC-02-03 | Exactly 6 places preserved | `1 / 6 =` | `0.166667` |
| TC-02-04 | Floating point fix (0.1+0.2) | `0.1 + 0.2 =` | `0.3` (not `0.30000000000000004`) |
| TC-02-05 | Integer result no decimal | `4 + 4 =` | `8` (not `8.0`) |

---

## TC-03: Context-Aware Percentage

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-03-01 | Standalone % | Enter `50`, press `%` | Display: `0.5` |
| TC-03-02 | Standalone % on 100 | Enter `100`, press `%` | Display: `1` |
| TC-03-03 | In-expression % (addition) | `200 + 15 %` then `=` | `230` |
| TC-03-04 | In-expression % (subtraction) | `200 - 10 %` then `=` | `180` |
| TC-03-05 | In-expression % (multiply) | `50 * 20 %` then `=` | `500` (50 × 10) |
| TC-03-06 | % on zero | Enter `0`, press `%` | Display: `0` |

---

## TC-04: Sign Toggle (+/-)

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-04-01 | Toggle positive to negative | Enter `5`, press `+/-` | Display: `-5` |
| TC-04-02 | Toggle negative to positive | Enter `5`, press `+/-`, press `+/-` | Display: `5` |
| TC-04-03 | Toggle on zero | Enter `0`, press `+/-` | Display: `0` (no effect) |
| TC-04-04 | Toggle during expression | `3 +`, enter `7`, press `+/-`, `=` | `3 + (-7) = -4` |

---

## TC-05: Operator Chaining

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-05-01 | Replace operator | `5 +`, then press `-` | Pending operator becomes `-` |
| TC-05-02 | Chain from result | `5 + 3 =` (result 8), then `+ 2 =` | `10` |
| TC-05-03 | Repeat last operation | `5 + 3 =` (result 8), then `=` | `11` (8 + 3) |
| TC-05-04 | Intermediate evaluation | `5 + 3 *` | Evaluates `5+3=8`, then awaits second operand for `*` |

---

## TC-06: Error Handling

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-06-01 | Division by zero | `5 / 0 =` | Display: `Cannot divide by zero` |
| TC-06-02 | Auto-clear on digit after error | After TC-06-01, press `3` | Display: `3` (error cleared) |
| TC-06-03 | AC clears error | After TC-06-01, press `AC` | Display: `0` |
| TC-06-04 | Operator blocked during error | After TC-06-01, press `+` | No effect (still shows error) |
| TC-06-05 | Overflow detection | Very large multiplication | Display: `Result is too large` |

---

## TC-07: Input Controls

| ID | Description | Input | Expected Result |
|----|-------------|-------|-----------------|
| TC-07-01 | Backspace removes last digit | Enter `123`, press backspace | Display: `12` |
| TC-07-02 | Backspace to empty shows 0 | Enter `5`, press backspace | Display: `0` |
| TC-07-03 | AC resets everything | `5 + 3`, press AC | Display: `0`, expression empty |
| TC-07-04 | Decimal only once per operand | Enter `3.5`, press `.` again | No effect (still `3.5`) |
| TC-07-05 | Decimal on empty starts 0. | Press `.` on fresh state | Display: `0.` |
| TC-07-06 | Leading zero prevention | Enter `0`, then `7` | Display: `7` (not `07`) |
| TC-07-07 | Max 12 digits per operand | Enter 13 digits | Only first 12 accepted |

---

## TC-08: Keyboard Support

| ID | Description | Key Press | Expected Action |
|----|-------------|-----------|-----------------|
| TC-08-01 | Digit keys | `5` | inputDigit('5') |
| TC-08-02 | Operator keys | `+` | inputOperator('+') |
| TC-08-03 | Enter evaluates | `Enter` | evaluate() |
| TC-08-04 | Equals evaluates | `=` | evaluate() |
| TC-08-05 | Backspace | `Backspace` | backspace() |
| TC-08-06 | Escape clears | `Escape` | clear() |
| TC-08-07 | c/C clears | `c` | clear() |
| TC-08-08 | Decimal | `.` | inputDecimal() |
| TC-08-09 | Percent | `%` | inputPercent() |
| TC-08-10 | Keys inactive on Converter tab | Switch to Converter, press `5` | No calculator action |

---

## TC-09: Unit Conversion — Length

| ID | From | To | Input | Expected |
|----|------|-----|-------|----------|
| TC-09-01 | km | m | 1 | 1000 |
| TC-09-02 | mile | km | 1 | 1.609344 |
| TC-09-03 | inch | cm | 1 | 2.54 |
| TC-09-04 | foot | m | 1 | 0.3048 |
| TC-09-05 | yard | m | 1 | 0.9144 |
| TC-09-06 | mm | inch | 25.4 | 1 |
| TC-09-07 | Identity | km → km | 5 | 5 |

---

## TC-10: Unit Conversion — Weight/Mass

| ID | From | To | Input | Expected |
|----|------|-----|-------|----------|
| TC-10-01 | kg | g | 1 | 1000 |
| TC-10-02 | pound | kg | 1 | 0.453592 |
| TC-10-03 | tonne | kg | 1 | 1000 |
| TC-10-04 | ounce | g | 1 | 28.3495 |
| TC-10-05 | pound | ounce | 1 | 16 (approx) |

---

## TC-11: Unit Conversion — Temperature

| ID | From | To | Input | Expected |
|----|------|-----|-------|----------|
| TC-11-01 | °C | °F | 0 | 32 |
| TC-11-02 | °C | °F | 100 | 212 |
| TC-11-03 | °F | °C | 32 | 0 |
| TC-11-04 | °C | K | 0 | 273.15 |
| TC-11-05 | K | °C | 273.15 | 0 |
| TC-11-06 | °C | °F | -40 | -40 |
| TC-11-07 | °F | K | 212 | 373.15 |

---

## TC-12: Unit Conversion — Area

| ID | From | To | Input | Expected |
|----|------|-----|-------|----------|
| TC-12-01 | km² | m² | 1 | 1000000 |
| TC-12-02 | hectare | m² | 1 | 10000 |
| TC-12-03 | acre | hectare | 1 | 0.404686 |

---

## TC-13: Unit Conversion — Volume

| ID | From | To | Input | Expected |
|----|------|-----|-------|----------|
| TC-13-01 | litre | ml | 1 | 1000 |
| TC-13-02 | gallon | litre | 1 | 3.78541 |
| TC-13-03 | m³ | litre | 1 | 1000 |

---

## TC-14: Unit Conversion — Speed

| ID | From | To | Input | Expected |
|----|------|-----|-------|----------|
| TC-14-01 | m/s | km/h | 1 | 3.6 |
| TC-14-02 | mph | km/h | 60 | 96.5606 |
| TC-14-03 | knot | km/h | 1 | 1.852 |

---

## TC-15: Conversion Edge Cases

| ID | Description | Input | Expected |
|----|-------------|-------|----------|
| TC-15-01 | Negative value (non-Temperature) | Length: -5 km → m | No result (—) |
| TC-15-02 | Negative value (Temperature) | -40 °C → °F | -40 |
| TC-15-03 | Empty input | (blank) | No result (—) |
| TC-15-04 | Non-numeric input | "abc" | No result (—) |
| TC-15-05 | Zero conversion | 0 km → m | 0 |
| TC-15-06 | Precision cap | 1/3 km in miles | Max 6 decimal places |

---

## TC-16: History Panel

| ID | Description | Steps | Expected |
|----|-------------|-------|----------|
| TC-16-01 | Calculation added to history | Perform `5 + 3 =` | History shows `5 + 3 = 8` |
| TC-16-02 | Conversion added to history | Convert 5 km → miles | History shows `5 km → 3.106856 mile` |
| TC-16-03 | Max 20 entries | Perform 21 calculations | Only 20 entries visible; oldest dropped |
| TC-16-04 | Tap to reuse | Tap a history entry with result `17` | Calculator display shows `17` |
| TC-16-05 | Clear history | Press "Clear" button | History panel empty |
| TC-16-06 | Persistence across reload | Perform calc, reload page | History entries still present |
| TC-16-07 | Newest first | Perform A then B | B appears above A |

---

## TC-17: Theme

| ID | Description | Steps | Expected |
|----|-------------|-------|----------|
| TC-17-01 | OS preference applied | OS is dark mode, fresh load | Dark theme active |
| TC-17-02 | Manual toggle | Click theme toggle | Theme switches |
| TC-17-03 | Persistence | Toggle to dark, reload | Dark theme persists |
| TC-17-04 | Manual overrides OS | OS is light, user toggles to dark, reload | Dark theme (manual wins) |

---

## TC-18: PWA & Offline

| ID | Description | Steps | Expected |
|----|-------------|-------|----------|
| TC-18-01 | Service worker registers | Load page | SW registered (check DevTools) |
| TC-18-02 | Assets cached | Load page, check Cache Storage | All static assets cached |
| TC-18-03 | Offline functionality | Disconnect network, reload | App loads and functions |
| TC-18-04 | Installable | Check manifest in DevTools | Valid manifest, install prompt available |

---

## TC-19: Accessibility

| ID | Description | Steps | Expected |
|----|-------------|-------|----------|
| TC-19-01 | All buttons have aria-label | Inspect DOM | Every `<button>` has `aria-label` |
| TC-19-02 | Tab navigation | Press Tab repeatedly | Focus moves through all interactive elements |
| TC-19-03 | Focus visible | Tab to a button | Visible focus ring |
| TC-19-04 | Result announced | Perform calculation | Screen reader announces result (aria-live) |
| TC-19-05 | Colour contrast | Check with contrast tool | All text meets WCAG AA (4.5:1) |

---

## TC-20: Long-Press Copy

| ID | Description | Steps | Expected |
|----|-------------|-------|----------|
| TC-20-01 | Long press shows icon | Hold result area for 600ms+ | Clipboard icon appears |
| TC-20-02 | Short press no icon | Tap and release quickly (<600ms) | No icon shown |
| TC-20-03 | Tap icon copies | Long press, tap clipboard icon | Result copied to clipboard |
| TC-20-04 | Auto-dismiss after 3s | Long press, wait 3s | Icon disappears |
| TC-20-05 | No copy on error state | Trigger error, long press | No icon shown |
| TC-20-06 | No copy on empty | Fresh state (display "0"), long press | No icon shown |
