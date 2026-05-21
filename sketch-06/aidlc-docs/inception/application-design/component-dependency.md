# Component Dependencies

## Dependency Matrix

| Component | Depends On | Communication Pattern |
|-----------|------------|----------------------|
| AppShell | ThemeManager, HistoryManager, CalculatorEngine, UnitConverter, EventBus | Direct instantiation + EventBus |
| CalculatorEngine | EventBus, StorageService (none directly) | Emits events; receives keyboard/tap input |
| UnitConverter | ConversionFormulaRegistry, EventBus | Calls registry; emits events |
| HistoryManager | EventBus, StorageService | Subscribes to events; reads/writes storage |
| ThemeManager | StorageService | Reads/writes storage directly |
| PWAShell | None (browser APIs only) | Service worker lifecycle events |
| EventBus | None | Standalone singleton |
| StorageService | None | Standalone singleton |
| ConversionFormulaRegistry | None | Standalone singleton |

---

## Data Flow Diagram

```
User Input (tap / keyboard)
        |
        v
   AppShell
   |       |
   v       v
Calc    Converter
Engine  (UnitConverter)
   |       |
   | calc- | conv-
   | comp  | comp
   v       v
      EventBus
        |
        v
  HistoryManager
  (reads/writes localStorage via StorageService)
        |
        v (history-reuse event)
   CalculatorEngine
   (populates display with tapped result)
```

---

## Dependency Rules

1. **No circular dependencies** — components only depend on services and the EventBus, never on each other directly
2. **AppShell is the only orchestrator** — it instantiates all components and wires up the tab bar
3. **CalculatorEngine and UnitConverter are independent** — they do not reference each other
4. **HistoryManager is passive** — it only reacts to events; it never calls CalculatorEngine or UnitConverter directly
5. **Services are stateless singletons** — EventBus, StorageService, and ConversionFormulaRegistry hold no UI state

---

## File Structure (anticipated)

```
/ (workspace root)
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   └── style.css
├── js/
│   ├── app.js              (AppShell)
│   ├── calculator.js       (CalculatorEngine)
│   ├── converter.js        (UnitConverter)
│   ├── history.js          (HistoryManager)
│   ├── theme.js            (ThemeManager)
│   ├── event-bus.js        (EventBus)
│   ├── storage.js          (StorageService)
│   └── conversion-registry.js  (ConversionFormulaRegistry)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```
