import electronUpdater from 'electron-updater'
const { autoUpdater } = electronUpdater
type UpdateInfo = electronUpdater.UpdateInfo
import { BrowserWindow } from 'electron'
import log from 'electron-log'

autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000 // 4 hours
const INITIAL_CHECK_DELAY = 10 * 1000 // 10 seconds

function sendToRenderer(win: BrowserWindow, channel: string, ...args: unknown[]) {
  if (!win.isDestroyed()) {
    win.webContents.send(channel, ...args)
  }
}

export function initUpdater(win: BrowserWindow, isDev: boolean) {
  if (isDev) {
    log.info('Skipping auto-updater in dev mode')
    return
  }

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer(win, 'updater:checking')
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    sendToRenderer(win, 'updater:available', {
      version: info.version,
      releaseDate: info.releaseDate,
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendToRenderer(win, 'updater:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer(win, 'updater:download-progress', {
      percent: Math.round(progress.percent),
      transferred: progress.transferred,
      total: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    sendToRenderer(win, 'updater:downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
    })
  })

  autoUpdater.on('error', (error) => {
    log.error('Auto-updater error:', error)
    sendToRenderer(win, 'updater:error', error?.message ?? 'Unknown update error')
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Update check failed:', err)
    })
  }, INITIAL_CHECK_DELAY)

  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Periodic update check failed:', err)
    })
  }, UPDATE_CHECK_INTERVAL)
}

export function installUpdate() {
  autoUpdater.quitAndInstall(false, true)
}

export function checkForUpdates() {
  return autoUpdater.checkForUpdates()
}
