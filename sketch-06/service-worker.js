/**
 * service-worker.js
 *
 * Advanced service worker for the Calculator PWA.
 *
 * Features:
 * - Stale-While-Revalidate for the main app shell (index.html) for fast loads with background updates.
 * - Cache-First for static assets (CSS, JS, icons) that are considered immutable.
 * - Automated cache management and cleanup of old caches.
 * - Immediate activation of new service workers.
 */

const APP_SHELL_CACHE_NAME = 'calc-pwa-app-shell-v1';
const STATIC_ASSETS_CACHE_NAME = 'calc-pwa-static-assets-v1';

// A list of all static assets that are part of the app shell.
const STATIC_ASSETS = [
    '/p5-js-logs/sketch-06/css/style.css',
    '/p5-js-logs/sketch-06/js/app.js',
    '/p5-js-logs/sketch-06/js/calculator-engine.js',
    '/p5-js-logs/sketch-06/js/conversion-registry.js',
    '/p5-js-logs/sketch-06/js/event-bus.js',
    '/p5-js-logs/sketch-06/js/history-manager.js',
    '/p5-js-logs/sketch-06/js/sketch.js',
    '/p5-js-logs/sketch-06/js/storage-service.js',
    '/p5-js-logs/sketch-06/js/theme-manager.js',
    '/p5-js-logs/sketch-06/js/unit-converter.js',
    '/p5-js-logs/sketch-06/js/utils.js',
    '/p5-js-logs/sketch-06/manifest.json',
    '/p5-js-logs/sketch-06/icons/icon-192.png',
    '/p5-js-logs/sketch-06/icons/icon-512.png',
];

// The main app shell file.
const APP_SHELL_FILE = '/p5-js-logs/sketch-06/index.html';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        Promise.all([
            // Pre-cache the static assets
            caches.open(STATIC_ASSETS_CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Pre-caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Pre-cache the main app shell
            caches.open(APP_SHELL_CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Pre-caching app shell');
                return cache.add(APP_SHELL_FILE);
            }),
        ])
    );
    self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches that are not the current ones
                    if (cacheName !== STATIC_ASSETS_CACHE_NAME && cacheName !== APP_SHELL_CACHE_NAME) {
                        console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Become the service worker for clients that are already open.
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Stale-While-Revalidate for the main app shell (index.html)
    if (url.pathname === APP_SHELL_FILE) {
        event.respondWith(
            caches.open(APP_SHELL_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                return cachedResponse || fetchedResponse;
            })
        );
    } else if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.substring(asset.lastIndexOf('/'))))) {
        // Cache-First for other static assets
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});