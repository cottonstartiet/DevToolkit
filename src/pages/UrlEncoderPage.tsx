import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ArrowLeftRight } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

export function UrlEncoderPage() {
  const [input, setInput] = useState("https://example.com/search?q=hello world&lang=en")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const encodeUrl = (raw: string): string => {
    try {
      const url = new URL(raw)
      const encodedParams = new URLSearchParams()
      url.searchParams.forEach((value, key) => {
        encodedParams.set(key, value)
      })
      url.search = encodedParams.toString()
      return url.toString()
    } catch {
      // Not a valid URL — fall back to encoding the whole string
      return encodeURIComponent(raw)
    }
  }

  const decodeUrl = (encoded: string): string => {
    try {
      const url = new URL(encoded)
      const params = new URLSearchParams(url.search)
      const decoded = Array.from(params.entries())
        .map(([k, v]) => `${decodeURIComponent(k)}=${decodeURIComponent(v)}`)
        .join("&")
      url.search = decoded ? `?${decoded}` : ""
      return decodeURIComponent(url.toString())
    } catch {
      return decodeURIComponent(encoded.trim())
    }
  }

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(encodeUrl(input))
      } else {
        setOutput(decodeUrl(input.trim()))
      }
      setError(null)
    } catch {
      setError(mode === "decode" ? "Invalid URL-encoded string" : "Failed to encode")
      setOutput("")
    }
  }

  const swap = () => {
    setInput(output)
    setOutput("")
    setMode(mode === "encode" ? "decode" : "encode")
    setError(null)
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">URL Encoder / Decoder</h1>
        <p className="text-muted-foreground">Encode text to URL-safe format or decode URL-encoded strings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">
              {mode === "encode" ? "Plain Text" : "URL-Encoded Input"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder={mode === "encode" ? "Enter text to encode..." : "Enter URL-encoded text to decode..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-0 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {mode === "encode" ? "URL-Encoded Output" : "Decoded Text"}
              </CardTitle>
              {output && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            {error ? (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
            ) : (
              <Textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                className="flex-1 min-h-0 resize-none"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mt-4 shrink-0 pt-2">
        <Button onClick={process}>
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        <Button variant="outline" onClick={swap}>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Swap
        </Button>
      </div>
    </div>
  )
}
