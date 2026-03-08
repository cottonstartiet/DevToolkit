/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  electronAPI: {
    settings: {
      get: (key: string) => Promise<string | null>
      set: (key: string, value: string) => Promise<void>
      getAll: () => Promise<Record<string, string>>
    }
    favourites: {
      getAll: () => Promise<string[]>
      add: (toolPath: string) => Promise<void>
      remove: (toolPath: string) => Promise<void>
    }
    bootstrap: () => Promise<{ settings: Record<string, string>; favourites: string[] }>
    updater: {
      onChecking: (callback: () => void) => () => void
      onAvailable: (callback: (_event: unknown, info: { version: string; releaseDate: string }) => void) => () => void
      onNotAvailable: (callback: () => void) => () => void
      onDownloadProgress: (callback: (_event: unknown, progress: { percent: number; transferred: number; total: number }) => void) => () => void
      onDownloaded: (callback: (_event: unknown, info: { version: string; releaseDate: string }) => void) => () => void
      onError: (callback: (_event: unknown, message: string) => void) => () => void
      install: () => void
      check: () => Promise<void>
    }
  }
}
