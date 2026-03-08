import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('electronAPI', {
  settings: {
    get: (key: string): Promise<string | null> => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string): Promise<void> => ipcRenderer.invoke('settings:set', key, value),
    getAll: (): Promise<Record<string, string>> => ipcRenderer.invoke('settings:getAll'),
  },
  favourites: {
    getAll: (): Promise<string[]> => ipcRenderer.invoke('favourites:getAll'),
    add: (toolPath: string): Promise<void> => ipcRenderer.invoke('favourites:add', toolPath),
    remove: (toolPath: string): Promise<void> => ipcRenderer.invoke('favourites:remove', toolPath),
  },
  bootstrap: (): Promise<{ settings: Record<string, string>; favourites: string[] }> =>
    ipcRenderer.invoke('app:bootstrap'),
  updater: {
    onChecking: (callback: () => void) => {
      ipcRenderer.on('updater:checking', callback)
      return () => { ipcRenderer.removeListener('updater:checking', callback) }
    },
    onAvailable: (callback: (_event: unknown, info: { version: string; releaseDate: string }) => void) => {
      ipcRenderer.on('updater:available', callback)
      return () => { ipcRenderer.removeListener('updater:available', callback) }
    },
    onNotAvailable: (callback: () => void) => {
      ipcRenderer.on('updater:not-available', callback)
      return () => { ipcRenderer.removeListener('updater:not-available', callback) }
    },
    onDownloadProgress: (callback: (_event: unknown, progress: { percent: number; transferred: number; total: number }) => void) => {
      ipcRenderer.on('updater:download-progress', callback)
      return () => { ipcRenderer.removeListener('updater:download-progress', callback) }
    },
    onDownloaded: (callback: (_event: unknown, info: { version: string; releaseDate: string }) => void) => {
      ipcRenderer.on('updater:downloaded', callback)
      return () => { ipcRenderer.removeListener('updater:downloaded', callback) }
    },
    onError: (callback: (_event: unknown, message: string) => void) => {
      ipcRenderer.on('updater:error', callback)
      return () => { ipcRenderer.removeListener('updater:error', callback) }
    },
    install: () => ipcRenderer.send('updater:install'),
    check: (): Promise<void> => ipcRenderer.invoke('updater:check'),
  },
})
