import {
  Hash,
  Braces,
  ArrowLeftRight,
  GitCompare,
  FileText,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const tools = [
  {
    name: "GUID / UUID Generator",
    description: "Generate GUIDs and UUIDs v4 instantly",
    path: "/uuid",
    icon: Hash,
  },
  {
    name: "JSON Formatter",
    description: "Format, minify, and validate JSON",
    path: "/json-formatter",
    icon: Braces,
  },
  {
    name: "JSON Compare",
    description: "Compare two JSON objects side by side",
    path: "/json-compare",
    icon: GitCompare,
  },
  {
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings",
    path: "/base64",
    icon: ArrowLeftRight,
  },
  {
    name: "Markdown to PDF",
    description: "Convert Markdown text to downloadable PDF",
    path: "/markdown-pdf",
    icon: FileText,
  },
]

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DevToolkit</h1>
        <p className="text-muted-foreground text-lg">
          A collection of offline developer tools in a single desktop app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link key={tool.path} to={tool.path}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <CardDescription className="mt-1">{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
