# Simple Drawing Canvas

A browser-based sketch pad that showcases HTML `<canvas>` drawing, multiple tools, undo/redo, and persistence. It is a lightweight playground for experimenting with pointer handling and Canvas API styling.

## Features
- **Freehand, line, and rectangle tools** with optional filled shapes and adjustable brush sizes.
- **Color system** containing preset swatches, a custom color picker, and brush opacity slider.
- **Canvas helpers** including fill canvas, clear, PNG export, and local persistence so the last drawing returns on refresh.
- **Undo/redo history** with dedicated buttons plus keyboard shortcuts (`Ctrl/Cmd+Z`, `Shift+Ctrl/Cmd+Z`, `C` for clear).
- **Touch support** so phones/tablets can sketch just like mouse users.

## Project Structure
```
.
├── index.html                 # Redirects to the drawing app for GitHub Pages
├── drawing-canvas/
│   ├── index.html             # Main app markup and control panel
│   ├── scripts/
│   │   └── app.js             # Canvas logic, state, history, persistence
│   └── styles/
│       └── style.css          # Visual design and responsive layout
└── README.md
```

## Getting Started Locally
1. Clone the repository and move into it.
2. Open `drawing-canvas/index.html` directly in a browser, **or** serve the repo root:
   ```sh
   # Using any static server
   npx serve .
   # or
   python3 -m http.server
   ```
3. Visit `http://localhost:8000/drawing-canvas/` (or the port your server prints) and start drawing.

## Keyboard Shortcuts
| Shortcut              | Action      |
|-----------------------|-------------|
| `Ctrl/Cmd + Z`        | Undo        |
| `Shift + Ctrl/Cmd + Z`| Redo        |
| `C`                   | Clear canvas|

## Deploying to GitHub Pages
1. Push the `main` branch (done if you're seeing this on GitHub) so the latest code is online.
2. In the GitHub repo (`abhilashrajjan-555/drawing-canvas`), open **Settings → Pages**.
3. Under **Build and deployment**, choose **Branch: `main`** and **Folder: `/ (root)`**, then save.
4. GitHub will publish the site at `https://abhilashrajjan-555.github.io/drawing-canvas/`. The root `index.html` automatically redirects to `/drawing-canvas/`, so visitors can use either the base URL or the deeper path directly.

Once Pages finishes building, share the published URL with anyone to try the drawing tool.
