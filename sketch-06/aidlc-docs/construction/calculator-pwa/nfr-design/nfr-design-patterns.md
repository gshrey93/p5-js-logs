# NFR Design Patterns — Calculator PWA

## Pattern 1: Cache-First Service Worker

**NFR Addressed**: NFR-OFFLINE, NFR-PERF

**Pattern**: Cache-first with network fallback. All static assets are pre-cached on install. Every fetch request checks the cache first; only falls back to network if the asset is not cached.

**Implementation**:
```
install → cache.addAll(STATIC_ASSETS)
fetch   → cache.match(request) || fetch(request).then(cacheAndReturn)
activate → delete old caches
```

**Cache Versioning**: Cache name includes a version string (`calc-pwa-v1`). On app update, bump the version, which triggers a new install and old cache cleanup on activate.

---

## Pattern 2: CSS Custom Property Theming

**NFR Addressed**: NFR-RESPONSIVE, NFR-A11Y

**Pattern**: Define all colour values as CSS custom properties on `:root`. Override them under `.theme-dark`. Theme toggle simply adds/removes the class.

**Implementation**:
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent-blue: #4a90d9;
  --accent-orange: #ff6b35;
  --button-bg: #e8e8e8;
  --button-hover: #d4d4d4;
}

.theme-dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #f0f0f0;
  --text-secondary: #aaaaaa;
  --accent-blue: #6ab0ff;
  --accent-orange: #ff8c5a;
  --button-bg: #3a3a3a;
  --button-hover: #4a4a4a;
}
```

**Benefit**: Zero JavaScript needed for colour changes; CSS handles it via cascade. Instant theme switch with no repaint flicker.

---

## Pattern 3: Progressive Enhancement for Clipboard

**NFR Addressed**: NFR-COMPAT, NFR-SEC

**Pattern**: Feature-detect `navigator.clipboard` before enabling long-press copy. If unavailable (older browsers, insecure context), the copy affordance is simply not shown.

**Implementation**:
```javascript
const clipboardSupported = !!(navigator.clipboard && navigator.clipboard.writeText);
// Only attach long-press listeners if supported
```

**Fallback**: No fallback needed — copy is a convenience feature, not core functionality.

---

## Pattern 4: Safe Expression Evaluation (No eval)

**NFR Addressed**: NFR-SEC

**Pattern**: Custom expression parser that only handles known operators and numeric operands. Never uses `eval()` or `Function()` constructor.

**Implementation**: The CalculatorEngine maintains `previousOperand`, `operator`, and `currentOperand` as separate state fields. Evaluation is a simple switch on the operator with two numeric operands. No string-to-code execution path exists.

**Benefit**: Eliminates any code injection risk. Expression is never a free-form string that gets executed.

---

## Pattern 5: Graceful Storage Degradation

**NFR Addressed**: NFR-STORAGE

**Pattern**: Wrap all `localStorage` operations in try/catch. If storage is unavailable (private browsing, quota exceeded), the app continues to function without persistence.

**Implementation**:
```javascript
StorageService.set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Silently fail — app works without persistence
    console.warn('Storage unavailable:', e.message);
  }
};
```

**Benefit**: App never crashes due to storage issues. History and theme simply reset on reload in degraded mode.

---

## Pattern 6: Mobile-First Responsive Layout

**NFR Addressed**: NFR-RESPONSIVE

**Pattern**: Base styles target mobile (< 480px). Media queries add enhancements for larger screens using `min-width` breakpoints.

**Breakpoints**:
- Base: full-width, large touch targets (48px min)
- `@media (min-width: 480px)`: centered card, moderate padding
- `@media (min-width: 768px)`: max-width 400px card, comfortable desktop spacing

**Grid Layout**: Button grid uses `grid-template-columns: repeat(4, 1fr)` with `gap` for spacing. Buttons scale with viewport via `clamp()` for font size.

---

## Pattern 7: ARIA Live Region for Results

**NFR Addressed**: NFR-A11Y

**Pattern**: The result display area is marked with `aria-live="polite"` so screen readers announce result changes without interrupting the user.

**Implementation**:
```html
<div class="calc__result" aria-live="polite" aria-atomic="true">
  <!-- Result value updates here -->
</div>
```

**Additional**: Each button has an explicit `aria-label` (e.g. `aria-label="multiply"` for the `×` button). The history panel uses `role="list"` with `role="listitem"` for entries.

---

## Pattern 8: Reduced Motion Respect

**NFR Addressed**: NFR-A11Y

**Pattern**: All CSS transitions are wrapped in a `prefers-reduced-motion` check. Users who prefer reduced motion get instant state changes with no animation.

**Implementation**:
```css
@media (prefers-reduced-motion: no-preference) {
  .calc__button {
    transition: background-color 0.15s ease, transform 0.1s ease;
  }
}
```
