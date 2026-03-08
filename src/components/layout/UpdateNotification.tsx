import { X, Download, RefreshCw, ArrowDownToLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutoUpdater } from '@/hooks/useAutoUpdater'

export function UpdateNotification() {
  const { status, version, percent, errorMessage, dismissed, installUpdate, dismiss } =
    useAutoUpdater()

  if (dismissed || status === 'idle' || status === 'checking') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-border bg-card p-4 shadow-lg update-toast-enter">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      {status === 'downloading' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Download className="h-4 w-4 text-primary animate-pulse" />
            Downloading update{version ? ` v${version}` : ''}…
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{percent}% complete</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowDownToLine className="h-4 w-4 text-primary" />
            Update{version ? ` v${version}` : ''} ready
          </div>
          <p className="text-xs text-muted-foreground">
            The update will be applied next time you restart.
          </p>
          <Button size="sm" onClick={installUpdate} className="w-full">
            <RefreshCw className="mr-2 h-3 w-3" />
            Restart Now
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            Update failed
          </div>
          <p className="text-xs text-muted-foreground">
            {errorMessage ?? 'An unexpected error occurred while updating.'}
          </p>
        </div>
      )}
    </div>
  )
}
