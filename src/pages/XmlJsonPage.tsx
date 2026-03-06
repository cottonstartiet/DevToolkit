import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Check, AlertCircle, ArrowRightLeft, FileCode2, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import { XMLParser, XMLBuilder } from "fast-xml-parser"

type ConvertMode = "xml-to-json" | "json-to-xml"

const defaultXml = `<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>10.99</price>
  </book>
  <book category="non-fiction">
    <title lang="en">Sapiens</title>
    <author>Yuval Noah Harari</author>
    <year>2011</year>
    <price>14.99</price>
  </book>
</bookstore>`

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: true,
  trimValues: true,
}

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
}

export function XmlJsonPage() {
  const [input, setInput] = useState(defaultXml)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<ConvertMode>("xml-to-json")
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  const convert = () => {
    if (!input.trim()) {
      setError("Input is empty")
      setOutput("")
      return
    }

    try {
      if (mode === "xml-to-json") {
        const xmlInput = input.replace(/<\?xml[^?]*\?>\s*/g, "")
        const parser = new XMLParser(parserOptions)
        const parsed = parser.parse(xmlInput)
        setOutput(JSON.stringify(parsed, null, indent))
      } else {
        const parsed = JSON.parse(input)
        const builder = new XMLBuilder({
          ...builderOptions,
          indentBy: " ".repeat(indent),
        })
        const xml = builder.build(parsed) as string
        setOutput(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`)
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
    setMode(mode === "xml-to-json" ? "json-to-xml" : "xml-to-json")
    setError(null)
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setError(null)
  }

  const inputLabel= mode === "xml-to-json" ? "XML Input" : "JSON Input"
  const outputLabel = mode === "xml-to-json" ? "JSON Output" : "XML Output"
  const inputPlaceholder =
    mode === "xml-to-json"
      ? "Paste your XML here..."
      : "Paste your JSON here..."
  const outputPlaceholder =
    mode === "xml-to-json"
      ? "Converted JSON will appear here..."
      : "Converted XML will appear here..."

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">XML ↔ JSON Converter</h1>
        <p className="text-muted-foreground">
          Convert between XML and JSON formats. Especially handy for legacy API work.
          Attributes are prefixed with <code className="text-xs bg-muted px-1 py-0.5 rounded">@_</code> in JSON.
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
            <option value="xml-to-json">XML → JSON</option>
            <option value="json-to-xml">JSON → XML</option>
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
          <FileCode2 className="h-4 w-4 mr-2" />
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
