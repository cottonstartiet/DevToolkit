import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check, AlertCircle, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

interface CidrResult {
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  wildcardMask: string
  firstUsable: string
  lastUsable: string
  totalHosts: number
  usableHosts: number
  cidr: string
  ipClass: string
  isPrivate: boolean
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join(".")
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A"
  if (firstOctet < 192) return "B"
  if (firstOctet < 224) return "C"
  if (firstOctet < 240) return "D (Multicast)"
  return "E (Reserved)"
}

function isPrivateIp(ip: number): boolean {
  const first = (ip >>> 24) & 255
  const second = (ip >>> 16) & 255
  if (first === 10) return true
  if (first === 172 && second >= 16 && second <= 31) return true
  if (first === 192 && second === 168) return true
  return false
}

function parseCidr(input: string): CidrResult | null {
  const match = input.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) return null

  const ip = match[1]
  const prefix = parseInt(match[2])

  if (prefix < 0 || prefix > 32) return null

  const octets = ip.split(".").map(Number)
  if (octets.some((o) => o < 0 || o > 255)) return null

  const ipLong = ipToLong(ip)
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const wildcard = (~mask) >>> 0
  const network = (ipLong & mask) >>> 0
  const broadcast = (network | wildcard) >>> 0
  const totalHosts = Math.pow(2, 32 - prefix)
  const usableHosts = prefix >= 31 ? totalHosts : totalHosts - 2

  return {
    networkAddress: longToIp(network),
    broadcastAddress: longToIp(broadcast),
    subnetMask: longToIp(mask),
    wildcardMask: longToIp(wildcard),
    firstUsable: prefix >= 31 ? longToIp(network) : longToIp(network + 1),
    lastUsable: prefix >= 31 ? longToIp(broadcast) : longToIp(broadcast - 1),
    totalHosts,
    usableHosts: Math.max(0, usableHosts),
    cidr: `${longToIp(network)}/${prefix}`,
    ipClass: getIpClass(octets[0]),
    isPrivate: isPrivateIp(ipLong),
  }
}

const examples = [
  "192.168.1.0/24",
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.100.0/28",
  "10.10.0.0/16",
]

export function CidrCalculatorPage() {
  const [input, setInput] = useState("192.168.1.0/24")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const result = useMemo(() => parseCidr(input), [input])
  const hasInput = input.trim().length > 0
  const isInvalid = hasInput && !result

  const handleCopy = async (value: string, field: string) => {
    await copyToClipboard(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const fields = result
    ? [
        { label: "Network Address", value: result.networkAddress, key: "network" },
        { label: "Broadcast Address", value: result.broadcastAddress, key: "broadcast" },
        { label: "Subnet Mask", value: result.subnetMask, key: "mask" },
        { label: "Wildcard Mask", value: result.wildcardMask, key: "wildcard" },
        { label: "First Usable", value: result.firstUsable, key: "first" },
        { label: "Last Usable", value: result.lastUsable, key: "last" },
        { label: "Total Hosts", value: result.totalHosts.toLocaleString(), key: "total" },
        { label: "Usable Hosts", value: result.usableHosts.toLocaleString(), key: "usable" },
        { label: "CIDR Notation", value: result.cidr, key: "cidr" },
        { label: "IP Class", value: result.ipClass, key: "class" },
        { label: "Private", value: result.isPrivate ? "Yes" : "No", key: "private" },
      ]
    : []

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">CIDR / Subnet Calculator</h1>
        <p className="text-muted-foreground">
          Calculate network ranges, broadcast addresses, subnet masks, and host counts from CIDR notation.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CIDR Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 192.168.1.0/24"
                className="font-mono flex-1"
              />
              <Button variant="secondary" onClick={() => setInput("")}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            {isInvalid && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Invalid CIDR notation. Use format: IP/prefix (e.g. 192.168.1.0/24)</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <Label className="text-xs text-muted-foreground w-full">Quick examples:</Label>
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="text-xs font-mono px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fields.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-medium">{f.value}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(f.value, f.key)}
                      >
                        {copiedField === f.key ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
