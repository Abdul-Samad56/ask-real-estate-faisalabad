/**
 * ASK REAL ESTATE — service worker (installable app + basic offline)
 */
const CACHE_NAME = 'ask-realestate-v9';

const CORE_ASSETS = [
    './',
    './index.html',
    './list-property.html',
    './search.html',
    './assets/logo.png',
    './assets/logo-header.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/apple-touch-icon.png',
    './css/style.css',
    './css/fonts.css',
    './css/realtors.css',
    './css/zameen.css',
    './js/core.js',
    './js/fr-layout.js',
    './js/zameen.js',
    './js/pwa.js',
    './js/home.js',
    './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => undefined))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;
    if (url.pathname.includes('dealer')) return;

    event.respondWith(
        fetch(event.request)
            .then((res) => {
                if (res.ok && url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|html)$/)) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
});
