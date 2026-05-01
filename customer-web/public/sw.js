/**
 * Parkent Express Service Worker
 * Ilovani offline ham ishlatish imkonini beradi
 */
const CACHE_NAME = 'parkent-express-v1';
const STATIC_ASSETS = [
  '/web/home',
  '/web/vendors',
  '/web/login',
];

// O'rnatish — asosiy sahifalarni cache'lash
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

// Faollashtirish — eski cache'larni tozalash
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, keyin cache
self.addEventListener('fetch', (event) => {
  // API so'rovlarini cache'lamaymiz
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Muvaffaqiyatli javobni cache'laymiz
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network yo'q bo'lsa cache'dan qaytaramiz
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Hech narsa topilmasa home'ga yo'naltirish
          if (event.request.mode === 'navigate') {
            return caches.match('/web/home');
          }
        });
      })
  );
});
