# Application Components

## Component Overview

The Calculator PWA is structured as a single-page application with five primary components and a shared PWA shell.

---

## C-01: AppShell

**Purpose**: Top-level container that bootstraps the app, manages routing between tabs, and owns global state (theme, active tab).

**Responsibilities**:
- Register the service worker on first load
- Read and apply the saved theme preference from localStorage on startup
- Render the tab bar (Calculator | Converter)
- Switch the active view when the user taps a tab
- Provide the theme toggle control
- Expose a global event bus for cross-component communication

**Interfaces**:
- Initialises `ThemeManager`, `HistoryManager`, `CalculatorEngine`, `UnitConverter`
- Listens for tab-switch events and re-renders the active view
- Listens for theme-toggle events and delegates to `ThemeManager`

---

## C-02: CalculatorEngine

**Purpose**: Encapsulates all arithmetic logic and manages the calculator's input/display state.

**Responsibilities**:
- Accept digit, operator, decimal, and control inputs (clear, backspace, equals, +/-, %)
- Maintain the current expression string and the current result
- Implement context-aware `%` behaviour (standalone vs in-expression)
- Evaluate expressions and produce results rounded to max 6 decimal places
- Detect and surface error states (divide by zero, invalid expression)
- Emit a `calculation-complete` event with the expression and result for history recording
- Manage the long-press timer on the result display to reveal the copy-to-clipboard affordance

**Interfaces**:
- Input: user button taps and keyboard events (via AppShell)
- Output: updated display string, result value, error message, `calculation-complete` event

---

## C-03: UnitConverter

**Purpose**: Provides live unit conversion across six categories with instant result updates.

**Responsibilities**:
- Render the category selector (Length, Weight, Temperature, Area, Volume, Speed)
- Render source-unit and target-unit dropdowns populated by the selected category
- Accept numeric input and compute the converted result on every input change
- Apply the 6 decimal place cap to conversion results
- Emit a `conversion-complete` event with the conversion entry for history recording

**Interfaces**:
- Input: category selection, unit selections, numeric value input
- Output: converted result display, `conversion-complete` event

---

## C-04: HistoryManager

**Purpose**: Manages the shared history panel for both calculator results and unit conversion entries.

**Responsibilities**:
- Maintain an ordered list of up to 20 history entries in memory and in localStorage
- Accept new entries from `CalculatorEngine` (`calculation-complete`) and `UnitConverter` (`conversion-complete`)
- Drop the oldest entry when the 20-entry limit is exceeded
- Render the scrollable history panel
- Handle tap-on-entry to emit a `history-reuse` event with the result value
- Handle "Clear History" action to wipe both memory and localStorage

**Interfaces**:
- Listens for `calculation-complete` and `conversion-complete` events
- Emits `history-reuse` event (consumed by `CalculatorEngine` to populate the display)
- Reads/writes `localStorage` key `calc_history`

---

## C-05: ThemeManager

**Purpose**: Controls light/dark theme switching and persistence.

**Responsibilities**:
- Detect the user's OS colour scheme preference via `prefers-color-scheme` media query
- Apply the correct theme CSS class to the document root on startup
- Toggle between light and dark themes when the user activates the toggle control
- Persist the user's manual preference to localStorage key `calc_theme`
- Override OS preference with the stored manual preference if one exists

**Interfaces**:
- Reads/writes `localStorage` key `calc_theme`
- Applies/removes CSS class `theme-dark` on `document.documentElement`

---

## C-06: PWAShell (Service Worker + Manifest)

**Purpose**: Enables offline capability and installability.

**Responsibilities**:
- Cache all static assets (HTML, CSS, JS, icons, manifest) on first install
- Serve cached assets on subsequent loads (cache-first strategy)
- Provide `manifest.json` with app name, icons, theme colour, and `standalone` display mode
- Support "Add to Home Screen" prompt on mobile and desktop

**Interfaces**:
- Registered by `AppShell` via `navigator.serviceWorker.register()`
- No runtime JS interface — operates via browser service worker lifecycle events
