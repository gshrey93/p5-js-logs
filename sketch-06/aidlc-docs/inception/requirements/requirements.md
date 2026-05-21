# Calculator PWA - Requirements Document

## Intent Analysis

- **User Request**: Build a basic calculator application for the internet as a PWA, usable on both mobile and desktop
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: Single Component (self-contained web app)
- **Complexity Estimate**: Moderate-High (PWA setup + responsive design + calculator logic + unit conversion)

---

## Functional Requirements

### FR-01: Core Arithmetic Operations
- The calculator SHALL support addition, subtraction, multiplication, and division
- The calculator SHALL support percentage (%) operation
- The calculator SHALL support sign toggle (+/-) to negate a number
- The calculator SHALL support decimal point input
- Decimal results SHALL be truncated/rounded to a maximum of 6 decimal places

### FR-02: Display
- The calculator SHALL show the current input/expression on a display area
- The calculator SHALL show the result after pressing equals (=)
- The calculator SHALL show the running expression (e.g. `12 + 5`) above the result
- The display SHALL include a direct `%` button that applies percentage to the current displayed value:
  - Standalone: pressing `%` on `50` yields `0.5`
  - In expression: `200 + 15%` computes as `200 + 30 = 230`
- Long-pressing the result area SHALL reveal a "Copy to Clipboard" icon; tapping it copies the result

### FR-03: Input Controls
- The calculator SHALL provide digit buttons (0–9)
- The calculator SHALL provide operator buttons (+, -, ×, ÷)
- The calculator SHALL provide a Clear (AC) button to reset all state
- The calculator SHALL provide a Backspace button to delete the last digit
- The calculator SHALL provide an Equals (=) button to evaluate the expression

### FR-04: Keyboard Support
- The calculator SHALL respond to keyboard input on desktop:
  - Number keys (0–9) for digit input
  - `+`, `-`, `*`, `/` for operators
  - `.` for decimal
  - `Enter` or `=` to evaluate
  - `Backspace` to delete last character
  - `Escape` or `c` to clear

### FR-05: Calculation History
- The calculator SHALL display a scrollable history panel shared between the calculator and unit converter
- History SHALL show expression and result (e.g. `12 + 5 = 17`) for calculations
- History SHALL show conversion entries (e.g. `5 km → 3.106856 mi`) for unit conversions
- History SHALL persist across page reloads using localStorage
- History SHALL retain a maximum of the last 20 entries; oldest entries are dropped when the limit is exceeded
- The user SHALL be able to clear the history manually
- Tapping a history entry SHALL re-populate the main display with that result value

### FR-06: Error Handling
- The calculator SHALL display a descriptive error message for invalid operations (e.g. "Cannot divide by zero")
- After an error, the display SHALL auto-clear on next digit input
- The calculator SHALL prevent chained operations on an error state

### FR-07: Unit Conversion
- The app SHALL include a Unit Converter accessible as a tab alongside the main calculator
- The tab bar SHALL appear at the top or bottom of the app, switching between Calculator and Converter views
- The converter SHALL support the following categories:
  - **Length**: mm, cm, m, km, inch, foot, yard, mile
  - **Weight/Mass**: mg, g, kg, tonne, ounce, pound
  - **Temperature**: Celsius, Fahrenheit, Kelvin
  - **Area**: cm², m², km², inch², foot², acre, hectare
  - **Volume**: ml, litre, cubic metre, fluid ounce, pint, gallon
  - **Speed**: m/s, km/h, mph, knot
- The user SHALL select a category, enter a value, select source unit and target unit, and see the converted result instantly (live on input change)
- Conversion results SHALL be capped at 6 decimal places
- Converter results SHALL be added to the shared history panel

---

## Non-Functional Requirements

### NFR-01: Progressive Web App (PWA)
- The app SHALL be installable via "Add to Home Screen" on mobile and desktop browsers
- The app SHALL work fully offline after the first load (service worker + cache)
- The app SHALL include a valid `manifest.json` with name, icons, theme color, and display mode
- The app SHALL register a service worker for asset caching
- The app SHALL be deployable to GitHub Pages as static files

### NFR-02: Responsive Design
- The app SHALL be mobile-first, adapting gracefully to desktop screen sizes
- On mobile: compact single-column layout optimized for thumb reach
- On desktop: centered card layout with wider button grid
- Minimum supported viewport: 320px wide

### NFR-03: Visual Design
- The app SHALL use a neutral base palette (whites, light greys, dark greys)
- Soft blue SHALL be used as the primary accent color (operators, active states)
- The `=` button and `AC` button SHALL use bright orange as their background color
- The app SHALL support both light and dark themes
- Theme SHALL default to the user's OS preference (`prefers-color-scheme`)
- A toggle button SHALL allow manual theme switching
- The app SHALL persist the user's theme preference in localStorage

### NFR-04: Accessibility
- All interactive elements SHALL have ARIA labels
- The app SHALL support full keyboard navigation
- Color contrast SHALL meet WCAG AA guidelines
- Focus indicators SHALL be visible on all interactive elements

### NFR-05: Performance
- The app SHALL load in under 2 seconds on a standard 4G connection
- All assets SHALL be cached by the service worker after first load
- No external runtime dependencies (vanilla JS only)

### NFR-06: Browser Compatibility
- The app SHALL support the latest two versions of Chrome, Firefox, Safari, and Edge
- The app SHALL function on iOS Safari and Android Chrome

---

## User Scenarios

### Scenario 1: Basic Calculation (Mobile)
User opens the installed PWA on their phone, taps digits and operators, taps = to see the result. The `=` button is visually prominent in orange.

### Scenario 2: Keyboard Power User (Desktop)
User opens the app in a browser tab, types an expression entirely via keyboard, presses Enter to evaluate.

### Scenario 3: Offline Use
User installed the PWA previously. They open it with no internet connection and it loads and functions normally.

### Scenario 4: Error Recovery
User taps `5 ÷ 0 =`. App shows "Cannot divide by zero". User taps a digit and the display clears, ready for new input.

### Scenario 5: History Reuse
User performs several calculations. They scroll the history panel, tap a previous result, and it populates the display for reuse.

### Scenario 6: Copy Result
User long-presses the result area. A clipboard icon appears. They tap it to copy the result to the clipboard.

### Scenario 7: Unit Conversion
User taps the Converter tab, selects "Length", enters `5`, selects km → miles, and instantly sees `3.106856`. The entry appears in the shared history panel.

---

## Technical Context

- **Technology**: Vanilla HTML5, CSS3, JavaScript (ES6+) — no frameworks
- **PWA Stack**: `manifest.json` + Service Worker (Cache API)
- **Storage**: `localStorage` for history and theme preference
- **Deployment**: GitHub Pages (static files, no build step required)

---

## Out of Scope (Assumptions)

- No scientific or programmer calculator modes (basic arithmetic only)
- No user accounts or cloud sync
- No backend or server-side logic
- No multi-language / i18n support (English only)
- No currency conversion (exchange rates require live data)
