import { useState, useEffect, useCallback } from 'react'

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

  useEffect(() => {
    const api = window.electronAPI?.updater
    if (!api) return

    const unsubChecking = api.onChecking(() => {
      setState((prev) => ({ ...prev, status: 'checking', dismissed: false }))
    })

    const unsubAvailable = api.onAvailable((_event, info) => {
      setState((prev) => ({ ...prev, status: 'downloading', version: info.version, percent: 0 }))
    })

    const unsubNotAvailable = api.onNotAvailable(() => {
      setState((prev) => ({ ...prev, status: 'idle' }))
    })

    const unsubProgress = api.onDownloadProgress((_event, progress) => {
      setState((prev) => ({ ...prev, status: 'downloading', percent: progress.percent }))
    })

    const unsubDownloaded = api.onDownloaded((_event, info) => {
      setState((prev) => ({ ...prev, status: 'ready', version: info.version, percent: 100 }))
    })

    const unsubError = api.onError((_event, message) => {
      setState((prev) => ({ ...prev, status: 'error', errorMessage: message }))
    })

    return () => {
      unsubChecking()
      unsubAvailable()
      unsubNotAvailable()
      unsubProgress()
      unsubDownloaded()
      unsubError()
    }
  }, [])

  const installUpdate = useCallback(() => {
    window.electronAPI?.updater?.install()
  }, [])

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, dismissed: true }))
  }, [])

  const checkForUpdates = useCallback(() => {
    window.electronAPI?.updater?.check()
  }, [])

  return { ...state, installUpdate, dismiss, checkForUpdates }
}
