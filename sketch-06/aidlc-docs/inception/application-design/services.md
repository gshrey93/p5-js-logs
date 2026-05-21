# Services

## Service Overview

The Calculator PWA uses a lightweight event-driven service pattern. There is no server-side layer — all services are client-side singletons coordinated by `AppShell`.

---

## S-01: EventBus

**Purpose**: Decoupled publish/subscribe communication between components.

**Responsibilities**:
- Allow components to emit named events with a payload
- Allow components to subscribe to named events
- Prevent direct component-to-component coupling

**Key Events**:

| Event Name | Emitter | Subscriber | Payload |
|------------|---------|------------|---------|
| `calculation-complete` | CalculatorEngine | HistoryManager | `{ expression, result }` |
| `conversion-complete` | UnitConverter | HistoryManager | `{ label, result }` |
| `history-reuse` | HistoryManager | CalculatorEngine | `{ result: string }` |
| `theme-toggle` | AppShell (toggle button) | ThemeManager | none |
| `tab-switch` | AppShell (tab bar) | AppShell | `{ tab: 'calculator' \| 'converter' }` |

**Interface**:
```
EventBus.emit(event: string, payload?: any): void
EventBus.on(event: string, handler: Function): void
EventBus.off(event: string, handler: Function): void
```

---

## S-02: StorageService

**Purpose**: Abstraction over `localStorage` to centralise read/write operations and key management.

**Responsibilities**:
- Provide typed get/set/remove operations over localStorage
- Define and own all localStorage key constants
- Handle JSON serialisation/deserialisation
- Gracefully handle storage quota errors

**Storage Keys**:

| Key | Owner | Value Type | Description |
|-----|-------|------------|-------------|
| `calc_history` | HistoryManager | `HistoryEntry[]` (JSON) | Last 20 history entries |
| `calc_theme` | ThemeManager | `'light' \| 'dark'` | User's manual theme preference |

**Interface**:
```
StorageService.get<T>(key: string): T | null
StorageService.set<T>(key: string, value: T): void
StorageService.remove(key: string): void
```

---

## S-03: ConversionFormulaRegistry

**Purpose**: Central registry of all unit conversion formulas, organised by category.

**Responsibilities**:
- Store conversion factors and formulas for all 6 categories
- Provide a `convert(value, fromUnit, toUnit, category)` method
- Handle non-linear conversions (e.g. Temperature: Celsius ↔ Fahrenheit ↔ Kelvin)
- Return results as numbers (rounding applied by UnitConverter)

**Interface**:
```
ConversionFormulaRegistry.convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string
): number

ConversionFormulaRegistry.getCategories(): string[]
ConversionFormulaRegistry.getUnits(category: string): string[]
```

**Supported Categories**: Length, Weight/Mass, Temperature, Area, Volume, Speed
