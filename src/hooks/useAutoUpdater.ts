import { useState, useCallback } from 'react'

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error'

export interface UpdateState {
  status: UpdateStatus
  version: string | null
  percent: number
  errorMessage: string | null
  dismissed: boolean
}

export function useAutoUpdater() {
  const [state] = useState<UpdateState>({
    status: 'idle',
    version: null,
    percent: 0,
    errorMessage: null,
    dismissed: false,
  })

  const installUpdate = useCallback(() => {
    // Tauri updater can be integrated via tauri-plugin-updater in the future
  }, [])

  const dismiss = useCallback(() => {
    // no-op
  }, [])

  const checkForUpdates = useCallback(() => {
    // no-op
  }, [])

  return { ...state, installUpdate, dismiss, checkForUpdates }
}
