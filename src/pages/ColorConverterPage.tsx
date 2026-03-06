import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace("#", "")
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) }
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100
  if (sn === 0) { const v = Math.round(ln * 255); return { r: v, g: v, b: v } }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const hn = h / 360
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function ColorConverterPage() {
  const [hex, setHex] = useState("#3B82F6")
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 })
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 })
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const updateFromRgb = (newRgb: RGB) => {
    setRgb(newRgb)
    setHex(rgbToHex(newRgb))
    setHsl(rgbToHsl(newRgb))
    setError(null)
  }

  const handleHexChange = (value: string) => {
    const v = value.startsWith("#") ? value : `#${value}`
    setHex(v)
    const parsed = hexToRgb(v)
    if (parsed) {
      setRgb(parsed)
      setHsl(rgbToHsl(parsed))
      setError(null)
    } else if (v.replace("#", "").length >= 6) {
      setError("Invalid HEX value")
    }
  }

  const handleRgbChange = (channel: keyof RGB, value: string) => {
    const num = clamp(parseInt(value) || 0, 0, 255)
    updateFromRgb({ ...rgb, [channel]: num })
  }

  const handleHslChange = (channel: keyof HSL, value: string) => {
    const max = channel === "h" ? 360 : 100
    const num = clamp(parseInt(value) || 0, 0, max)
    const newHsl = { ...hsl, [channel]: num }
    setHsl(newHsl)
    const newRgb = hslToRgb(newHsl)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb))
    setError(null)
  }

  const handlePickerChange = (value: string) => {
    setHex(value.toUpperCase())
    const parsed = hexToRgb(value)
    if (parsed) {
      setRgb(parsed)
      setHsl(rgbToHsl(parsed))
    }
  }

  const handleCopy = async (value: string, field: string) => {
    await copyToClipboard(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const hexStr = hex.startsWith("#") ? hex : `#${hex}`
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Color Converter</h1>
        <p className="text-muted-foreground">
          Convert between HEX, RGB, and HSL color formats with a visual picker.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-lg border border-border shrink-0"
                style={{ backgroundColor: hexStr }}
              />
              <div className="space-y-2 flex-1">
                <Label>Color Picker</Label>
                <input
                  type="color"
                  value={hexStr.length === 7 ? hexStr : "#000000"}
                  onChange={(e) => handlePickerChange(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Label className="w-12 shrink-0 font-medium">HEX</Label>
              <Input
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                className="font-mono flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => handleCopy(hexStr, "hex")} className="shrink-0">
                {copiedField === "hex" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Label className="w-12 shrink-0 font-medium">RGB</Label>
              <div className="flex items-center gap-2 flex-1">
                {(["r", "g", "b"] as const).map((ch) => (
                  <div key={ch} className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb[ch]}
                      onChange={(e) => handleRgbChange(ch, e.target.value)}
                      className="font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground uppercase block text-center mt-0.5">{ch}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(rgbStr, "rgb")} className="shrink-0">
                {copiedField === "rgb" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Label className="w-12 shrink-0 font-medium">HSL</Label>
              <div className="flex items-center gap-2 flex-1">
                {([
                  { key: "h" as const, max: 360, label: "H°" },
                  { key: "s" as const, max: 100, label: "S%" },
                  { key: "l" as const, max: 100, label: "L%" },
                ]).map(({ key, max, label }) => (
                  <div key={key} className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      max={max}
                      value={hsl[key]}
                      onChange={(e) => handleHslChange(key, e.target.value)}
                      className="font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground block text-center mt-0.5">{label}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(hslStr, "hsl")} className="shrink-0">
                {copiedField === "hsl" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
