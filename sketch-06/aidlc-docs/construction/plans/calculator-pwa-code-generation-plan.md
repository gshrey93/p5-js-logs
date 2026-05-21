# Code Generation Plan — Calculator PWA

## Unit Context
- **Unit**: calculator-pwa (single unit, greenfield)
- **Technology**: Vanilla HTML5, CSS3, JavaScript (ES6 modules)
- **Deployment**: GitHub Pages (static files)
- **Workspace Root**: `.` (project root)

## File Structure Target
```
/ (workspace root)
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── event-bus.js
│   ├── storage.js
│   ├── theme.js
│   ├── calculator.js
│   ├── converter.js
│   ├── conversion-registry.js
│   └── history.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── tests/
    ├── calculator.test.html
    └── calculator.test.js
```

---

## Generation Steps

### Step 1: Project Foundation
- [x] Create `index.html` with semantic structure:
  - Tab bar (Calculator | Converter)
  - Calculator view (display + button grid)
  - Converter view (category selector + unit dropdowns + input/result)
  - History panel (shared, scrollable)
  - Theme toggle button
  - ARIA labels on all interactive elements
  - `<script type="module">` imports for JS modules
  - Link to manifest and service worker registration

### Step 2: Core Services — EventBus & StorageService
- [x] Create `js/event-bus.js` — pub/sub singleton
- [x] Create `js/storage.js` — localStorage abstraction with graceful degradation

### Step 3: ThemeManager
- [x] Create `js/theme.js` — OS preference detection, toggle, localStorage persistence

### Step 4: CalculatorEngine
- [x] Create `js/calculator.js` — full state machine implementation:
  - State management (CalculatorState entity)
  - Digit, operator, decimal, percent, sign toggle, backspace, clear, evaluate
  - Context-aware `%` (standalone + in-expression)
  - Safe expression evaluation (no eval)
  - 6 decimal place rounding with trailing zero strip
  - Error state handling with auto-clear
  - Long-press copy state machine (600ms timer, 3s auto-dismiss)
  - Keyboard event handler
  - EventBus integration (emits `calculation-complete`, listens `history-reuse`)

### Step 5: ConversionFormulaRegistry
- [x] Create `js/conversion-registry.js` — all conversion factors and formulas:
  - Length (8 units, SI base: metre)
  - Weight/Mass (6 units, SI base: kilogram)
  - Temperature (3 units, exact formulas via Celsius pivot)
  - Area (7 units, SI base: square metre)
  - Volume (6 units, SI base: litre)
  - Speed (4 units, SI base: m/s)

### Step 6: UnitConverter
- [x] Create `js/converter.js` — live conversion UI logic:
  - Category selection populates unit dropdowns
  - Live conversion on input/unit change
  - 6 decimal place cap
  - Negative value guard (only Temperature allows negatives)
  - EventBus integration (emits `conversion-complete`)

### Step 7: HistoryManager
- [x] Create `js/history.js` — shared history panel:
  - 20-entry cap with oldest-drop
  - localStorage persistence
  - Tap-to-reuse (emits `history-reuse`)
  - Clear history action
  - Render function for the scrollable list

### Step 8: AppShell (Main Entry Point)
- [x] Create `js/app.js` — bootstraps everything:
  - Instantiates all components
  - Wires tab switching
  - Registers service worker
  - Attaches keyboard listener
  - Initialises theme and history from storage

### Step 9: CSS Styling
- [x] Create `css/style.css`:
  - CSS custom properties for theming (light + dark)
  - Mobile-first responsive layout (base → 480px → 768px)
  - CSS Grid for button grid (4 columns)
  - Colour scheme: neutral base, soft blue accent, bright orange for `=` and `AC`
  - Touch targets min 48×48px
  - Focus indicators
  - `prefers-reduced-motion` respect
  - Tab bar styling
  - History panel styling
  - Converter view styling
  - Long-press copy overlay styling

### Step 10: PWA Assets
- [x] Create `manifest.json` with all required fields
- [x] Create `service-worker.js` with cache-first strategy
- [x] Create placeholder `icons/icon-192.svg` and `icons/icon-512.svg` (SVG calculator icon)

### Step 11: Unit Tests
- [x] Create `tests/calculator.test.js`:
  - Arithmetic operations (add, subtract, multiply, divide)
  - Decimal precision (6 places, trailing zero strip)
  - Context-aware `%` (standalone and in-expression)
  - Division by zero error
  - Operator chaining
  - Backspace and clear
  - Sign toggle
  - Conversion formulas (spot-check each category)
  - Temperature conversions (exact formula verification)
  - History entry management (add, cap at 20, clear)
- [x] Create `tests/calculator.test.html` — simple test runner page

### Step 12: Documentation Summary
- [x] Create `aidlc-docs/construction/calculator-pwa/code/code-summary.md`:
  - File inventory with descriptions
  - Module dependency graph
  - How to run locally
  - How to deploy to GitHub Pages

---

## Story Traceability

| Step | Requirements Covered |
|------|---------------------|
| 1 | FR-02, FR-03, FR-07, NFR-01, NFR-02, NFR-04 |
| 2 | (infrastructure — supports all) |
| 3 | NFR-03 |
| 4 | FR-01, FR-02, FR-04, FR-06 |
| 5 | FR-07 |
| 6 | FR-07 |
| 7 | FR-05 |
| 8 | (orchestration — supports all) |
| 9 | NFR-02, NFR-03, NFR-04 |
| 10 | NFR-01 |
| 11 | (quality assurance) |
| 12 | (documentation) |
