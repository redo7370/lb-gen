# Icon Generator

Dieses Tool konvertiert HTML-Dateien in PNG-Bilder.

## Struktur

```
icon-gen/
├── convert.js       # Konvertierungs-Script
├── html/           # Eingabe: HTML-Dateien hier platzieren
└── png/            # Ausgabe: Generierte PNGs (automatisch erstellt)
```

## Installation

Puppeteer muss installiert sein:

```bash
npm install puppeteer
```

## Verwendung

1. HTML-Dateien in `./html/` Ordner platzieren
2. Script ausführen:

```bash
node icon-gen/convert.js
```

3. PNG-Dateien werden in `./png/` Ordner gespeichert

## Features

- ✅ Automatische Dimensionserkennung aus HTML
- ✅ Transparenter Hintergrund
- ✅ High-DPI Rendering (2x deviceScaleFactor)
- ✅ Behält Dateinamen bei (nur Endung .html → .png)
- ✅ Batch-Verarbeitung aller HTML-Dateien

## Beispiel

```bash
# Vor der Konvertierung
html/
  ├── icon-home.html
  └── icon-settings.html

# Nach der Konvertierung
png/
  ├── icon-home.png
  └── icon-settings.png
```

## Hinweis

Die Ordner `html/` und `png/` sind in `.gitignore` eingetragen und werden nicht versioniert.
