import { useState, useCallback, useEffect } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error'

export interface UpdateState {
  status: UpdateStatus
  version: string | null
  percent: number
  errorMessage: string | null
  dismissed: boolean
}

export function useAutoUpdater() {
  const [state, setState] = useState<UpdateState>({
    status: 'idle',
    version: null,
    percent: 0,
    errorMessage: null,
    dismissed: false,
  })

  const checkForUpdates = useCallback(async () => {
    setState(s => ({ ...s, status: 'checking', errorMessage: null }))
    try {
      const update = await check()
      if (!update) {
        setState(s => ({ ...s, status: 'idle' }))
        return
      }

      setState(s => ({
        ...s,
        status: 'downloading',
        version: update.version,
        percent: 0,
      }))

      let downloaded = 0
      let total = 0

      await update.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          total = event.data.contentLength
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength
          if (total > 0) {
            setState(s => ({
              ...s,
              percent: Math.round((downloaded / total) * 100),
            }))
          }
        } else if (event.event === 'Finished') {
          setState(s => ({ ...s, status: 'ready', percent: 100 }))
        }
      })
    } catch (err) {
      setState(s => ({
        ...s,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : String(err),
      }))
    }
  }, [])

  const installUpdate = useCallback(async () => {
    await relaunch()
  }, [])

  const dismiss = useCallback(() => {
    setState(s => ({ ...s, dismissed: true }))
  }, [])

  useEffect(() => {
    checkForUpdates()
  }, [checkForUpdates])

  return { ...state, installUpdate, dismiss, checkForUpdates }
}
