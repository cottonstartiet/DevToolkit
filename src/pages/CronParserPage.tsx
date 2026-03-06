import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Clock, Trash2, Play } from "lucide-react"
import { CronExpressionParser } from "cron-parser"
import cronstrue from "cronstrue"

interface ParseResult {
  description: string
  nextRuns: Date[]
}

const presets = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every Monday at 9 AM", cron: "0 9 * * 1" },
  { label: "Weekdays at 8:30 AM", cron: "30 8 * * 1-5" },
  { label: "1st of every month", cron: "0 0 1 * *" },
  { label: "Every 15 min, 9–5", cron: "*/15 9-17 * * *" },
]

const fieldLabels = ["Minute", "Hour", "Day (month)", "Month", "Day (week)"]
const fieldHints = ["0–59", "0–23", "1–31", "1–12", "0–7 (0,7=Sun)"]

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function formatRelative(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "< 1 min"
  if (diffMin < 60) return `in ${diffMin} min`
  const diffHrs = Math.floor(diffMin / 60)
  const remMin = diffMin % 60
  if (diffHrs < 24) return remMin > 0 ? `in ${diffHrs}h ${remMin}m` : `in ${diffHrs}h`
  const diffDays = Math.floor(diffHrs / 24)
  const remHrs = diffHrs % 24
  return remHrs > 0 ? `in ${diffDays}d ${remHrs}h` : `in ${diffDays}d`
}

export function CronParserPage() {
  const [expression, setExpression] = useState("*/15 9-17 * * 1-5")
  const [runCount, setRunCount] = useState(10)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parse = useCallback(() => {
    const trimmed = expression.trim()
    if (!trimmed) {
      setError("Enter a cron expression")
      setResult(null)
      return
    }

    try {
      const description = cronstrue.toString(trimmed, { verbose: true })
      const interval = CronExpressionParser.parse(trimmed)
      const nextRuns: Date[] = []
      for (let i = 0; i < runCount; i++) {
        nextRuns.push(interval.next().toDate())
      }
      setResult({ description, nextRuns })
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setResult(null)
    }
  }, [expression, runCount])

  const clear = () => {
    setExpression("")
    setResult(null)
    setError(null)
  }

  const fields = expression.trim().split(/\s+/)

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Cron Expression Parser</h1>
        <p className="text-muted-foreground">
          Describe cron schedules in plain English and preview upcoming run times.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left column: input + presets */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && parse()}
                  placeholder="* * * * *"
                  className="font-mono text-base"
                />
                {/* Field breakdown */}
                <div className="grid grid-cols-5 gap-1 text-center">
                  {fieldLabels.map((label, i) => (
                    <div key={label} className="space-y-0.5">
                      <div className="text-xs font-medium text-muted-foreground truncate">{label}</div>
                      <div className="font-mono text-sm bg-muted rounded px-1 py-0.5 min-h-[1.5rem]">
                        {fields[i] ?? "–"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{fieldHints[i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="runCount">Show next</Label>
                <select
                  id="runCount"
                  value={runCount}
                  onChange={(e) => setRunCount(Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-muted-foreground">runs</span>
              </div>

              <div className="flex gap-2">
                <Button onClick={parse} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Parse
                </Button>
                <Button variant="secondary" onClick={clear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.cron}
                    onClick={() => {
                      setExpression(p.cron)
                      setResult(null)
                      setError(null)
                    }}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left cursor-pointer"
                  >
                    <span className="text-foreground">{p.label}</span>
                    <code className="text-xs text-muted-foreground font-mono">{p.cron}</code>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: results */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{result.description}</p>
                  <p className="text-sm text-muted-foreground mt-2 font-mono">{expression.trim()}</p>
                </CardContent>
              </Card>

              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="shrink-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next {result.nextRuns.length} Run Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto">
                  <div className="space-y-1">
                    {result.nextRuns.map((date, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-6 text-right tabular-nums">{i + 1}.</span>
                          <span className="font-mono">{formatDate(date)}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{formatRelative(date)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !error && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Enter a cron expression and click Parse to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
