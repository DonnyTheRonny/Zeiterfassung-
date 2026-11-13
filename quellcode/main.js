const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

// Datenordner vom alten Namen „Stempelkarte“ weiterverwenden, damit bisherige Einträge erhalten bleiben
app.setPath("userData", path.join(app.getPath("appData"), "Stempelkarte"));

// Nur eine Instanz, damit Timer nicht doppelt laufen
if (!app.requestSingleInstanceLock()) app.quit();

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 1000,
    minWidth: 420,
    minHeight: 500,
    title: "Petrus Zeiterfassung",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "app", "index.html"));

  // Externe Links im Standardbrowser öffnen
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });

  // Excel-Dateien: Speichern-Dialog, Vorschlag im Dokumente-Ordner
  win.webContents.session.on("will-download", (_e, item) => {
    item.setSaveDialogOptions({
      title: "Nachweis speichern",
      defaultPath: path.join(app.getPath("documents"), item.getFilename()),
      filters: [{ name: "Excel-Arbeitsmappe", extensions: ["xlsx"] }],
    });
  });
}

app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
