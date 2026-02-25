import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, AlertCircle, KeyRound, Clock } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

/** Known timestamp claims to display as human-readable dates */
const TIMESTAMP_CLAIMS: Record<string, string> = {
  exp: "Expires At",
  iat: "Issued At",
  nbf: "Not Before",
  auth_time: "Auth Time",
}

function base64UrlDecode(str: string): string {
  // Replace base64url characters with standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  // Pad with '=' to make length a multiple of 4
  const pad = base64.length % 4
  if (pad) {
    base64 += "=".repeat(4 - pad)
  }
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  )
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".")
  if (parts.length !== 3) {
    throw new Error(
      `Invalid JWT format: expected 3 parts separated by dots, got ${parts.length}`
    )
  }

  let header: Record<string, unknown>
  try {
    header = JSON.parse(base64UrlDecode(parts[0]))
  } catch {
    throw new Error("Failed to decode JWT header — invalid base64url or JSON")
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    throw new Error("Failed to decode JWT payload — invalid base64url or JSON")
  }

  return { header, payload, signature: parts[2] }
}

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null
  try {
    const date = new Date(value * 1000)
    if (isNaN(date.getTime())) return null
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "long",
    })
  } catch {
    return null
  }
}

function getExpiryStatus(payload: Record<string, unknown>): {
  label: string
  variant: "default" | "secondary" | "destructive"
} | null {
  const exp = payload.exp
  if (typeof exp !== "number") return null
  const now = Math.floor(Date.now() / 1000)
  if (exp < now) {
    return { label: "Expired", variant: "destructive" }
  }
  // Expiring within 5 minutes
  if (exp - now < 300) {
    return { label: "Expiring Soon", variant: "secondary" }
  }
  return { label: "Valid", variant: "default" }
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
      {copied ? "Copied!" : label ?? "Copy"}
    </Button>
  )
}

function TimestampClaims({ payload }: { payload: Record<string, unknown> }) {
  const claims = Object.entries(TIMESTAMP_CLAIMS).filter(
    ([key]) => key in payload
  )
  if (claims.length === 0) return null

  return (
    <div className="space-y-2">
      {claims.map(([key, label]) => {
        const raw = payload[key]
        const formatted = formatTimestamp(raw)
        if (!formatted) return null
        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-mono text-muted-foreground">{key}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">—</span>
            <span>{formatted}</span>
          </div>
        )
      })}
    </div>
  )
}

export function JwtDecoderPage() {
  const [input, setInput] = useState("")
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDecode = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      setError("Please paste a JWT token")
      setDecoded(null)
      return
    }
    try {
      const result = decodeJwt(trimmed)
      setDecoded(result)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setDecoded(null)
    }
  }, [input])

  const handleClear = () => {
    setInput("")
    setDecoded(null)
    setError(null)
  }

  const expiryStatus = decoded ? getExpiryStatus(decoded.payload) : null

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">JWT Decoder</h1>
        <p className="text-muted-foreground">
          Decode and inspect JSON Web Tokens — no verification, fully offline.
        </p>
      </div>

      {/* Input section */}
      <Card className="shrink-0 mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">JWT Token</CardTitle>
            {expiryStatus && (
              <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIs...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex items-center gap-3 mt-3">
            <Button onClick={handleDecode}>
              <KeyRound className="h-4 w-4 mr-2" />
              Decode
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4 shrink-0">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Decoded output */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-auto">
          {/* Header */}
          <Card className="flex flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Header</CardTitle>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <pre className="p-3 rounded-md bg-muted text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Payload */}
          <Card className="flex flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Payload</CardTitle>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 space-y-3">
              <pre className="p-3 rounded-md bg-muted text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
              <TimestampClaims payload={decoded.payload} />
            </CardContent>
          </Card>

          {/* Signature */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Signature</CardTitle>
                <CopyButton text={decoded.signature} />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-3 rounded-md bg-muted text-sm font-mono overflow-auto whitespace-pre-wrap break-all text-muted-foreground">
                {decoded.signature}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Base64url-encoded signature. Verification is not performed — this tool only decodes the token.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
