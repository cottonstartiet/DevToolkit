import { NavLink } from "react-router-dom"
import {
  Hash,
  Braces,
  ArrowLeftRight,
  FileCode,
  GitCompare,
  FileText,
  Home,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tools = [
  { name: "Home", path: "/", icon: Home },
  { name: "GUID / UUID Generator", path: "/uuid", icon: Hash },
  { name: "JSON Formatter", path: "/json-formatter", icon: Braces },
  { name: "JSON Compare", path: "/json-compare", icon: GitCompare },
  { name: "Base64 Encoder/Decoder", path: "/base64", icon: ArrowLeftRight },
  { name: "Markdown to PDF", path: "/markdown-pdf", icon: FileText },
]

export function Sidebar() {
  return (
    <aside className="flex flex-col w-64 h-screen border-r border-sidebar-border bg-sidebar shrink-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Wrench className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold text-sidebar-foreground">DevToolkit</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Tools
          </p>
          <ul className="space-y-1">
            {tools.map((tool) => (
              <li key={tool.path}>
                <NavLink
                  to={tool.path}
                  end={tool.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )
                  }
                >
                  <tool.icon className="h-4 w-4 shrink-0" />
                  <span>{tool.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          <FileCode className="inline h-3 w-3 mr-1" />
          Offline Developer Tools
        </p>
      </div>
    </aside>
  )
}
