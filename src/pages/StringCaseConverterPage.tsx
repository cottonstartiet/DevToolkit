import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

function toCamelCase(str: string): string {
  return toWords(str)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("")
}

function toPascalCase(str: string): string {
  return toWords(str)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("")
}

function toSnakeCase(str: string): string {
  return toWords(str).map((w) => w.toLowerCase()).join("_")
}

function toKebabCase(str: string): string {
  return toWords(str).map((w) => w.toLowerCase()).join("-")
}

function toConstantCase(str: string): string {
  return toWords(str).map((w) => w.toUpperCase()).join("_")
}

function toDotCase(str: string): string {
  return toWords(str).map((w) => w.toLowerCase()).join(".")
}

function toTitleCase(str: string): string {
  return toWords(str)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_\-./\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

interface CaseResult {
  label: string
  value: string
}

function getAllCases(input: string): CaseResult[] {
  if (!input.trim()) return []
  return [
    { label: "camelCase", value: toCamelCase(input) },
    { label: "PascalCase", value: toPascalCase(input) },
    { label: "snake_case", value: toSnakeCase(input) },
    { label: "kebab-case", value: toKebabCase(input) },
    { label: "CONSTANT_CASE", value: toConstantCase(input) },
    { label: "dot.case", value: toDotCase(input) },
    { label: "Title Case", value: toTitleCase(input) },
  ]
}

export function StringCaseConverterPage() {
  const [input, setInput] = useState("my variable name")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const results = getAllCases(input)

  const handleCopy = async (value: string, index: number) => {
    await copyToClipboard(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">String Case Converter</h1>
        <p className="text-muted-foreground">
          Convert between camelCase, snake_case, PascalCase, kebab-case, CONSTANT_CASE, and more.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste text in any case format..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button variant="secondary" size="sm" onClick={() => setInput("")}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((r, i) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-muted-foreground font-medium">{r.label}</span>
                  <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono break-all">{r.value}</code>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(r.value, i)} className="shrink-0">
                    {copiedIndex === i ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
