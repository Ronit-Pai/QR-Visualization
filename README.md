## Animated QR Code Generator

A small, self-contained web project to generate animated QR codes and an explainer page showing how QR codes work.

### Features
- **Animated QR generation** with multiple patterns (sequential, spiral, random, wave, corners)
- **Customizable** foreground/background colors, module size, rounded modules, speed
- **Error correction** level selection (L/M/Q/H)
- **Save as PNG**
- **Explainer page**: visual guide to QR structure, encoding, and error correction

### Getting Started
1. Download or clone the project.
2. Open `index.html` in your browser to use the generator.
No build step or server is required.

### Files
- `index.html` — main UI for the animated QR generator
- `qr.js` — logic for QR generation, animation, saving, and navigation to explainer
- `qr.css` — shared styles for both pages (dark theme)
- `how-qr-works.html` — explainer page with diagrams

### Dependencies
- Uses `qrcode-generator` via CDN in `index.html`.


### Notes
- Works offline after first load if the CDN script is cached. For completely offline use, you can download the QR library and reference it locally.




