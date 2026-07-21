var CACHE_NAME = 'numplay-v10';
var urlsToCache = [
    '/',
    '/index.html',
    '/games/guessing.js',
    '/games/numberle.js',
    '/games/detective.js',
    '/games/mathsprint.js',
    '/games/memory.js',
    '/games/match.js',
    '/games/pairs.js',
    '/games/pattern.js',
    '/games/clear.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/sounds/correct.wav',
    '/sounds/wrong.wav',
    '/sounds/tick.wav',
    '/sounds/end.wav',
    '/sounds/click.wav',
    '/sounds/hit.wav',
    '/sounds/music.mp4'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(name) { return name !== CACHE_NAME; })
                     .map(function(name) { return caches.delete(name); })
            );
        })
    );
});