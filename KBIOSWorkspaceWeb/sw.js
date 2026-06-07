const CACHE_NAME = 'kbios-v1';
const ASSETS = ['./', './index.html', './KBIOSWorkspace.png', './manifest.json'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) => Promise.all(
        keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })
    )));
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;
            return fetch(e.request).then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((c) => c.put(e.request, resClone));
                return res;
            }).catch(() => new Response('Offline', { status: 503 }));
        })
    );
});