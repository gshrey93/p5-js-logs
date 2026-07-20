# Calculator and Unit Converter PWA

A clean, responsive, and fully functional Calculator and Unit Converter built as a Progressive Web App (PWA) using modern ES6 modules. Designed to be lightweight and fast, running natively in web browsers and fully optimized for desktop and mobile devices.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dual Functionality** | Seamlessly switch between a standard arithmetic calculator and a comprehensive unit converter. |
| **Percentage Calculations** | Supports additive (`200 + 15% = 230`) and multiplicative (`200 × 15% = 30`) percentage operations. |
| **Repeated Equals (`=`)** | Re-applies the last operator and operand sequentially (e.g., `5 + 3 = 8`, pressing `=` yields `11`, then `14`). |
| **Unit Converter** | Supports exact-ratio conversions for Length, Weight/Mass, Area, Volume, Speed, and Temperature (with Absolute Zero validation). |
| **History Manager** | Automatically tracks and saves calculation and conversion logs in LocalStorage. Tap or press `Enter` on any item to reuse the result. |
| **Theme Manager** | Includes a built-in Dark/Light mode toggle that respects system preferences and persists choice. |
| **Keyboard Support** | Supports physical keyboard inputs: digits (`0-9`), operators (`+`, `-`, `*`, `/`, `x`, `X`), decimal (`.`), percentage (`%`), evaluate (`Enter`, `=`), backspace (`Backspace`), and clear (`Escape`, `C`, `Delete`). |
| **Clipboard Integration** | Long-press or click the display to quickly copy calculation results to clipboard. |
| **PWA Ready** | Includes `manifest.json` and icon sets for mobile/desktop standalone installation. |

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Application structure, accessibility attributes (`aria-*`), and semantic elements. |
| **CSS3** | Responsive grid/flexbox layouts, CSS custom properties (variables) for live theming. |
| **JavaScript (ES6+)** | Decoupled ES modules, event bus architecture, calculation engine, and LocalStorage persistence. |
| **Jest & Babel** | Automated unit test suite with ES module transformation. |

---

## 📂 Project & Module Structure

```
sketch-06/
├── index.html                  # Main HTML structure & styling (loads type="module" src="sketch.js")
├── sketch.js                   # Main Orchestrator entrypoint
├── CHANGELOG.md                # Release version history
├── README.md                   # Project documentation
├── package.json & babel.config.js # Jest testing setup
├── sketch.test.js              # Automated Jest unit test suite
├── manifest.json               # Web App Manifest for PWA features
├── icons/                      # App icon assets
└── js/                         # ES6 Module Directory
    ├── event-bus.js            # Pub/Sub EventBus messaging
    ├── storage-service.js      # LocalStorage abstraction utility
    ├── utils.js                # Decimal rounding & zero-stripping (roundTo6)
    ├── theme-manager.js        # ThemeManager class (Dark/Light mode)
    ├── calculator-engine.js    # CalculatorEngine class (arithmetic state machine & keyboard listener)
    ├── conversion-registry.js  # Conversion factors (FACTORS) & temperature algorithms
    ├── unit-converter.js       # UnitConverter DOM controller
    └── history-manager.js      # HistoryManager log & LocalStorage persistence
```

### ⚙️ Core Modules Reference

| Module | Responsibility |
|---|---|
| **`js/event-bus.js`** | Decoupled event emitter (`on`, `off`, `emit`) for application-wide messaging. |
| **`js/storage-service.js`** | Safe `localStorage` getter/setter abstraction with error fallback. |
| **`js/utils.js`** | `roundTo6(value)` helper for 6-decimal precision rounding and stripping trailing zeros. |
| **`js/theme-manager.js`** | Toggles `.theme-dark` CSS class on `<html>` and saves preference. |
| **`js/calculator-engine.js`** | Manages operands, operator switching, percentage scaling, repeated equals, and keyboard events. |
| **`js/conversion-registry.js`** | Maintains conversion factors (`FACTORS`), `convertTemperature()`, and `convert()` dispatcher. |
| **`js/unit-converter.js`** | Population of unit select dropdowns and real-time conversion updates. |
| **`js/history-manager.js`** | Log management for calculation/conversion entries with click-to-reuse triggers. |

---

## 💻 Setup & Running Tests

### Running Locally
No build process is required for running the web app!
1. Clone or download the repository.
2. Open `index.html` directly in any modern web browser.

### Running Automated Unit Tests
1. Navigate to the `sketch-06/` directory:
   ```bash
   cd sketch-06
   ```
2. Install test dependencies:
   ```bash
   npm install
   ```
3. Run the Jest test suite:
   ```bash
   npm test
   ```

---

## 🤝 Extending the Application

To add a new unit conversion category (for example, *Time* or *Pressure*):
1. Open **[js/conversion-registry.js](file:///Users/shreyash/projects/Antigravity%20Repo/p5-js-logs/sketch-06/js/conversion-registry.js)**.
2. Add the new category and unit factors relative to a base unit in the `FACTORS` object.
3. Update `getCategories()` to include the new category name. The UI will automatically populate the dropdowns and handle conversions!
