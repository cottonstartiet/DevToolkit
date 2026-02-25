import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Check, AlertCircle, ArrowRightLeft, FileCode, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import * as yaml from "js-yaml"

type ConvertMode = "yaml-to-json" | "json-to-yaml"

export function YamlJsonPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<ConvertMode>("yaml-to-json")
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  const convert = () => {
    if (!input.trim()) {
      setError("Input is empty")
      setOutput("")
      return
    }

    try {
      if (mode === "yaml-to-json") {
        const parsed = yaml.load(input)
        setOutput(JSON.stringify(parsed, null, indent))
      } else {
        const parsed = JSON.parse(input)
        setOutput(yaml.dump(parsed, { indent, lineWidth: -1, noRefs: true }))
      }
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

  const swap = () => {
    setInput(output)
    setOutput("")
    setMode(mode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json")
    setError(null)
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setError(null)
  }

  const inputLabel = mode === "yaml-to-json" ? "YAML Input" : "JSON Input"
  const outputLabel = mode === "yaml-to-json" ? "JSON Output" : "YAML Output"
  const inputPlaceholder =
    mode === "yaml-to-json"
      ? "Paste your YAML here..."
      : "Paste your JSON here..."
  const outputPlaceholder =
    mode === "yaml-to-json"
      ? "Converted JSON will appear here..."
      : "Converted YAML will appear here..."

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">YAML ↔ JSON Converter</h1>
        <p className="text-muted-foreground">
          Convert between YAML and JSON formats with syntax validation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">{inputLabel}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder={inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-0 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{outputLabel}</CardTitle>
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
                placeholder={outputPlaceholder}
                className="flex-1 min-h-0 resize-none"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mt-4 shrink-0 pt-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="mode">Mode</Label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as ConvertMode)
              setOutput("")
              setError(null)
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="yaml-to-json">YAML → JSON</option>
            <option value="json-to-yaml">JSON → YAML</option>
          </select>
        </div>
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
          </select>
        </div>
        <Button onClick={convert}>
          <FileCode className="h-4 w-4 mr-2" />
          Convert
        </Button>
        <Button variant="outline" onClick={swap} disabled={!output}>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Swap
        </Button>
        <Button variant="secondary" onClick={clear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}
