// 슛폼 라이브 service worker: app shell network-first, heavy assets cache-first (works offline at the court)
const VERSION = "shotlive-v7";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
const HEAVY = ["vendor/tf.min.js", "models/movenet-thunder.json", "models/movenet-thunder.bin",
  "models/movenet-lightning.json", "models/movenet-lightning.bin", "fonts/Galmuri11.woff2", "fonts/Galmuri11-Bold.woff2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll([...SHELL, ...HEAVY])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const heavy = HEAVY.some(p => url.pathname.endsWith(p));
  if (heavy) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return res; })));
  } else {
    e.respondWith(fetch(e.request).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
  }
});
