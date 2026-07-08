/* Mercer County Historical Society — service worker (offline-friendly, cache-first for the app shell) */
const CACHE = "mchs-v1";
const SHELL = [
  ".", "index.html", "museums.html", "research.html", "programs.html", "support.html", "contact.html",
  "css/styles.css", "js/site.js",
  "img/mc/railroad.jpg", "img/mc/bramwell.jpg", "img/mc/summer.webp", "img/mc/fall.webp", "img/mc/aerial.jpg",
  "manifest.json", "icons/icon-192.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
