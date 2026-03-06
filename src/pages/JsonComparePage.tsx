import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { GitCompare, AlertCircle, Copy, Check, Pencil } from "lucide-react"
import { cn, copyToClipboard } from "@/lib/utils"
import { diffLines } from "diff"

type AnnotatedLine = {
  text: string
  type: "common" | "added" | "removed" | "empty"
}

function buildSideBySideLines(leftText: string, rightText: string) {
  const changes = diffLines(leftText, rightText)
  const leftLines: AnnotatedLine[] = []
  const rightLines: AnnotatedLine[] = []

  let i = 0
  while (i < changes.length) {
    const change = changes[i]
    const lines = change.value.replace(/\n$/, "").split("\n")

    if (!change.added && !change.removed) {
      for (const line of lines) {
        leftLines.push({ text: line, type: "common" })
        rightLines.push({ text: line, type: "common" })
      }
      i++
    } else if (change.removed && i + 1 < changes.length && changes[i + 1].added) {
      const removedLines = lines
      const addedLines = changes[i + 1].value.replace(/\n$/, "").split("\n")
      const maxLen = Math.max(removedLines.length, addedLines.length)
      for (let j = 0; j < maxLen; j++) {
        leftLines.push(
          j < removedLines.length
            ? { text: removedLines[j], type: "removed" }
            : { text: "", type: "empty" }
        )
        rightLines.push(
          j < addedLines.length
            ? { text: addedLines[j], type: "added" }
            : { text: "", type: "empty" }
        )
      }
      i += 2
    } else if (change.removed) {
      for (const line of lines) {
        leftLines.push({ text: line, type: "removed" })
        rightLines.push({ text: "", type: "empty" })
      }
      i++
    } else {
      for (const line of lines) {
        leftLines.push({ text: "", type: "empty" })
        rightLines.push({ text: line, type: "added" })
      }
      i++
    }
  }

  return { leftLines, rightLines }
}

function buildDiffText(
  leftLines: AnnotatedLine[],
  rightLines: AnnotatedLine[]
): string {
  const out: string[] = []
  for (let i = 0; i < leftLines.length; i++) {
    const l = leftLines[i]
    const r = rightLines[i]
    if (l.type === "removed") out.push(`- ${l.text}`)
    if (r.type === "added") out.push(`+ ${r.text}`)
  }
  return out.join("\n")
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
  const [diffView, setDiffView] = useState<{
    left: AnnotatedLine[]
    right: AnnotatedLine[]
    added: number
    removed: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const leftScrollRef = useRef<HTMLDivElement>(null!)
  const rightScrollRef = useRef<HTMLDivElement>(null!)
  const scrolling = useRef(false)

  const syncScroll = useCallback((source: "left" | "right") => {
    if (scrolling.current) return
    scrolling.current = true
    const from = source === "left" ? leftScrollRef.current : rightScrollRef.current
    const to = source === "left" ? rightScrollRef.current : leftScrollRef.current
    if (from && to) {
      to.scrollTop = from.scrollTop
      to.scrollLeft = from.scrollLeft
    }
    requestAnimationFrame(() => {
      scrolling.current = false
    })
  }, [])

  const compare = () => {
    try {
      const leftParsed = JSON.parse(left)
      const rightParsed = JSON.parse(right)
      const leftFormatted = JSON.stringify(leftParsed, null, 2)
      const rightFormatted = JSON.stringify(rightParsed, null, 2)
      const { leftLines, rightLines } = buildSideBySideLines(leftFormatted, rightFormatted)

      setDiffView({
        left: leftLines,
        right: rightLines,
        added: rightLines.filter((l) => l.type === "added").length,
        removed: leftLines.filter((l) => l.type === "removed").length,
      })
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setDiffView(null)
    }
  }

  const handleCopy = async () => {
    if (!diffView) return
    await copyToClipboard(buildDiffText(diffView.left, diffView.right))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const edit = () => {
    setDiffView(null)
    setError(null)
  }

  const renderDiffPanel = (
    lines: AnnotatedLine[],
    ref: React.RefObject<HTMLDivElement>,
    side: "left" | "right"
  ) => (
    <div
      ref={ref}
      onScroll={() => syncScroll(side)}
      className="flex-1 min-h-0 overflow-auto rounded-md border bg-background"
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start leading-6 min-h-[1.5rem] border-l-3",
            line.type === "removed" && "bg-red-500/15 border-l-red-500",
            line.type === "added" && "bg-green-500/15 border-l-green-500",
            line.type === "empty" && "bg-muted/10 border-l-transparent",
            line.type === "common" && "border-l-transparent"
          )}
        >
          <span className="w-5 shrink-0 text-center select-none text-muted-foreground/50 text-xs leading-6">
            {line.type === "removed" ? "−" : line.type === "added" ? "+" : ""}
          </span>
          <span className="whitespace-pre font-mono text-sm pr-4">{line.text}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">JSON Compare</h1>
        <p className="text-muted-foreground">Compare two JSON objects and see the differences.</p>
      </div>

      {diffView && (
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <span className="text-sm font-medium">
            {diffView.added === 0 && diffView.removed === 0
              ? "✓ No differences found"
              : `${diffView.added + diffView.removed} line(s) changed`}
          </span>
          {diffView.added > 0 && (
            <span className="text-xs text-green-500 font-mono">+{diffView.added} added</span>
          )}
          {diffView.removed > 0 && (
            <span className="text-xs text-red-500 font-mono">−{diffView.removed} removed</span>
          )}
          {(diffView.added > 0 || diffView.removed > 0) && (
            <Button variant="outline" size="sm" onClick={handleCopy} className="ml-auto">
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Copied!" : "Copy Diff"}
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Left JSON</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            {diffView ? (
              renderDiffPanel(diffView.left, leftScrollRef, "left")
            ) : (
              <Textarea
                placeholder="Paste first JSON here..."
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                className="flex-1 min-h-0 resize-none"
              />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Right JSON</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            {diffView ? (
              renderDiffPanel(diffView.right, rightScrollRef, "right")
            ) : (
              <Textarea
                placeholder="Paste second JSON here..."
                value={right}
                onChange={(e) => setRight(e.target.value)}
                className="flex-1 min-h-0 resize-none"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mt-4 shrink-0">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 shrink-0 pt-2">
        {diffView ? (
          <Button variant="outline" onClick={edit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button onClick={compare}>
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>
        )}
      </div>
    </div>
  )
}
