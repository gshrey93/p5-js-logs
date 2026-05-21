# Business Logic Model — Calculator PWA

## BL-01: Calculator Engine State Machine

The calculator operates as a finite state machine with the following states:

```
States:
  IDLE          - No input yet, display shows "0"
  ENTERING      - User is entering the first operand
  OPERATOR_SET  - An operator has been entered, awaiting second operand
  ENTERING_2    - User is entering the second operand
  RESULT        - Expression has been evaluated, result is displayed
  ERROR         - An error condition is active

Transitions:
  IDLE        --[digit]---------> ENTERING
  IDLE        --[decimal]-------> ENTERING (prepend "0.")
  ENTERING    --[digit]---------> ENTERING
  ENTERING    --[operator]------> OPERATOR_SET
  ENTERING    --[%]-------------> ENTERING (standalone %)
  ENTERING    --[+/-]-----------> ENTERING
  ENTERING    --[backspace]-----> ENTERING (or IDLE if empty)
  ENTERING    --[=]-------------> RESULT (no-op if no operator)
  OPERATOR_SET--[digit]---------> ENTERING_2
  OPERATOR_SET--[operator]------> OPERATOR_SET (replace operator)
  ENTERING_2  --[digit]---------> ENTERING_2
  ENTERING_2  --[%]-------------> ENTERING_2 (in-expression %)
  ENTERING_2  --[+/-]-----------> ENTERING_2
  ENTERING_2  --[=]-------------> RESULT
  ENTERING_2  --[operator]------> OPERATOR_SET (evaluate then chain)
  RESULT      --[digit]---------> ENTERING (fresh start)
  RESULT      --[operator]------> OPERATOR_SET (chain from result)
  RESULT      --[=]-------------> RESULT (repeat last operation)
  RESULT      --[%]-------------> ENTERING (standalone % on result)
  ANY         --[AC]-----------> IDLE
  ANY         --[error]---------> ERROR
  ERROR       --[digit]---------> ENTERING (auto-clear)
  ERROR       --[AC]-----------> IDLE
```

---

## BL-02: Expression Evaluation Algorithm

```
function evaluate(previousOperand, operator, currentOperand):
  a = parseFloat(previousOperand)
  b = parseFloat(currentOperand)

  if operator == '+': raw = a + b
  if operator == '-': raw = a - b
  if operator == '*': raw = a * b
  if operator == '/':
    if b == 0: throw DivisionByZeroError
    raw = a / b

  if raw is Infinity or -Infinity: throw OverflowError
  if raw is NaN: throw InvalidOperationError

  return roundTo6(raw)

function roundTo6(value):
  rounded = Math.round(value * 1_000_000) / 1_000_000
  return stripTrailingZeros(rounded.toString())

function stripTrailingZeros(str):
  if str contains '.':
    return str.replace(/\.?0+$/, '')
  return str
```

---

## BL-03: Context-Aware Percentage Algorithm

```
function inputPercent(state):
  if state.operator is null:
    // Standalone mode
    state.currentOperand = roundTo6(parseFloat(state.currentOperand) / 100)
  else:
    // In-expression mode
    base = parseFloat(state.previousOperand)
    pct  = parseFloat(state.currentOperand)
    state.currentOperand = roundTo6(base * (pct / 100))
```

---

## BL-04: Unit Conversion Algorithm

All non-temperature categories use a base-unit pivot approach:

```
// Each unit has a factor: 1 unit = factor × SI_base
// e.g. Length: 1 km = 1000 m (factor = 1000), 1 inch = 0.0254 m (factor = 0.0254)

function convert(value, fromUnit, toUnit, category):
  if fromUnit == toUnit: return value

  if category == 'Temperature':
    return convertTemperature(value, fromUnit, toUnit)

  fromFactor = FACTORS[category][fromUnit]   // units → SI base
  toFactor   = FACTORS[category][toUnit]     // units → SI base
  siValue    = value * fromFactor
  result     = siValue / toFactor
  return result
```

**Temperature conversion** (exact formulas, no pivot):
```
function convertTemperature(value, from, to):
  // Convert to Celsius first
  if from == 'F': celsius = (value - 32) * 5/9
  if from == 'K': celsius = value - 273.15
  if from == 'C': celsius = value

  // Convert from Celsius to target
  if to == 'F': return celsius * 9/5 + 32
  if to == 'K': return celsius + 273.15
  if to == 'C': return celsius
```

---

## BL-05: History Management Algorithm

```
function addEntry(entries, newEntry):
  entries.unshift(newEntry)          // prepend (newest first)
  if entries.length > 20:
    entries.pop()                    // drop oldest
  saveToStorage(entries)
  renderHistoryPanel(entries)

function onEntryTap(entry):
  EventBus.emit('history-reuse', { result: entry.result })
  if activeTab != 'calculator':
    AppShell.switchTab('calculator')
```

---

## BL-06: Long-Press Copy State Machine

```
States: IDLE, PRESSING, COPY_VISIBLE

Transitions:
  IDLE         --[pointerdown on result, result non-empty]--> PRESSING
  PRESSING     --[600ms timer fires]-------------------------> COPY_VISIBLE
  PRESSING     --[pointerup / pointermove / cancel]----------> IDLE (cancel timer)
  COPY_VISIBLE --[tap clipboard icon]-----------------------> IDLE (copy + dismiss)
  COPY_VISIBLE --[3s auto-dismiss timer]--------------------> IDLE
  COPY_VISIBLE --[any other interaction]--------------------> IDLE

Action on copy:
  navigator.clipboard.writeText(state.result)
  show brief "Copied!" toast for 1.5s
```

---

## BL-07: Service Worker Caching Strategy

```
Cache name: 'calc-pwa-v1'

On INSTALL:
  cache.addAll([
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/calculator.js',
    '/js/converter.js',
    '/js/history.js',
    '/js/theme.js',
    '/js/event-bus.js',
    '/js/storage.js',
    '/js/conversion-registry.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
  ])

On ACTIVATE:
  delete all caches not named 'calc-pwa-v1'

On FETCH:
  strategy: Cache First
  1. Check cache for request
  2. If found: return cached response
  3. If not found: fetch from network, cache the response, return it
  4. If network fails and not in cache: return offline fallback (index.html)
```

---

## BL-08: localStorage Schema

```json
// Key: calc_history
[
  {
    "id": "1716192000000",
    "type": "calculation",
    "label": "12 + 5 = 17",
    "result": "17",
    "timestamp": 1716192000000
  },
  {
    "id": "1716191900000",
    "type": "conversion",
    "label": "5 km → 3.106856 mi",
    "result": "3.106856",
    "timestamp": 1716191900000
  }
]

// Key: calc_theme
"dark"   // or "light"
```
