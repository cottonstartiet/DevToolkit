import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ArrowLeftRight } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

export function Base64Page() {
  const [input, setInput] = useState("Hello, World! 🌍")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
      setError(null)
    } catch {
      setError(mode === "decode" ? "Invalid Base64 string" : "Failed to encode")
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
        <h1 className="text-2xl font-bold mb-1">Base64 Encoder / Decoder</h1>
        <p className="text-muted-foreground">Encode text to Base64 or decode Base64 strings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">
              {mode === "encode" ? "Plain Text" : "Base64 Input"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
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
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
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
