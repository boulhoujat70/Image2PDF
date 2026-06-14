const CACHE_NAME = 'docscanner-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://docs.opencv.org/4.x/opencv.js'
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Création du cache et sauvegarde des fichiers essentiels.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Nettoyage des anciens caches si une mise à jour a lieu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie "Cache First" avec secours sur le réseau pour une vitesse maximale
self.addEventListener('fetch', (event) => {
  // On ne gère pas les requêtes tierces autres que HTTP/HTTPS (ex: extensions chrome)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Optionnel : tu peux retourner une page d'erreur ici si le réseau échoue
      });
    })
  );
});
