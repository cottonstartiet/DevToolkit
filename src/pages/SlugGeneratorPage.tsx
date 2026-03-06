import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

function generateSlug(text: string, separator: string, lowercase: boolean): string {
  let slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`^${escapeRegex(separator)}+|${escapeRegex(separator)}+$`, "g"), "")

  if (lowercase) slug = slug.toLowerCase()
  return slug
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const sampleInputs = [
  "My Blog Post Title",
  "How to Build REST APIs in 2024",
  "Über die Brücke — A German Story!",
  "10 Tips & Tricks for JavaScript",
]

export function SlugGeneratorPage() {
  const [input, setInput] = useState("My Blog Post Title")
  const [separator, setSeparator] = useState("-")
  const [lowercase, setLowercase] = useState(true)
  const [copied, setCopied] = useState(false)

  const slug = useMemo(() => generateSlug(input, separator, lowercase), [input, separator, lowercase])

  const handleCopy = async () => {
    await copyToClipboard(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Slug Generator</h1>
        <p className="text-muted-foreground">
          Convert text into URL-friendly slugs. Handles special characters and diacritics.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your title here..."
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="separator">Separator</Label>
                <select
                  id="separator"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Dot (.)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="rounded"
                />
                Lowercase
              </label>
              <div className="flex-1" />
              <Button variant="secondary" size="sm" onClick={() => setInput("")}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Slug</CardTitle>
              {slug && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Input value={slug} readOnly className="font-mono bg-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleInputs.map((sample) => (
              <button
                key={sample}
                onClick={() => setInput(sample)}
                className="flex items-center justify-between gap-3 w-full rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left cursor-pointer"
              >
                <span>{sample}</span>
                <code className="text-xs text-muted-foreground font-mono">
                  {generateSlug(sample, separator, lowercase)}
                </code>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
