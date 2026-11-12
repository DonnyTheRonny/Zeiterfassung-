// Petrus Zeiterfassung – Offline-Speicher der App-Dateien (Version 202611121058)
const CACHE = "petrus-zeiterfassung-202611121058";
const FILES = ["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Zuerst aus dem Speicher (funktioniert offline), im Hintergrund nach einer neueren Version schauen
self.addEventListener("fetch", (ev) => {
  if (ev.request.method !== "GET" || new URL(ev.request.url).origin !== location.origin) return;
  ev.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(ev.request, { ignoreSearch: true });
    const fresh = fetch(ev.request).then((res) => { if (res.ok) cache.put(ev.request, res.clone()); return res; }).catch(() => cached);
    return cached || fresh;
  }));
});
