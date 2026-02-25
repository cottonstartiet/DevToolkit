import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  Hash,
  Braces,
  ArrowLeftRight,
  GitCompare,
  FileText,
  Home,
  Wrench,
  Settings,
  Info,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTheme } from "@/contexts/ThemeContext"
import aboutContent from "@/about.md?raw"

const tools = [
  { name: "Home", path: "/", icon: Home },
  { name: "GUID / UUID Generator", path: "/uuid", icon: Hash },
  { name: "JSON Formatter", path: "/json-formatter", icon: Braces },
  { name: "JSON Compare", path: "/json-compare", icon: GitCompare },
  { name: "Base64 Encoder/Decoder", path: "/base64", icon: ArrowLeftRight },
  { name: "Markdown to PDF", path: "/markdown-pdf", icon: FileText },
]

function parseAboutInfo(md: string) {
  const nameMatch = md.match(/^#\s+(.+)$/m)
  const versionMatch = md.match(/\*\*Version:\*\*\s*(.+)$/m)
  const descMatch = md.match(/^(?!#|\*\*)(.{10,})$/m)
  return {
    name: nameMatch?.[1]?.trim() ?? "DevToolkit",
    version: versionMatch?.[1]?.trim() ?? "0.0.0",
    description: descMatch?.[1]?.trim() ?? "",
    raw: md,
  }
}

const aboutInfo = parseAboutInfo(aboutContent)

const themeOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

export function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <>
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

        <div className="px-3 py-3 border-t border-sidebar-border flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start text-muted-foreground hover:text-sidebar-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start text-muted-foreground hover:text-sidebar-foreground"
            onClick={() => setAboutOpen(true)}
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
        </div>
      </aside>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your DevToolkit experience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors cursor-pointer",
                    theme === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground"
                  )}
                >
                  <opt.icon className="h-5 w-5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onClose={() => setAboutOpen(false)}>
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Wrench className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{aboutInfo.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Version {aboutInfo.version}</p>
          </div>
          <p className="text-sm text-muted-foreground">{aboutInfo.description}</p>
          <div className="w-full border-t pt-3 mt-1">
            <p className="text-xs text-muted-foreground">
              Built with Electron, React, TypeScript & Tailwind CSS
            </p>
          </div>
        </div>
      </Dialog>
    </>
  )
}
