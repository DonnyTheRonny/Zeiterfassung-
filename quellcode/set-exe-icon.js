// Setzt das App-Symbol in die entpackte Windows-Programmdatei (ohne Wine, rein in JavaScript)
// Aufruf: node set-exe-icon.js <Programm.exe> <icon.ico>
const fs = require("fs");
const ResEdit = require("resedit");

const [exePath, icoPath] = process.argv.slice(2);
const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
const res = ResEdit.NtExecutableResource.from(exe);
const ico = ResEdit.Data.IconFile.from(fs.readFileSync(icoPath));

// Vorhandene Symbolgruppe ersetzen (Electron hat genau eine)
const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
const groupId = groups.length ? groups[0].id : 1;
const lang = groups.length ? groups[0].lang : 1033;
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, groupId, lang, ico.icons.map((i) => i.data));

// Programmbeschreibung, die Windows im Task-Manager anzeigt
const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
if (vi) {
  vi.setStringValues({ lang: 1033, codepage: 1200 }, { FileDescription: "Petrus Zeiterfassung", ProductName: "Petrus Zeiterfassung" });
  vi.outputToResourceEntries(res.entries);
}

res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
console.log("Symbol gesetzt:", exePath);
