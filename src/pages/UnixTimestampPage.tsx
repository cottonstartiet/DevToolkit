import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowRightLeft, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  })
}

function toISOLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function UnixTimestampPage() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  const [timestampInput, setTimestampInput] = useState("1700000000")
  const [dateInput, setDateInput] = useState("")
  const [convertedDate, setConvertedDate] = useState<string | null>(null)
  const [convertedTimestamp, setConvertedTimestamp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTimestampConvert = () => {
    const val = timestampInput.trim()
    if (!val) return
    const num = Number(val)
    if (isNaN(num)) {
      setError("Invalid timestamp")
      setConvertedDate(null)
      return
    }
    // Auto-detect seconds vs milliseconds
    const ms = num > 1e12 ? num : num * 1000
    const date = new Date(ms)
    if (isNaN(date.getTime())) {
      setError("Invalid timestamp")
      setConvertedDate(null)
      return
    }
    setConvertedDate(formatDate(date))
    setError(null)
  }

  const handleDateConvert = () => {
    const val = dateInput.trim()
    if (!val) return
    const date = new Date(val)
    if (isNaN(date.getTime())) {
      setError("Invalid date format")
      setConvertedTimestamp(null)
      return
    }
    setConvertedTimestamp(Math.floor(date.getTime() / 1000).toString())
    setError(null)
  }

  const handleCopy = async (value: string, field: string) => {
    await copyToClipboard(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const useCurrentTimestamp = () => {
    setTimestampInput(now.toString())
    setConvertedDate(null)
    setError(null)
  }

  const useCurrentDate = () => {
    setDateInput(toISOLocal(new Date()))
    setConvertedTimestamp(null)
    setError(null)
  }

  const clear = () => {
    setTimestampInput("")
    setDateInput("")
    setConvertedDate(null)
    setConvertedTimestamp(null)
    setError(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Unix Timestamp Converter</h1>
        <p className="text-muted-foreground">
          Convert between Unix timestamps (epoch) and human-readable dates.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Live clock */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Unix Timestamp</p>
                <p className="text-3xl font-bold font-mono tabular-nums">{now}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(new Date())}</p>
              </div>
              <Button variant="outline" onClick={() => handleCopy(now.toString(), "now")}>
                {copiedField === "now" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copiedField === "now" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timestamp → Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Timestamp → Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTimestampConvert()}
                placeholder="e.g. 1700000000"
                className="font-mono flex-1"
              />
              <Button variant="outline" size="sm" onClick={useCurrentTimestamp}>
                Now
              </Button>
              <Button onClick={handleTimestampConvert}>Convert</Button>
            </div>
            {convertedDate && (
              <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2">
                <span className="text-sm font-mono">{convertedDate}</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(convertedDate, "ts-date")}>
                  {copiedField === "ts-date" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date → Timestamp */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Date → Timestamp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="font-mono flex-1"
              />
              <Button variant="outline" size="sm" onClick={useCurrentDate}>
                Now
              </Button>
              <Button onClick={handleDateConvert}>Convert</Button>
            </div>
            {convertedTimestamp && (
              <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2">
                <span className="text-sm font-mono">{convertedTimestamp}</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(convertedTimestamp, "date-ts")}>
                  {copiedField === "date-ts" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button variant="secondary" onClick={clear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}
