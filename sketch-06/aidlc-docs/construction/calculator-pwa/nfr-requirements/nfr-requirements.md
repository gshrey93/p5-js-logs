# NFR Requirements — Calculator PWA

## NFR-PERF: Performance

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint (FCP) | < 1.5s on 4G | Perceived instant load for a utility app |
| Time to Interactive (TTI) | < 2.0s on 4G | User can tap buttons within 2s |
| Total bundle size (all JS + CSS) | < 50 KB uncompressed | No frameworks; vanilla JS should be tiny |
| Input-to-display latency | < 16ms (single frame) | Button taps must feel instant |
| Conversion computation time | < 5ms | Simple arithmetic, no perceptible delay |

**Strategy**: No build step, no bundler, no minification required at this scale. Files are small enough to serve raw. Service worker caching eliminates network latency on repeat visits.

---

## NFR-OFFLINE: Offline Capability

| Requirement | Implementation |
|-------------|----------------|
| Full offline after first visit | Service worker caches all static assets on install |
| Caching strategy | Cache-first for all assets |
| Cache versioning | Named cache `calc-pwa-v1`; old caches deleted on activate |
| Offline fallback | If a request misses cache and network is down, serve `/index.html` |
| No network-dependent features | All logic is client-side; no API calls ever |

---

## NFR-INSTALL: Installability (PWA)

| Requirement | Implementation |
|-------------|----------------|
| Manifest | Valid `manifest.json` with `name`, `short_name`, `icons`, `start_url`, `display: standalone`, `theme_color`, `background_color` |
| Icons | 192×192 and 512×512 PNG icons |
| Service worker | Registered on page load |
| HTTPS | Required for service worker (GitHub Pages provides this) |
| Install prompt | Browser-native only (no custom prompt) |

---

## NFR-RESPONSIVE: Responsive Design

| Breakpoint | Layout |
|------------|--------|
| < 480px (mobile) | Full-width, single column, large touch targets (min 48×48px) |
| 480px–768px (tablet) | Centered card, slightly wider button grid |
| > 768px (desktop) | Centered card (max-width 400px), comfortable spacing |

**Strategy**: CSS Grid for button layout, CSS custom properties for spacing, `clamp()` for fluid typography. Mobile-first media queries.

---

## NFR-A11Y: Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA labels | Every button has `aria-label` describing its function |
| Keyboard navigation | Full tab order through all interactive elements |
| Focus indicators | Visible outline on focus (not suppressed) |
| Colour contrast | WCAG AA (4.5:1 for text, 3:1 for large text/UI components) |
| Screen reader | Live region (`aria-live="polite"`) for result announcements |
| Reduced motion | Respect `prefers-reduced-motion` — disable transitions |

---

## NFR-COMPAT: Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| iOS Safari | 15+ |
| Android Chrome | Last 2 versions |

**Strategy**: Use only ES6+ features supported across all targets. No polyfills needed. Service worker API is supported in all listed browsers.

---

## NFR-STORAGE: Data Persistence

| Concern | Decision |
|---------|----------|
| Storage mechanism | `localStorage` (synchronous, simple, no IndexedDB needed) |
| Data size | < 5 KB total (20 history entries + theme string) |
| Quota handling | Graceful degradation — if `localStorage` is full or unavailable, app works without persistence |
| Data format | JSON strings |
| Migration | No versioning needed for v1; future versions can check for schema changes |

---

## NFR-SEC: Security

| Concern | Decision |
|---------|----------|
| HTTPS | Enforced by GitHub Pages |
| Content Security Policy | Not required for v1 (no inline scripts, no external resources) |
| Input sanitisation | Calculator only accepts digits, operators, and decimal — no eval() of user strings |
| Clipboard API | Requires secure context (HTTPS) — satisfied by deployment target |
| No user data collection | No analytics, no cookies, no tracking |
