import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { GitCompare, AlertCircle } from "lucide-react"

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
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")
  const [diffs, setDiffs] = useState<DiffResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">JSON Compare</h1>
        <p className="text-muted-foreground">Compare two JSON objects and see the differences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Left JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste first JSON here..."
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="min-h-[250px] resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Right JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste second JSON here..."
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="min-h-[250px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <Button onClick={compare} className="mb-4">
        <GitCompare className="h-4 w-4 mr-2" />
        Compare
      </Button>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {diffs !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {diffs.length === 0 ? "✓ No differences found" : `${diffs.length} difference(s) found`}
            </CardTitle>
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
    </div>
  )
}
