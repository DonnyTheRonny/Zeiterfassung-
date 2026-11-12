// Baut aus der Offline-Einzeldatei die installierbare Web-App für iPhone/iPad (Ordner pwa/)
// Aufruf: node build-pwa.js <Offline-HTML> <Zielordner>
const fs = require("fs");
const path = require("path");

const [src, outDir] = process.argv.slice(2);
let html = fs.readFileSync(src, "utf8");
const replace = (from, to) => {
  if (!html.includes(from)) throw new Error("Nicht gefunden: " + from.slice(0, 80));
  html = html.replace(from, to);
};

const version = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);

// Kopf: App-Name, Symbole, Vollbild auf dem Home-Bildschirm
replace('<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
  '<meta name="mobile-web-app-capable" content="yes">\n' +
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n' +
  '<meta name="apple-mobile-web-app-title" content="Zeiterfassung">\n' +
  '<meta name="theme-color" content="#f3f5f8">\n' +
  '<link rel="manifest" href="manifest.webmanifest">\n' +
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n' +
  '<link rel="icon" type="image/png" href="icon-192.png">');

// Abstand zu Notch und Home-Leiste
replace("<style>[hidden]{display:none!important} body{margin:0}</style>",
  "<style>[hidden]{display:none!important} body{margin:0} :root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)} @media (max-width:560px){input{font-size:16px!important}}</style>");

replace('"Gespeichert in diesem Browser auf diesem PC"', '"Gespeichert auf diesem Gerät"');

// Excel-Nachweis: auf iPhone/iPad über das Teilen-Menü (Mail, In „Dateien“ sichern), sonst normaler Download
replace('if (!dl) { const a = document.createElement("a");',
  'if (!dl) { try { const file = new File([data], filename, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: filename }); return; } } catch (e) { if (e && e.name === "AbortError") return; } const a = document.createElement("a");');

// Offline-Betrieb über einen Service Worker
replace("</body>", '<script>if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});</script>\n</body>');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);

fs.writeFileSync(path.join(outDir, "manifest.webmanifest"), JSON.stringify({
  name: "Petrus Zeiterfassung",
  short_name: "Zeiterfassung",
  start_url: "./",
  scope: "./",
  display: "standalone",
  background_color: "#f3f5f8",
  theme_color: "#f3f5f8",
  lang: "de",
  icons: [
    { src: "icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2));

fs.writeFileSync(path.join(outDir, "sw.js"), `// Petrus Zeiterfassung – Offline-Speicher der App-Dateien (Version ${version})
const CACHE = "petrus-zeiterfassung-${version}";
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
`);

fs.writeFileSync(path.join(outDir, "ANLEITUNG.txt"), `Petrus Zeiterfassung für iPhone und iPad
=======================================

1. Diese Dateien bei GitHub in ein Projekt hochladen
   (Projekt öffnen → "Add file" → "Upload files" → alle Dateien hineinziehen → "Commit changes").
2. Im Projekt: "Settings" → "Pages" → bei "Branch" "main" und "/ (root)" wählen → "Save".
3. Nach 1–2 Minuten steht oben die Adresse, z. B. https://BENUTZERNAME.github.io/PROJEKTNAME/
4. Diese Adresse auf dem iPhone in Safari öffnen → Teilen-Symbol → "Zum Home-Bildschirm".

Die Einträge werden nur auf dem jeweiligen iPhone gespeichert.
Wird die App vom Home-Bildschirm gelöscht, sind auch die Einträge weg.
Stand: ${version}
`);
console.log("Web-App geschrieben nach", outDir, "Version", version);
