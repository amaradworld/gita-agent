const CACHE_NAME = 'gita-gyan-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
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
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // API calls: network-first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && url.pathname.includes('/api/verses') || url.pathname.includes('/api/chapters')) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return res;
      });
    }).catch(() => {
      if (request.mode === 'navigate') return caches.match('/index.html');
    })
  );
});

// Listen for verse cache requests from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_VERSES') {
    const { verses } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      verses.forEach((v) => {
        const url = `/api/verses/${v.chapter}/${v.verse}`;
        cache.add(url).catch(() => {});
      });
    });
  }
});
