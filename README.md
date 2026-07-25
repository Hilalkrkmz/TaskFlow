# TaskFlow

A personal task management app built with React + Vite, running both in the browser and as a desktop app (via Electron). All data is stored locally in your browser/app — no account, no server, no tracking.

## Features

- **Task management** — add, edit, delete, and complete tasks with priority levels (High / Medium / Low)
- **Filtering & sorting** — filter by All / Active / Completed, sort by creation date or priority
- **Calendar** — a GitHub-style contribution heatmap showing how many tasks you completed each day, with a monthly view and per-day breakdown
- **Statistics** — completion rate, current streak, a 7-day bar chart of completed tasks, and a priority breakdown
- **Notes** — quick sticky-note style notes, separate from tasks
- **Focus timer** — a Pomodoro-style timer to help you concentrate while studying or working
- **Themes** — 9 built-in themes, each with its own color palette and several with unique animated backgrounds:
  - White (default, minimal)
  - Sakura (falling cherry blossom petals)
  - Dark
  - Ocean (drifting waves)
  - Forest (fireflies + swaying grass)
  - Space (twinkling stars + shooting stars)
  - Desert (drifting sand + dunes)
  - Aurora (drifting light ribbons + stars)
  - Mint (rising bubbles)
- **Settings** — export/import your tasks as JSON, or clear all data with one click
- **Persistent storage** — everything (tasks, notes, theme choice) is saved to `localStorage` and reloads automatically

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [lucide-react](https://lucide.dev/) for icons
- [Electron](https://www.electronjs.org/) + [electron-builder](https://www.electron.build/) for the desktop build

## Getting started

Install dependencies:

```bash
npm install
```

Run in the browser (dev mode):

```bash
npm run dev
```

Build a static production bundle:

```bash
npm run build
```

## Desktop app (Electron)

Run the app in an Electron window during development:

```bash
npm run electron:dev
```

Build a distributable desktop installer (`.exe` on Windows):

```bash
npm run electron:build
```

The installer will be created in the `release/` folder.

## Project structure

```
taskflow/
├── electron/
│   └── main.cjs          # Electron main process
├── src/
│   ├── components/       # Header, Sidebar, Dashboard, TaskForm, TaskItem,
│   │                     # TaskList, Calendar, Statistics, Notes, Settings,
│   │                     # Themes, ThemeDecoration
│   ├── App.jsx
│   ├── index.css         # theme variables (colors per theme)
│   └── TaskFlow.css      # layout + component styles
├── vite.config.js
└── package.json
```

## Author

Created by Hilal Korkmaz.
