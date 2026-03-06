import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Braces, MinusSquare, Check, AlertCircle } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

export function JsonFormatterPage() {
  const [input, setInput] = useState(`{
  "name": "DevToolkit",
  "version": "1.0.0",
  "features": ["offline", "fast", "open-source"],
  "settings": { "theme": "dark", "indent": 2 }
}`)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">JSON Formatter</h1>
        <p className="text-muted-foreground">Format, minify, and validate JSON data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder="Paste your JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-0 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Output</CardTitle>
              {output && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            {error ? (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted output will appear here..."
                className="flex-1 min-h-0 resize-none"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mt-4 shrink-0 pt-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="indent">Indent</Label>
          <select
            id="indent"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>Tab</option>
          </select>
        </div>
        <Button onClick={format}>
          <Braces className="h-4 w-4 mr-2" />
          Format
        </Button>
        <Button variant="secondary" onClick={minify}>
          <MinusSquare className="h-4 w-4 mr-2" />
          Minify
        </Button>
      </div>
    </div>
  )
}
