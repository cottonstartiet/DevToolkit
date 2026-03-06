import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { diffLines, diffWords, diffChars, type Change } from "diff"

type DiffMode = "lines" | "words" | "chars"

const sampleLeft = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}`

const sampleRight = `function greet(name, greeting) {
  console.log(greeting + ", " + name + "!");
  return true;
}`

function computeDiff(left: string, right: string, mode: DiffMode): Change[] {
  switch (mode) {
    case "lines":
      return diffLines(left, right)
    case "words":
      return diffWords(left, right)
    case "chars":
      return diffChars(left, right)
  }
}

export function TextDiffPage() {
  const [left, setLeft] = useState(sampleLeft)
  const [right, setRight] = useState(sampleRight)
  const [mode, setMode] = useState<DiffMode>("words")

  const changes = useMemo(() => computeDiff(left, right, mode), [left, right, mode])

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0
    for (const c of changes) {
      if (c.added) added += (c.value.match(/\S+/g) || []).length
      else if (c.removed) removed += (c.value.match(/\S+/g) || []).length
      else unchanged += (c.value.match(/\S+/g) || []).length
    }
    return { added, removed, unchanged }
  }, [changes])

  const clear = () => {
    setLeft("")
    setRight("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Text Diff</h1>
        <p className="text-muted-foreground">
          Compare two text blocks and see additions, removals, and unchanged content highlighted inline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Original</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="Paste original text..."
              rows={8}
              className="resize-none"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="Paste modified text..."
              rows={8}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mt-4 shrink-0">
        <div className="flex items-center gap-2">
          <Label htmlFor="diffMode">Diff by</Label>
          <select
            id="diffMode"
            value={mode}
            onChange={(e) => setMode(e.target.value as DiffMode)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="lines">Lines</option>
            <option value="words">Words</option>
            <option value="chars">Characters</option>
          </select>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-500">+{stats.added}</span>
          <span className="text-destructive">−{stats.removed}</span>
          <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
        </div>
        <div className="flex-1" />
        <Button variant="secondary" onClick={clear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {(left || right) && (
        <Card className="mt-4 flex-1 min-h-0 flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-base">Diff Result</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {changes.map((change, i) => (
                <span
                  key={i}
                  className={
                    change.added
                      ? "bg-green-500/20 text-green-400"
                      : change.removed
                        ? "bg-destructive/20 text-destructive line-through"
                        : ""
                  }
                >
                  {change.value}
                </span>
              ))}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
