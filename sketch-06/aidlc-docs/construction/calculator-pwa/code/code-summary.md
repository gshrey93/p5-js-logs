# Code Summary — Calculator PWA

## File Inventory

| File | Purpose |
|------|---------|
| `index.html` | Main HTML with semantic structure, ARIA labels, tab bar, calculator grid, converter form, history panel |
| `css/style.css` | Full styling: CSS custom properties theming, responsive grid, BEM naming, accessibility |
| `js/app.js` | AppShell: bootstraps components, tab switching, keyboard listener, SW registration |
| `js/event-bus.js` | Lightweight pub/sub singleton |
| `js/storage.js` | localStorage abstraction with graceful degradation |
| `js/theme.js` | ThemeManager: OS detection, toggle, persistence |
| `js/calculator.js` | CalculatorEngine: state machine, safe evaluation, context-aware %, long-press copy |
| `js/converter.js` | UnitConverter: live conversion, category/unit selection, negative guard |
| `js/conversion-registry.js` | All conversion factors (SI pivot) + exact temperature formulas |
| `js/history.js` | HistoryManager: 20-entry cap, tap-to-reuse, localStorage persistence |
| `manifest.json` | PWA manifest: name, icons, display mode, theme colour |
| `service-worker.js` | Cache-first SW: pre-caches all assets, offline fallback |
| `icons/icon-192.svg` | App icon (192×192) |
| `icons/icon-512.svg` | App icon (512×512) |
| `tests/calculator.test.js` | Unit tests: conversion formulas, rounding, identity checks |
| `tests/calculator.test.html` | Browser-based test runner |

## Module Dependency Graph

```
app.js
├── theme.js → storage.js
├── calculator.js → event-bus.js
├── converter.js → event-bus.js, conversion-registry.js
└── history.js → event-bus.js, storage.js
```

## How to Run Locally

1. Serve the project root with any static server:
   ```bash
   npx serve .
   ```
   Or use Python:
   ```bash
   python -m http.server 8000
   ```
2. Open `http://localhost:8000` in a browser.
3. The service worker requires HTTPS for full PWA features (use localhost for development).

## How to Run Tests

1. Serve the project root (same as above).
2. Open `http://localhost:8000/tests/calculator.test.html` in a browser.
3. Results display in the page and in the browser console.

## How to Deploy to GitHub Pages

1. Push all files to the `main` branch (or a `gh-pages` branch).
2. In the repository Settings → Pages, set source to the branch root.
3. The app will be available at `https://<username>.github.io/<repo-name>/`.
4. HTTPS is automatic — service worker and Clipboard API will work.

## How to Update (Cache Busting)

1. Make code changes.
2. In `service-worker.js`, change `CACHE_NAME` from `'calc-pwa-v1'` to `'calc-pwa-v2'`.
3. Deploy. The new service worker will install and old cache will be deleted on activate.
