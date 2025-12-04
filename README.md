# Lightweight Kanban

Minimal, dependency-free Kanban board built with semantic HTML, vanilla CSS, and JavaScript modules. It ships with Backlog / In Progress / Done columns, drag-and-drop, card editing, and localStorage persistence so the board feels instant but keeps its state between visits.

## Features

- **Zero build tooling** – open `index.html` directly or host via any static server.
- **CRUD for cards** – add, edit, delete cards via a shared modal form.
- **Drag & drop** – reorder cards inside a column or move them across columns.
- **Theme toggle** – light/dark themes with preference saved per device.
- **State persistence** – board layout and theme stored in `localStorage`.

## Project Structure

```
index.html          # Single-page app shell
styles/style.css    # Layout, typography, themes, responsive tweaks
scripts/state.js    # BoardState class and default column definitions
scripts/dom.js      # Renders columns/cards and wires UI interactions
scripts/drag-manager.js  # Drag/drop helpers and drop index math
scripts/storage.js  # LocalStorage helpers for board + theme
scripts/main.js     # Entry point bootstrapping state + theme toggle
```

## Development

No tooling required:

1. Clone/download the repo.
2. Open `index.html` in your browser (double-click or use `python -m http.server` for HTTPS-like behavior).
3. Add a few cards, drag them around, and switch themes—state persists automatically.

To start fresh, clear the browser's `localStorage` key `kanban-board-state`.

## Deployment

Because everything is static, you can push the repo to GitHub and enable GitHub Pages, or drop the files on Netlify, Vercel, Cloudflare Pages, etc.

## License

[MIT](LICENSE)
