import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

type Base = "decimal" | "hex" | "octal" | "binary"

const bases: { key: Base; label: string; radix: number; prefix: string; placeholder: string }[] = [
  { key: "decimal", label: "Decimal", radix: 10, prefix: "", placeholder: "e.g. 255" },
  { key: "hex", label: "Hexadecimal", radix: 16, prefix: "0x", placeholder: "e.g. FF" },
  { key: "octal", label: "Octal", radix: 8, prefix: "0o", placeholder: "e.g. 377" },
  { key: "binary", label: "Binary", radix: 2, prefix: "0b", placeholder: "e.g. 11111111" },
]

export function NumberBaseConverterPage() {
  const [values, setValues] = useState<Record<Base, string>>({
    decimal: "255",
    hex: "FF",
    octal: "377",
    binary: "11111111",
  })
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<Base | null>(null)

  const handleChange = (base: Base, value: string) => {
    const { radix } = bases.find((b) => b.key === base)!

    if (!value.trim()) {
      setValues({ decimal: "", hex: "", octal: "", binary: "" })
      setError(null)
      return
    }

    const parsed = parseInt(value, radix)
    if (isNaN(parsed) || parsed < 0) {
      setValues((prev) => ({ ...prev, [base]: value }))
      setError(`Invalid ${base} number`)
      return
    }

    setError(null)
    setValues({
      decimal: parsed.toString(10),
      hex: parsed.toString(16).toUpperCase(),
      octal: parsed.toString(8),
      binary: parsed.toString(2),
    })
  }

  const handleCopy = async (base: Base) => {
    await copyToClipboard(values[base])
    setCopiedField(base)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const clear = () => {
    setValues({ decimal: "", hex: "", octal: "", binary: "" })
    setError(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Number Base Converter</h1>
        <p className="text-muted-foreground">
          Convert between Decimal, Hexadecimal, Octal, and Binary. Type in any field to update all others.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {bases.map((base) => (
          <Card key={base.key}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Label className="w-28 shrink-0 font-medium">{base.label}</Label>
                {base.prefix && (
                  <span className="text-sm text-muted-foreground font-mono">{base.prefix}</span>
                )}
                <Input
                  value={values[base.key]}
                  onChange={(e) => handleChange(base.key, e.target.value)}
                  placeholder={base.placeholder}
                  className="font-mono flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(base.key)}
                  disabled={!values[base.key]}
                  className="shrink-0"
                >
                  {copiedField === base.key ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button variant="secondary" onClick={clear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}
