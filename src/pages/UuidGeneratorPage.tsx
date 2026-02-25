import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()])
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [noDashes, setNoDashes] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => {
      let uuid = generateUUID()
      if (uppercase) uuid = uuid.toUpperCase()
      if (noDashes) uuid = uuid.replace(/-/g, "")
      return uuid
    })
    setUuids(newUuids)
  }

  const handleCopy = async (uuid: string) => {
    await copyToClipboard(uuid)
    setCopied(uuid)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleCopyAll = async () => {
    await copyToClipboard(uuids.join("\n"))
    setCopied("all")
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">GUID / UUID Generator</h1>
        <p className="text-muted-foreground">Generate random UUIDs (v4) for development use.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
          <CardDescription>Customize UUID generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Uppercase</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={noDashes}
                onChange={(e) => setNoDashes(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">No dashes</span>
            </label>
            <Button onClick={generate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Results</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="h-3 w-3 mr-1" />
                {copied === "all" ? "Copied!" : "Copy All"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setUuids([])}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-md bg-muted font-mono text-sm group"
              >
                <Badge variant="secondary" className="shrink-0">
                  {i + 1}
                </Badge>
                <span className="flex-1 select-all">{uuid}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(uuid)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {copied === uuid && (
                  <span className="text-xs text-green-500">Copied!</span>
                )}
              </div>
            ))}
            {uuids.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click Generate to create UUIDs
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
