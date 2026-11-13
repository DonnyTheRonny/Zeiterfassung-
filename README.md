# Petrus Zeiterfassung

Arbeitszeiten mit Mandant und Tätigkeit erfassen, auch mehrere gleichzeitig und mit Pause. Am Ende des Tages entsteht ein druckfertiger Excel-Nachweis (A4).

## Herunterladen

| Gerät | Datei | So geht's |
|---|---|---|
| **iPhone / iPad** | [App öffnen](https://donnytheronny.github.io/Zeiterfassung-/) | In **Safari** öffnen → Teilen-Symbol → **„Zum Home-Bildschirm“** |
| **Windows (Programm)** | [Petrus-Zeiterfassung.exe](https://github.com/DonnyTheRonny/Zeiterfassung-/raw/main/download/Petrus-Zeiterfassung.exe) | Herunterladen und doppelklicken. Beim ersten Start: „Weitere Informationen“ → „Trotzdem ausführen“ |
| **Windows / Mac (Browser)** | [Petrus-Zeiterfassung.html](https://github.com/DonnyTheRonny/Zeiterfassung-/raw/main/download/Petrus-Zeiterfassung.html) | Herunterladen, auf dem PC speichern und mit Chrome oder Edge öffnen |

Alle Versionen laufen ohne Konto und ohne Internet. Die Einträge bleiben auf dem jeweiligen Gerät.

## Inhalt dieses Projekts

- `index.html`, `manifest.webmanifest`, `sw.js`, `*.png`: die App für iPhone und iPad (über GitHub Pages)
- `download/`: Windows-Programm und Browser-Version zum Herunterladen
- `quellcode/`: Quelltext und Bau-Skripte

## Neu bauen

```bash
cd quellcode
npm install
node build-html.js arbeitszeit.html ../download/Petrus-Zeiterfassung.html
node build-pwa.js ../download/Petrus-Zeiterfassung.html ..
python3 make-icons.py icon-quelle.png ..
npm run dist    # Windows-Programm mit App-Symbol, Ergebnis in dist/
```

Das App-Symbol stammt aus `quellcode/icon-quelle.png`. Für ein neues Symbol diese Datei ersetzen und die Schritte oben erneut ausführen.
