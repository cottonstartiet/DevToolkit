import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initDatabase, getSetting, setSetting, getAllSettings, getFavourites, addFavourite, removeFavourite, closeDatabase } from './database'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Disable unnecessary Chromium features for faster startup
app.commandLine.appendSwitch('disable-features', 'TranslateUI,SpareRendererForSitePerProcess')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  const bgColor = nativeTheme.shouldUseDarkColors ? '#0a0a0a' : '#ffffff'
  win = new BrowserWindow({
    show: false,
    backgroundColor: bgColor,
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'DevToolkit',
    icon: path.join(process.env.VITE_PUBLIC, 'icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.once('ready-to-show', () => {
    win?.show()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  // Create window first so it can start loading HTML while DB initializes
  createWindow()

  initDatabase()

  ipcMain.handle('settings:get', (_event, key: string) => getSetting(key))
  ipcMain.handle('settings:set', (_event, key: string, value: string) => setSetting(key, value))
  ipcMain.handle('settings:getAll', () => getAllSettings())

  ipcMain.handle('favourites:getAll', () => getFavourites())
  ipcMain.handle('favourites:add', (_event, toolPath: string) => addFavourite(toolPath))
  ipcMain.handle('favourites:remove', (_event, toolPath: string) => removeFavourite(toolPath))

  ipcMain.handle('app:bootstrap', () => ({
    settings: getAllSettings(),
    favourites: getFavourites(),
  }))
})

app.on('will-quit', () => {
  closeDatabase()
})
