import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Copy,
  Check,
  AlertCircle,
  Regex,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react"
import { copyToClipboard } from "@/lib/utils"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MatchDetail {
  fullMatch: string
  index: number
  endIndex: number
  groups: string[]
  namedGroups: Record<string, string>
}

type RegexFlag = "g" | "i" | "m" | "s" | "u" | "d"

interface FlagInfo {
  flag: RegexFlag
  label: string
  description: string
}

const FLAGS: FlagInfo[] = [
  { flag: "g", label: "g", description: "Global — find all matches" },
  { flag: "i", label: "i", description: "Case-insensitive" },
  { flag: "m", label: "m", description: "Multiline — ^ and $ match line boundaries" },
  { flag: "s", label: "s", description: "Dotall — . matches newlines" },
  { flag: "u", label: "u", description: "Unicode — full Unicode support" },
  { flag: "d", label: "d", description: "Indices — capture group positions" },
]

/* ------------------------------------------------------------------ */
/*  Cheat-sheet data                                                   */
/* ------------------------------------------------------------------ */

interface CheatSection {
  title: string
  items: { pattern: string; description: string }[]
}

const CHEAT_SHEET: CheatSection[] = [
  {
    title: "Character Classes",
    items: [
      { pattern: ".", description: "Any character except newline" },
      { pattern: "\\w  \\W", description: "Word character / non-word" },
      { pattern: "\\d  \\D", description: "Digit / non-digit" },
      { pattern: "\\s  \\S", description: "Whitespace / non-whitespace" },
      { pattern: "[abc]", description: "Any of a, b, or c" },
      { pattern: "[^abc]", description: "Not a, b, or c" },
      { pattern: "[a-z]", description: "Character range a–z" },
    ],
  },
  {
    title: "Anchors",
    items: [
      { pattern: "^", description: "Start of string (or line with m flag)" },
      { pattern: "$", description: "End of string (or line with m flag)" },
      { pattern: "\\b  \\B", description: "Word boundary / non-boundary" },
    ],
  },
  {
    title: "Quantifiers",
    items: [
      { pattern: "*", description: "0 or more" },
      { pattern: "+", description: "1 or more" },
      { pattern: "?", description: "0 or 1 (optional)" },
      { pattern: "{n}", description: "Exactly n" },
      { pattern: "{n,}", description: "n or more" },
      { pattern: "{n,m}", description: "Between n and m" },
      { pattern: "*?  +?", description: "Lazy (non-greedy) versions" },
    ],
  },
  {
    title: "Groups & Lookaround",
    items: [
      { pattern: "(abc)", description: "Capturing group" },
      { pattern: "(?:abc)", description: "Non-capturing group" },
      { pattern: "(?<name>abc)", description: "Named capturing group" },
      { pattern: "a|b", description: "Alternation — a or b" },
      { pattern: "(?=abc)", description: "Positive lookahead" },
      { pattern: "(?!abc)", description: "Negative lookahead" },
      { pattern: "(?<=abc)", description: "Positive lookbehind" },
      { pattern: "(?<!abc)", description: "Negative lookbehind" },
    ],
  },
  {
    title: "Common Patterns",
    items: [
      { pattern: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z]{2,}\\b", description: "Email (basic)" },
      { pattern: "https?://\\S+", description: "URL (basic)" },
      { pattern: "\\b\\d{1,3}(\\.\\d{1,3}){3}\\b", description: "IPv4 address" },
      { pattern: "^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$", description: "Hex color code" },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Small helper components                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Regex execution engine                                             */
/* ------------------------------------------------------------------ */

function executeRegex(
  pattern: string,
  flags: string,
  testString: string
): { matches: MatchDetail[]; error: string | null } {
  if (!pattern) return { matches: [], error: null }

  let re: RegExp
  try {
    re = new RegExp(pattern, flags)
  } catch (e) {
    return { matches: [], error: (e as Error).message }
  }

  const matches: MatchDetail[] = []

  if (flags.includes("g")) {
    let m: RegExpExecArray | null
    // Safety: prevent infinite loops on zero-length matches
    let lastIndex = -1
    while ((m = re.exec(testString)) !== null) {
      if (re.lastIndex === lastIndex) {
        re.lastIndex++
        continue
      }
      lastIndex = re.lastIndex

      matches.push({
        fullMatch: m[0],
        index: m.index,
        endIndex: m.index + m[0].length,
        groups: m.slice(1).map((g) => g ?? ""),
        namedGroups: m.groups ? { ...m.groups } : {},
      })

      // Guard against runaway matches
      if (matches.length > 1000) break
    }
  } else {
    const m = re.exec(testString)
    if (m) {
      matches.push({
        fullMatch: m[0],
        index: m.index,
        endIndex: m.index + m[0].length,
        groups: m.slice(1).map((g) => g ?? ""),
        namedGroups: m.groups ? { ...m.groups } : {},
      })
    }
  }

  return { matches, error: null }
}

/* ------------------------------------------------------------------ */
/*  Build highlighted spans from matches                               */
/* ------------------------------------------------------------------ */

interface Span {
  text: string
  highlighted: boolean
  matchIndex: number | null
}

function buildHighlightedSpans(testString: string, matches: MatchDetail[]): Span[] {
  if (matches.length === 0) {
    return [{ text: testString, highlighted: false, matchIndex: null }]
  }

  const spans: Span[] = []
  let cursor = 0

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    // Text before this match
    if (match.index > cursor) {
      spans.push({
        text: testString.slice(cursor, match.index),
        highlighted: false,
        matchIndex: null,
      })
    }
    // The match itself
    spans.push({
      text: match.fullMatch,
      highlighted: true,
      matchIndex: i,
    })
    cursor = match.endIndex
  }

  // Remaining text after last match
  if (cursor < testString.length) {
    spans.push({
      text: testString.slice(cursor),
      highlighted: false,
      matchIndex: null,
    })
  }

  return spans
}

/* ------------------------------------------------------------------ */
/*  Highlight colors (cycle through for visual distinction)            */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_COLORS = [
  "bg-yellow-300/40 dark:bg-yellow-500/30 border-yellow-400/60",
  "bg-cyan-300/40 dark:bg-cyan-500/30 border-cyan-400/60",
  "bg-pink-300/40 dark:bg-pink-500/30 border-pink-400/60",
  "bg-green-300/40 dark:bg-green-500/30 border-green-400/60",
  "bg-purple-300/40 dark:bg-purple-500/30 border-purple-400/60",
  "bg-orange-300/40 dark:bg-orange-500/30 border-orange-400/60",
]

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export function RegexTesterPage() {
  const [pattern, setPattern] = useState("(\\d{4})-(\\d{2})-(\\d{2})")
  const [activeFlags, setActiveFlags] = useState<Set<RegexFlag>>(new Set(["g"]))
  const [testString, setTestString] = useState("Today is 2026-03-06 and tomorrow is 2026-03-07.")
  const [cheatOpen, setCheatOpen] = useState(false)

  const flagString = useMemo(
    () => FLAGS.filter((f) => activeFlags.has(f.flag)).map((f) => f.flag).join(""),
    [activeFlags]
  )

  const { matches, error } = useMemo(
    () => executeRegex(pattern, flagString, testString),
    [pattern, flagString, testString]
  )

  const highlightedSpans = useMemo(
    () => buildHighlightedSpans(testString, matches),
    [testString, matches]
  )

  const toggleFlag = useCallback((flag: RegexFlag) => {
    setActiveFlags((prev) => {
      const next = new Set(prev)
      if (next.has(flag)) next.delete(flag)
      else next.add(flag)
      return next
    })
  }, [])

  const fullRegexString = `/${pattern}/${flagString}`

  const allMatchesText = matches
    .map(
      (m, i) =>
        `Match ${i + 1}: "${m.fullMatch}" (index ${m.index}–${m.endIndex})` +
        (m.groups.length > 0
          ? `\n  Groups: ${m.groups.map((g, j) => `$${j + 1}: "${g}"`).join(", ")}`
          : "") +
        (Object.keys(m.namedGroups).length > 0
          ? `\n  Named: ${Object.entries(m.namedGroups).map(([k, v]) => `${k}: "${v}"`).join(", ")}`
          : "")
    )
    .join("\n")

  const handleClear = () => {
    setPattern("")
    setTestString("")
    setActiveFlags(new Set(["g"]))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Regex Tester</h1>
        <p className="text-muted-foreground">
          Write regular expressions and test them against input strings in real time.
        </p>
      </div>

      {/* Pattern input */}
      <Card className="shrink-0 mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pattern</CardTitle>
            <div className="flex items-center gap-2">
              <CopyButton text={fullRegexString} label="Copy Regex" />
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Regex input with delimiters */}
          <div className="flex items-center gap-0">
            <span className="text-lg font-mono text-muted-foreground select-none">/</span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-1 font-mono text-sm rounded-none border-x-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <span className="text-lg font-mono text-muted-foreground select-none">
              /{flagString}
            </span>
          </div>

          {/* Flags */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Flags</Label>
            <div className="flex flex-wrap gap-2">
              {FLAGS.map((f) => (
                <button
                  key={f.flag}
                  onClick={() => toggleFlag(f.flag)}
                  title={f.description}
                  className={cn(
                    "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer",
                    activeFlags.has(f.flag)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.flag}
                  <span className="ml-1.5 font-sans font-normal text-[10px] opacity-70">
                    {f.description.split("—")[0].trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content: test string + results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Test string */}
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Test String</CardTitle>
              {matches.length > 0 && (
                <Badge variant="secondary">
                  {matches.length} match{matches.length !== 1 ? "es" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            <Textarea
              placeholder="Enter text to test against..."
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="flex-1 min-h-0 resize-none"
            />
          </CardContent>
        </Card>

        {/* Highlighted matches */}
        <Card className="flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Match Highlights</CardTitle>
              {matches.length > 0 && (
                <CopyButton text={allMatchesText} label="Copy All" />
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col">
            {testString ? (
              <div className="flex-1 min-h-0 overflow-auto p-3 rounded-md bg-muted font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                {highlightedSpans.map((span, idx) =>
                  span.highlighted ? (
                    <mark
                      key={idx}
                      className={cn(
                        "rounded px-0.5 border-b-2",
                        HIGHLIGHT_COLORS[span.matchIndex! % HIGHLIGHT_COLORS.length]
                      )}
                      title={`Match ${span.matchIndex! + 1}`}
                    >
                      {span.text}
                    </mark>
                  ) : (
                    <span key={idx}>{span.text}</span>
                  )
                )}
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex items-center justify-center text-muted-foreground text-sm">
                Enter a test string to see match highlights
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match details */}
      {matches.length > 0 && (
        <Card className="mt-4 shrink-0">
          <CardHeader>
            <CardTitle className="text-base">Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Match</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Index</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Groups</th>
                    <th className="text-right py-2 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-4">
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                          {m.fullMatch}
                        </code>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                        {m.index}–{m.endIndex}
                      </td>
                      <td className="py-2 pr-4">
                        {m.groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {m.groups.map((g, j) => (
                              <Badge key={j} variant="outline" className="font-mono text-[10px]">
                                ${j + 1}: {g || <span className="italic text-muted-foreground">empty</span>}
                              </Badge>
                            ))}
                            {Object.entries(m.namedGroups).map(([name, val]) => (
                              <Badge key={name} variant="secondary" className="font-mono text-[10px]">
                                {name}: {val}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <CopyButton text={m.fullMatch} label="Copy" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cheat sheet */}
      <Card className="mt-4 shrink-0">
        <CardHeader className="cursor-pointer" onClick={() => setCheatOpen(!cheatOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Regex className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Quick Reference</CardTitle>
            </div>
            {cheatOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {cheatOpen && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHEAT_SHEET.map((section) => (
                <div key={section.title}>
                  <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                  <div className="space-y-1">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <code className="shrink-0 px-1.5 py-0.5 rounded bg-muted font-mono text-[11px]">
                          {item.pattern}
                        </code>
                        <span className="text-muted-foreground">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
