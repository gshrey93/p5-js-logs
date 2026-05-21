# Logical Components — Calculator PWA

## Overview

Since this is a purely client-side static application with no backend, "logical components" here refers to the browser-level infrastructure elements that support the NFRs.

---

## LC-01: Service Worker (Offline Cache Layer)

**Role**: Intercepts all network requests and serves from cache.

**Lifecycle**:
1. **Install**: Pre-cache all static assets into named cache
2. **Activate**: Delete any old versioned caches
3. **Fetch**: Cache-first strategy for all requests

**Cache Contents**:
- `/index.html`
- `/css/style.css`
- `/js/*.js` (all 8 module files)
- `/manifest.json`
- `/icons/icon-192.png`
- `/icons/icon-512.png`

**Update Strategy**: Bump cache version string in `service-worker.js`. New service worker installs alongside old one; takes over on next page load after old one is released.

---

## LC-02: Web App Manifest

**Role**: Declares the app's identity, icons, and display mode for installability.

**Key Fields**:
```json
{
  "name": "Calculator",
  "short_name": "Calc",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a90d9",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## LC-03: localStorage (Persistence Layer)

**Role**: Persists user preferences and history across sessions.

**Schema**:

| Key | Type | Max Size | Description |
|-----|------|----------|-------------|
| `calc_history` | JSON array | ~4 KB | Up to 20 HistoryEntry objects |
| `calc_theme` | string | 6 bytes | `"light"` or `"dark"` |

**Degradation**: If unavailable, app functions normally but without persistence.

---

## LC-04: Clipboard API

**Role**: Enables copy-to-clipboard for calculator results.

**Dependency**: Requires secure context (HTTPS) — satisfied by GitHub Pages.

**Feature Detection**: Check `navigator.clipboard?.writeText` before enabling the long-press affordance.

---

## LC-05: CSS Media Queries (Responsive Layer)

**Role**: Adapts layout to viewport size and user preferences.

**Queries Used**:
- `(min-width: 480px)` — tablet breakpoint
- `(min-width: 768px)` — desktop breakpoint
- `(prefers-color-scheme: dark)` — OS theme detection
- `(prefers-reduced-motion: reduce)` — motion preference

---

## LC-06: GitHub Pages (Hosting)

**Role**: Static file hosting with automatic HTTPS.

**Characteristics**:
- Serves files from repository root or `/docs` folder or `gh-pages` branch
- Automatic SSL certificate via Let's Encrypt
- CDN-backed (Fastly) for global distribution
- No server-side processing
- Custom domain optional (not required for v1)

---

## Component Interaction Map

```
Browser
  |
  ├── Service Worker (LC-01)
  |     └── Cache API → serves all assets offline
  |
  ├── Web App Manifest (LC-02)
  |     └── Enables install prompt + standalone mode
  |
  ├── localStorage (LC-03)
  |     ├── calc_history (read/write by HistoryManager)
  |     └── calc_theme (read/write by ThemeManager)
  |
  ├── Clipboard API (LC-04)
  |     └── writeText() called by CalculatorEngine on long-press copy
  |
  ├── CSS Media Queries (LC-05)
  |     └── Responsive layout + theme detection + motion preference
  |
  └── GitHub Pages (LC-06)
        └── Serves static files over HTTPS
```
