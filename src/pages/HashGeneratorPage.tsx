import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, Play } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import { md5 } from "js-md5"

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512"

const algorithms: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"]

const webCryptoName: Record<string, string> = {
  "SHA-1": "SHA-1",
  "SHA-256": "SHA-256",
  "SHA-512": "SHA-512",
}

async function computeHash(text: string, algo: Algorithm): Promise<string> {
  if (algo === "MD5") {
    return md5(text)
  }
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(webCryptoName[algo], data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

interface HashResult {
  algorithm: Algorithm
  hash: string
}

export function HashGeneratorPage() {
  const [input, setInput] = useState("Hello, World!")
  const [results, setResults] = useState<HashResult[]>([])
  const [computing, setComputing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = useCallback(async () => {
    if (!input) {
      setResults([])
      return
    }

    setComputing(true)
    try {
      const hashes = await Promise.all(
        algorithms.map(async (algo) => ({
          algorithm: algo,
          hash: await computeHash(input, algo),
        }))
      )
      setResults(hashes)
    } finally {
      setComputing(false)
    }
  }, [input])

  const handleCopy = async (hash: string, index: number) => {
    await copyToClipboard(hash)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const clear = () => {
    setInput("")
    setResults([])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Hash Generator</h1>
        <p className="text-muted-foreground">
          Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text input.
        </p>
      </div>

      <div className="max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste text to hash..."
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={generate} disabled={computing || !input.trim()}>
                <Play className="h-4 w-4 mr-2" />
                {computing ? "Computing..." : "Generate Hashes"}
              </Button>
              <Button variant="secondary" onClick={clear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hashes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((r, i) => (
                <div key={r.algorithm} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{r.algorithm}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(r.hash, i)}>
                      {copiedIndex === i ? (
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedIndex === i ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <code className="block bg-muted rounded px-3 py-2 text-xs font-mono break-all">
                    {r.hash}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
