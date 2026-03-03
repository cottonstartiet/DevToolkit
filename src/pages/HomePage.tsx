import {
  Hash,
  Braces,
  ArrowLeftRight,
  GitCompare,
  FileCode,
  FileText,
  KeyRound,
  Link2,
  Regex,
  Star,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useFavourites } from "@/contexts/FavouritesContext"
import { cn } from "@/lib/utils"

interface HomeTool {
  name: string
  description: string
  path: string
  icon: LucideIcon
}

const tools: HomeTool[] = [
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
    name: "YAML ↔ JSON Converter",
    description: "Convert between YAML and JSON formats",
    path: "/yaml-json",
    icon: FileCode,
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
  {
    name: "JWT Decoder",
    description: "Decode and inspect JWT header, payload, and claims",
    path: "/jwt-decoder",
    icon: KeyRound,
  },
  {
    name: "URL Encoder/Decoder",
    description: "Encode and decode URL components",
    path: "/url-encoder",
    icon: Link2,
  },
  {
    name: "Regex Tester",
    description: "Write regex, test against input, see matches and groups live",
    path: "/regex-tester",
    icon: Regex,
  },
]

export function HomePage() {
  const { favourites, toggleFavourite, isFavourite } = useFavourites()

  const favouriteTools = tools.filter((t) => favourites.has(t.path))
  const displayTools = favouriteTools.length > 0 ? favouriteTools : tools

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DevToolkit</h1>
        <p className="text-muted-foreground text-lg">
          {favouriteTools.length > 0
            ? "Your favourite tools — quick access to what you use most."
            : "A collection of offline developer tools in a single desktop app."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTools.map((tool) => (
          <div key={tool.path} className="relative group">
            <Link to={tool.path}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <CardDescription className="mt-1">{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <button
              onClick={() => toggleFavourite(tool.path)}
              title={isFavourite(tool.path) ? "Remove from favourites" : "Add to favourites"}
              className={cn(
                "absolute top-3 right-3 p-1.5 rounded-lg transition-colors cursor-pointer",
                isFavourite(tool.path)
                  ? "text-yellow-500"
                  : "text-muted-foreground/0 group-hover:text-muted-foreground hover:text-yellow-500"
              )}
            >
              <Star className={cn("h-4 w-4", isFavourite(tool.path) && "fill-yellow-500")} />
            </button>
          </div>
        ))}
      </div>

      {favouriteTools.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">All Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.filter((t) => !favourites.has(t.path)).map((tool) => (
              <div key={tool.path} className="relative group">
                <Link to={tool.path}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <tool.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                          <CardDescription className="mt-1">{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
                <button
                  onClick={() => toggleFavourite(tool.path)}
                  title="Add to favourites"
                  className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors text-muted-foreground/0 group-hover:text-muted-foreground hover:text-yellow-500 cursor-pointer"
                >
                  <Star className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
