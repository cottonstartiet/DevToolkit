import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

const sampleText = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.

How vexingly quick daft zebras jump! The five boxing wizards jump quickly.`

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  sentences: number
  paragraphs: number
  bytes: number
}

function computeStats(text: string): TextStats {
  if (!text) {
    return { characters: 0, charactersNoSpaces: 0, words: 0, lines: 0, sentences: 0, paragraphs: 0, bytes: 0 }
  }

  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, "").length
  const words = text.trim() ? (text.trim().match(/\S+/g) || []).length : 0
  const lines = text.split("\n").length
  const sentences = text.trim() ? (text.match(/[.!?]+(?:\s|$)/g) || []).length : 0
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0
  const bytes = new TextEncoder().encode(text).length

  return { characters, charactersNoSpaces, words, lines, sentences, paragraphs, bytes }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function CharacterCounterPage() {
  const [text, setText] = useState(sampleText)
  const stats = useMemo(() => computeStats(text), [text])

  const statItems = [
    { label: "Characters", value: stats.characters.toLocaleString() },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString() },
    { label: "Words", value: stats.words.toLocaleString() },
    { label: "Sentences", value: stats.sentences.toLocaleString() },
    { label: "Lines", value: stats.lines.toLocaleString() },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
    { label: "Byte Size", value: formatBytes(stats.bytes) },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Character / Word Counter</h1>
        <p className="text-muted-foreground">
          Count characters, words, lines, sentences, paragraphs, and byte size.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4 shrink-0">
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Text</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => setText("")}>
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here..."
            className="flex-1 min-h-0 resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}
