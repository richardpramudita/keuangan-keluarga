
const CACHE_NAME = "keuangan-keluarga-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instal dan simpan file utama aplikasi.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// Aktifkan cache terbaru.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// Tangani permintaan file dari aplikasi.
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan mengganggu Google API atau layanan eksternal.
  if (url.origin !== self.location.origin) return;

  if (request.method !== "GET") return;

  // Halaman utama: utamakan jaringan.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put("./index.html", copy);
          });
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // File lokal: gunakan cache jika tersedia.
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request);
    })
  );
});
