import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileDown, Eye } from "lucide-react"

// Simple Markdown to HTML converter (works offline)
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr/>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks / paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")

  // Wrap list items
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
  // Wrap in paragraphs
  html = `<p>${html}</p>`

  return html
}

export function MarkdownPdfPage() {
  const [markdown, setMarkdown] = useState(`# Hello World

This is a **Markdown** document.

## Features
- Convert markdown to PDF
- Works completely offline
- Simple and fast

### Code Example
\`\`\`javascript
const greeting = "Hello, DevToolkit!";
console.log(greeting);
\`\`\`

> This is a blockquote

---

*Italic text* and **bold text** and ***bold italic text***.
`)
  const [preview, setPreview] = useState("")
  const previewRef = useRef<HTMLDivElement>(null)

  const handlePreview = () => {
    setPreview(markdownToHtml(markdown))
  }

  const handleDownloadPdf = () => {
    const html = markdownToHtml(markdown)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DevToolkit - Markdown Export</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
            h1 { border-bottom: 2px solid #eee; padding-bottom: 8px; }
            h2 { border-bottom: 1px solid #eee; padding-bottom: 4px; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
            pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
            pre code { background: none; padding: 0; }
            blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
            hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
            ul { padding-left: 24px; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Markdown to PDF</h1>
        <p className="text-muted-foreground">Write Markdown and export as PDF using the print dialog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Markdown Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="min-h-[400px] resize-none"
              placeholder="Write your Markdown here..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={previewRef}
              className="prose prose-invert min-h-[400px] max-h-[400px] overflow-y-auto p-4 rounded-md border border-input bg-muted/50 text-sm [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_hr]:border-border [&_hr]:my-4 [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: preview || "<p class='text-muted-foreground'>Click Preview to see rendered Markdown</p>" }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-4">
        <Button variant="secondary" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleDownloadPdf}>
          <FileDown className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
      </div>
    </div>
  )
}
