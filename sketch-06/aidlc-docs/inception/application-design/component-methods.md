# Component Methods

> Note: Method signatures define interfaces and intent. Detailed business logic and algorithms are specified in Functional Design (CONSTRUCTION phase).

---

## C-01: AppShell

| Method | Signature | Purpose |
|--------|-----------|---------|
| `init` | `init(): void` | Bootstrap the app: register SW, apply theme, render initial view |
| `switchTab` | `switchTab(tab: 'calculator' \| 'converter'): void` | Show the selected tab view, hide the other |
| `onThemeToggle` | `onThemeToggle(): void` | Delegate theme switch to ThemeManager |
| `render` | `render(): void` | Render the tab bar and active view container |

---

## C-02: CalculatorEngine

| Method | Signature | Purpose |
|--------|-----------|---------|
| `inputDigit` | `inputDigit(digit: string): void` | Append a digit to the current expression |
| `inputOperator` | `inputOperator(op: '+' \| '-' \| '*' \| '/'): void` | Append an operator; handle chained operator replacement |
| `inputDecimal` | `inputDecimal(): void` | Append decimal point if not already present in current operand |
| `inputPercent` | `inputPercent(): void` | Apply context-aware percentage logic to current value |
| `toggleSign` | `toggleSign(): void` | Negate the current operand |
| `backspace` | `backspace(): void` | Remove the last character from the expression |
| `clear` | `clear(): void` | Reset expression, result, and error state |
| `evaluate` | `evaluate(): void` | Parse and compute the expression; emit `calculation-complete` |
| `getDisplay` | `getDisplay(): { expression: string, result: string }` | Return current display state |
| `startLongPress` | `startLongPress(): void` | Start long-press timer on result area |
| `cancelLongPress` | `cancelLongPress(): void` | Cancel long-press timer |
| `copyResult` | `copyResult(): void` | Copy current result to clipboard via Clipboard API |
| `handleKeyboard` | `handleKeyboard(event: KeyboardEvent): void` | Map keyboard events to engine actions |

---

## C-03: UnitConverter

| Method | Signature | Purpose |
|--------|-----------|---------|
| `selectCategory` | `selectCategory(category: string): void` | Load units for the selected category into dropdowns |
| `selectSourceUnit` | `selectSourceUnit(unit: string): void` | Set source unit and trigger conversion |
| `selectTargetUnit` | `selectTargetUnit(unit: string): void` | Set target unit and trigger conversion |
| `inputValue` | `inputValue(value: string): void` | Accept numeric input and trigger live conversion |
| `convert` | `convert(): void` | Compute result using the registered formula; emit `conversion-complete` |
| `getCategories` | `getCategories(): string[]` | Return list of supported category names |
| `getUnitsForCategory` | `getUnitsForCategory(category: string): string[]` | Return unit list for a given category |
| `formatResult` | `formatResult(value: number): string` | Round to 6 decimal places and return as string |

---

## C-04: HistoryManager

| Method | Signature | Purpose |
|--------|-----------|---------|
| `addEntry` | `addEntry(entry: HistoryEntry): void` | Add a new entry; drop oldest if over 20-entry limit |
| `getEntries` | `getEntries(): HistoryEntry[]` | Return all current history entries |
| `clearHistory` | `clearHistory(): void` | Remove all entries from memory and localStorage |
| `onEntryTap` | `onEntryTap(entry: HistoryEntry): void` | Emit `history-reuse` event with entry result value |
| `loadFromStorage` | `loadFromStorage(): void` | Hydrate history from localStorage on startup |
| `saveToStorage` | `saveToStorage(): void` | Persist current history array to localStorage |
| `render` | `render(): void` | Re-render the history panel list |

**HistoryEntry type**:
```
{
  type: 'calculation' | 'conversion',
  label: string,   // e.g. "12 + 5 = 17" or "5 km → 3.106856 mi"
  result: string,  // numeric result as string
  timestamp: number
}
```

---

## C-05: ThemeManager

| Method | Signature | Purpose |
|--------|-----------|---------|
| `init` | `init(): void` | Detect OS preference, apply stored preference if exists |
| `toggle` | `toggle(): void` | Switch between light and dark; persist to localStorage |
| `apply` | `apply(theme: 'light' \| 'dark'): void` | Add/remove `theme-dark` class on document root |
| `getPreference` | `getPreference(): 'light' \| 'dark' \| null` | Read stored preference from localStorage |
| `savePreference` | `savePreference(theme: 'light' \| 'dark'): void` | Write preference to localStorage |

---

## C-06: PWAShell (Service Worker)

| Method / Event | Signature | Purpose |
|----------------|-----------|---------|
| `install` event | `self.addEventListener('install', handler)` | Cache all static assets |
| `activate` event | `self.addEventListener('activate', handler)` | Clean up old caches |
| `fetch` event | `self.addEventListener('fetch', handler)` | Serve from cache first; fall back to network |
