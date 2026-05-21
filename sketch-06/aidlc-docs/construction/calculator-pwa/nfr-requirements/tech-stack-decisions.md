# Tech Stack Decisions — Calculator PWA

## Core Technology

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Markup | HTML5 | Semantic elements, no templating engine needed |
| Styling | CSS3 (vanilla) | Custom properties for theming, Grid for layout, no preprocessor needed at this scale |
| Logic | Vanilla JavaScript (ES6+) | No framework overhead; app is simple enough; keeps bundle tiny |
| PWA | Service Worker API + Web App Manifest | Native browser APIs, no library needed |
| Storage | localStorage | Synchronous, simple, sufficient for < 5 KB of data |
| Clipboard | Clipboard API (`navigator.clipboard`) | Modern async API, secure context required |

---

## Explicitly Rejected Alternatives

| Alternative | Reason for Rejection |
|-------------|---------------------|
| React / Vue / Svelte | Overkill for a calculator; adds 30–100 KB; no component reuse benefit at this scale |
| TypeScript | Adds build step; vanilla JS is sufficient for ~500 lines of logic |
| Sass / Less | CSS custom properties handle theming; no nesting depth warrants a preprocessor |
| IndexedDB | localStorage is simpler and sufficient for 20 JSON entries |
| Workbox (SW library) | Service worker logic is < 30 lines; library adds unnecessary weight |
| Webpack / Vite / Parcel | No build step needed; files are small and served directly |

---

## CSS Architecture

| Decision | Detail |
|----------|--------|
| Methodology | BEM-lite naming (`.calc__button`, `.calc__display`) |
| Theming | CSS custom properties on `:root` and `.theme-dark` |
| Layout | CSS Grid for button grid; Flexbox for tab bar and history panel |
| Responsive | Mobile-first with `min-width` media queries |
| Animations | Minimal transitions (opacity, background-color); respect `prefers-reduced-motion` |

---

## JavaScript Architecture

| Decision | Detail |
|----------|--------|
| Module pattern | ES6 modules (`import`/`export`) loaded via `<script type="module">` |
| No bundling | Browsers support ES modules natively; no build step |
| State management | Simple object state per component (no global store) |
| Event system | Custom EventBus (pub/sub) — ~20 lines of code |
| Error handling | Try/catch in evaluate(); error state in CalculatorState |
| Expression parsing | Custom parser (not `eval()`) — safe, predictable |

---

## Deployment

| Decision | Detail |
|----------|--------|
| Host | GitHub Pages |
| HTTPS | Provided by GitHub Pages automatically |
| CI/CD | None needed for v1 (manual push to `main` or `gh-pages` branch) |
| Domain | Default `username.github.io/repo-name` |
| Cache invalidation | Service worker version bump (`calc-pwa-v1` → `calc-pwa-v2`) on updates |

---

## Testing Strategy (for Build and Test phase)

| Type | Tool | Scope |
|------|------|-------|
| Unit tests | Vanilla JS test runner or simple assertions | Calculator logic, conversion formulas |
| Manual testing | Browser DevTools | PWA install, offline, responsive, accessibility |
| Lighthouse audit | Chrome DevTools | Performance, PWA, Accessibility, Best Practices scores |
| Cross-browser | BrowserStack or manual | Verify on Chrome, Firefox, Safari, Edge |
