# Copilot Instructions for DevToolkit

## Overview

DevToolkit is a fully offline desktop developer utility app built with Electron + React + TypeScript + Tailwind CSS v4. It provides standalone tool pages (UUID generator, JSON formatter, JSON compare, Base64 encoder/decoder, Markdown-to-PDF) accessible via a sidebar navigation. The app requires no network access — all functionality runs locally on the user's machine.

## Commands

- `npm run dev` — Start Vite dev server with Electron (hot reload)
- `npm run build` — TypeScript check → Vite build → electron-builder package
- `npm run lint` — ESLint with zero warnings policy (`--max-warnings 0`)

No test framework is configured.

## Architecture

**Two-process Electron app:**
- **Main process** (`electron/main.ts`) — Creates the BrowserWindow; loads the Vite dev server URL in dev or the built `dist/index.html` in production.
- **Preload** (`electron/preload.ts`) — Exposes a safe `ipcRenderer` subset via `contextBridge`. Extend IPC here when adding native capabilities.
- **Renderer** (`src/`) — React SPA using `HashRouter` (required for Electron's `file://` protocol).

**Routing:** Each tool is a page component in `src/pages/` with a route in `src/App.tsx`. The sidebar tool list in `src/components/layout/Sidebar.tsx` and the home page grid in `src/pages/HomePage.tsx` each maintain their own tool array — keep both in sync when adding tools.

**Theming:** Dark-first design. Theme state lives in `ThemeContext` (dark/light/system), persisted to localStorage under `devtoolkit-theme`. Design tokens are CSS custom properties defined in `src/index.css` using Tailwind v4's `@theme` directive, with a `.light` class override.

## Storage

The app uses SQLite for local persistent storage via the Electron main process. Never add cloud storage, remote APIs, or network-dependent features — this is a strictly offline application. All data must remain on the user's local filesystem.

## Conventions

- **Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`). Always use `@/` for imports within `src/`.
- **UI components** in `src/components/ui/` follow the shadcn/ui pattern: CVA for variants, `cn()` utility for class merging, `React.forwardRef` with explicit `displayName`.
- **Page components** are named exports (e.g., `export function UuidGeneratorPage()`) in `src/pages/`, one per file, named `<ToolName>Page.tsx`.
- **Layout components** live in `src/components/layout/`.
- **Icons** come from `lucide-react` — do not add other icon libraries.
- **Styling** uses Tailwind utility classes exclusively. Use semantic color tokens (`text-muted-foreground`, `bg-primary`, `border-border`, etc.) rather than raw color values to maintain theme consistency.
- **No dashes in component names** — use PascalCase for files and exports (e.g., `JsonFormatterPage.tsx`, not `json-formatter-page.tsx`).
- **About metadata** is read from `src/about.md` using Vite's `?raw` import.

## Adding a New Tool

1. Create `src/pages/<ToolName>Page.tsx` with a named export.
2. Add a route in `src/App.tsx`.
3. Add the tool entry to **both** the `tools` array in `src/components/layout/Sidebar.tsx` and `src/pages/HomePage.tsx`.
4. Pick an icon from `lucide-react`.
