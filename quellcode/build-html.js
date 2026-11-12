// Erzeugt app/index.html aus der Artifact-Seite für die Desktop-Version
const fs = require("fs");
const path = require("path");

const src = process.argv[2];
let html = fs.readFileSync(src, "utf8");

const replace = (from, to) => {
  if (!html.includes(from)) throw new Error("Nicht gefunden: " + from);
  html = html.replace(from, to);
};

// Bibliothek lokal statt vom CDN, keine Webfonts (offline-fähig)
replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>', '<script src="xlsx.full.min.js"></script>');
html = html.replace(/<link rel="preconnect"[^>]*>\n/, "").replace(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>\n/, "");
html = html.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "");

// Der Bereich „Offline-Version speichern“ gehört nur auf die Web-Seite
html = html.replace(/\n\s*<section class="sub" aria-label="Offline-Version"[\s\S]*?<\/section>/, "");
html = html.replace(/\n  \/\/ ---------- Offline-Version ----------[\s\S]*?\n  \}\);\n/, "\n");

replace('"Nur in diesem Browser gespeichert"', '"Lokal auf diesem PC gespeichert"');

// Download über den Speichern-Dialog von Electron
replace(
  'if (!dl) { msgEl.textContent = "Download ist in dieser Ansicht nicht verfügbar. Öffne die Seite auf claude.ai."; return; }',
  'if (!dl) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })); a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); return; }'
);

const out = '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>[hidden]{display:none!important} body{margin:0}</style>\n</head>\n<body>\n' + html + "\n</body>\n</html>\n";

// Einzeldatei für den Browser: Bibliothek eingebettet, Hinweis auf Browserspeicher
if (process.argv[3]) {
  const lib = fs.readFileSync(path.join(__dirname, "node_modules/xlsx/dist/xlsx.full.min.js"), "utf8");
  const single = out
    // Base64, weil die Bibliothek Steuerzeichen enthält; indirektes eval legt XLSX global an
    .replace('<script src="xlsx.full.min.js"></script>', () => '<script>(0, eval)(new TextDecoder().decode(Uint8Array.from(atob("' + Buffer.from(lib, "utf8").toString("base64") + '"), (c) => c.charCodeAt(0))));</script>')
    .replace('"Lokal auf diesem PC gespeichert"', '"Gespeichert in diesem Browser auf diesem PC"');
  fs.writeFileSync(process.argv[3], single);
  console.log(process.argv[3] + " geschrieben (" + Math.round(single.length / 1024) + " KB)");
}

fs.mkdirSync(path.join(__dirname, "app"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "app", "index.html"), out);
fs.copyFileSync(path.join(__dirname, "node_modules/xlsx/dist/xlsx.full.min.js"), path.join(__dirname, "app", "xlsx.full.min.js"));
console.log("app/index.html geschrieben");
