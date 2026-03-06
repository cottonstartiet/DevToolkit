import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { GitCompare, AlertCircle, Copy, Check } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

type DiffResult = {
  path: string
  left: unknown
  right: unknown
  type: "added" | "removed" | "changed"
}

function deepDiff(left: unknown, right: unknown, path = ""): DiffResult[] {
  const results: DiffResult[] = []

  if (left === right) return results

  if (typeof left !== typeof right || left === null || right === null ||
      typeof left !== "object" || typeof right !== "object") {
    if (left !== right) {
      results.push({ path: path || "(root)", left, right, type: "changed" })
    }
    return results
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length)
    for (let i = 0; i < maxLen; i++) {
      const p = `${path}[${i}]`
      if (i >= left.length) {
        results.push({ path: p, left: undefined, right: right[i], type: "added" })
      } else if (i >= right.length) {
        results.push({ path: p, left: left[i], right: undefined, type: "removed" })
      } else {
        results.push(...deepDiff(left[i], right[i], p))
      }
    }
    return results
  }

  const leftObj = left as Record<string, unknown>
  const rightObj = right as Record<string, unknown>
  const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])

  for (const key of allKeys) {
    const p = path ? `${path}.${key}` : key
    if (!(key in leftObj)) {
      results.push({ path: p, left: undefined, right: rightObj[key], type: "added" })
    } else if (!(key in rightObj)) {
      results.push({ path: p, left: leftObj[key], right: undefined, type: "removed" })
    } else {
      results.push(...deepDiff(leftObj[key], rightObj[key], p))
    }
  }

  return results
}

function formatValue(val: unknown): string {
  if (val === undefined) return "undefined"
  return JSON.stringify(val)
}

export function JsonComparePage() {
  const [left, setLeft] = useState(`{
  "name": "Alice",
  "age": 30,
  "role": "developer",
  "skills": ["TypeScript", "React"]
}`)
  const [right, setRight] = useState(`{
  "name": "Alice",
  "age": 31,
  "role": "lead developer",
  "skills": ["TypeScript", "React", "Node.js"],
  "location": "remote"
}`)
  const [diffs, setDiffs] = useState<DiffResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const compare = () => {
    try {
      const leftParsed = JSON.parse(left)
      const rightParsed = JSON.parse(right)
      setDiffs(deepDiff(leftParsed, rightParsed))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setDiffs(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">JSON Compare</h1>
        <p className="text-muted-foreground">Compare two JSON objects and see the differences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Left JSON</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder="Paste first JSON here..."
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="flex-1 min-h-0 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Right JSON</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder="Paste second JSON here..."
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="flex-1 min-h-0 resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mt-4 shrink-0">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {diffs !== null && (
        <Card className="mt-4 shrink-0 max-h-48 overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {diffs.length === 0 ? "✓ No differences found" : `${diffs.length} difference(s) found`}
              </CardTitle>
              {diffs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const text = diffs
                      .map((d) => {
                        if (d.type === "changed") return `[CHANGED] ${d.path}\n- ${formatValue(d.left)}\n+ ${formatValue(d.right)}`
                        if (d.type === "added") return `[ADDED] ${d.path}\n+ ${formatValue(d.right)}`
                        return `[REMOVED] ${d.path}\n- ${formatValue(d.left)}`
                      })
                      .join("\n\n")
                    await copyToClipboard(text)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                >
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </CardHeader>
          {diffs.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                {diffs.map((diff, i) => (
                  <div key={i} className="p-3 rounded-md border text-sm font-mono">
                    <div className="text-muted-foreground mb-1 font-sans font-medium">
                      <span
                        className={
                          diff.type === "added"
                            ? "text-green-500"
                            : diff.type === "removed"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }
                      >
                        [{diff.type.toUpperCase()}]
                      </span>{" "}
                      {diff.path}
                    </div>
                    {diff.type === "changed" && (
                      <>
                        <div className="text-red-400">- {formatValue(diff.left)}</div>
                        <div className="text-green-400">+ {formatValue(diff.right)}</div>
                      </>
                    )}
                    {diff.type === "added" && (
                      <div className="text-green-400">+ {formatValue(diff.right)}</div>
                    )}
                    {diff.type === "removed" && (
                      <div className="text-red-400">- {formatValue(diff.left)}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <div className="flex items-center gap-4 mt-4 shrink-0 pt-2">
        <Button onClick={compare}>
          <GitCompare className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </div>
    </div>
  )
}
