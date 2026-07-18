// Service Worker Walikhé — stratégie "réseau d'abord"
// Garantit que les utilisateurs ont toujours la dernière version en ligne,
// tout en gardant l'appli utilisable hors connexion grâce au cache.

const CACHE_NAME = 'walikhe-cache-v1';
const PRECACHE_URLS = [
  './client.html',
  './pro.html',
  './admin.html',
  './index.html',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(){ /* pas grave si un fichier manque */ });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  // Ne jamais mettre en cache les appels vers Firebase : toujours des données fraîches
  if (event.request.url.includes('firestore.googleapis.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
