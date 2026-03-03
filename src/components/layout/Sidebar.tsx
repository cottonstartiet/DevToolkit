import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  Hash,
  Braces,
  ArrowLeftRight,
  GitCompare,
  FileCode,
  FileText,
  Home,
  Wrench,
  Settings,
  Info,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Database,
  KeyRound,
  Link2,
  Regex,
  Star,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTheme } from "@/contexts/ThemeContext"
import { useFavourites } from "@/contexts/FavouritesContext"
import appConfig from "@/applicationConfig.json"

interface Tool {
  name: string
  path: string
  icon: LucideIcon
}

interface ToolCategory {
  name: string
  icon: LucideIcon
  tools: Tool[]
}

const categories: ToolCategory[] = [
  {
    name: "Generators",
    icon: Sparkles,
    tools: [
      { name: "GUID / UUID Generator", path: "/uuid", icon: Hash },
    ],
  },
  {
    name: "Encoding & Conversion",
    icon: ArrowLeftRight,
    tools: [
      { name: "Base64 Encoder/Decoder", path: "/base64", icon: ArrowLeftRight },
      { name: "JWT Decoder", path: "/jwt-decoder", icon: KeyRound },
      { name: "URL Encoder/Decoder", path: "/url-encoder", icon: Link2 },
    ],
  },
  {
    name: "Text & String Tools",
    icon: Regex,
    tools: [
      { name: "Regex Tester", path: "/regex-tester", icon: Regex },
    ],
  },
  {
    name: "Data & Formats",
    icon: Database,
    tools: [
      { name: "JSON Formatter", path: "/json-formatter", icon: Braces },
      { name: "JSON Compare", path: "/json-compare", icon: GitCompare },
      { name: "YAML ↔ JSON", path: "/yaml-json", icon: FileCode },
      { name: "Markdown to PDF", path: "/markdown-pdf", icon: FileText },
    ],
  },
]

function CollapsedCategoryMenu({
  icon: Icon,
  label,
  tools,
  isActive,
}: {
  icon: LucideIcon
  label: string
  tools: Tool[]
  isActive: boolean
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  const handleEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.top, left: rect.right + 4 })
    }
    setOpen(true)
  }

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div ref={containerRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        ref={buttonRef}
        title={label}
        className={cn(
          "flex items-center justify-center w-full rounded-lg py-2 text-sm transition-colors cursor-pointer",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </button>
      {open && (
        <div
          className="fixed z-50 min-w-48 rounded-lg border border-border bg-sidebar shadow-lg py-1"
          style={{ top: menuPos.top, left: menuPos.left }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          {tools.map((tool) => (
            <button
              key={tool.path}
              onClick={() => {
                navigate(tool.path)
                setOpen(false)
              }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors cursor-pointer",
                location.pathname === tool.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <tool.icon className="h-4 w-4 shrink-0" />
              <span>{tool.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const themeOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

const STORAGE_KEY_COLLAPSED = "devtoolkit-sidebar-collapsed"

export function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_COLLAPSED) === "true"
  })
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    return new Set([...categories.map((c) => c.name), "__favourites__"])
  })
  const { theme, setTheme } = useTheme()
  const { favourites, toggleFavourite, isFavourite } = useFavourites()
  const location = useLocation()

  // Build flat lookup of all tools by path
  const allTools = categories.flatMap((c) => c.tools)
  const favouriteTools = allTools.filter((t) => favourites.has(t.path))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLLAPSED, String(collapsed))
  }, [collapsed])

  // Auto-expand the category containing the active route
  useEffect(() => {
    for (const cat of categories) {
      if (cat.tools.some((t) => t.path === location.pathname)) {
        setExpandedCategories((prev) => new Set(prev).add(cat.name))
        break
      }
    }
  }, [location.pathname])

  function toggleCategory(name: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <>
      <aside
        className={cn(
          "flex flex-col h-screen border-r border-sidebar-border bg-sidebar shrink-0 transition-[width] duration-200",
          collapsed ? "w-14" : "w-64"
        )}
      >
        {/* Header */}
        {collapsed ? (
          <div className="flex items-center justify-center px-1 py-4 border-b border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-sidebar-foreground"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-4 border-b border-sidebar-border">
            <Wrench className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-lg font-bold text-sidebar-foreground truncate flex-1">DevToolkit</h1>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-sidebar-foreground h-7 w-7"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Home link */}
          <div className={cn("px-2", collapsed ? "px-1.5" : "px-3")}>
            <NavLink
              to="/"
              end
              title="Home"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-1",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Home</span>}
            </NavLink>
          </div>

          {/* Categories */}
          {favouriteTools.length > 0 && (
            <div className={cn("mt-1", collapsed ? "px-1.5" : "px-3")}>
              {collapsed ? (
                <CollapsedCategoryMenu
                  icon={Star}
                  label="Favourites"
                  tools={favouriteTools}
                  isActive={favouriteTools.some((t) => t.path === location.pathname)}
                />
              ) : (
                <>
                  <button
                    onClick={() => toggleCategory("__favourites__")}
                    className="flex items-center justify-between w-full rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors cursor-pointer"
                  >
                    <span>Favourites</span>
                    {expandedCategories.has("__favourites__") ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  {expandedCategories.has("__favourites__") && (
                    <ul className="space-y-1 mt-1">
                      {favouriteTools.map((tool) => (
                        <li key={`fav-${tool.path}`}>
                          <NavLink
                            to={tool.path}
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
                            <span className="flex-1">{tool.name}</span>
                            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          {categories.map((category) => (
            <div key={category.name} className={cn("mt-1", collapsed ? "px-1.5" : "px-3")}>
              {collapsed ? (
                <CollapsedCategoryMenu
                  icon={category.icon}
                  label={category.name}
                  tools={category.tools}
                  isActive={category.tools.some((t) => t.path === location.pathname)}
                />
              ) : (
                /* Expanded: show category header + collapsible tool list */
                <>
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center justify-between w-full rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors cursor-pointer"
                  >
                    <span>{category.name}</span>
                    {expandedCategories.has(category.name) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  {expandedCategories.has(category.name) && (
                    <ul className="space-y-1 mt-1">
                      {category.tools.map((tool) => (
                        <li key={tool.path}>
                          <div className="flex items-center group">
                            <NavLink
                              to={tool.path}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors flex-1 min-w-0",
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                )
                              }
                            >
                              <tool.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{tool.name}</span>
                            </NavLink>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavourite(tool.path)
                              }}
                              title={isFavourite(tool.path) ? "Remove from favourites" : "Add to favourites"}
                              className={cn(
                                "shrink-0 p-1 rounded transition-colors mr-1 cursor-pointer",
                                isFavourite(tool.path)
                                  ? "text-yellow-500"
                                  : "text-muted-foreground/0 group-hover:text-muted-foreground hover:text-yellow-500"
                              )}
                            >
                              <Star className={cn("h-3.5 w-3.5", isFavourite(tool.path) && "fill-yellow-500")} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
          {collapsed ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground hover:text-sidebar-foreground"
                onClick={() => setSettingsOpen(true)}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground hover:text-sidebar-foreground"
                onClick={() => setAboutOpen(true)}
                title="About"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground hover:text-sidebar-foreground"
                onClick={() => setAboutOpen(true)}
                title="About"
              >
                <Info className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-1">
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
            </>
          )}
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
            <h3 className="text-xl font-bold">{appConfig.aboutInfo.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Version {appConfig.aboutInfo.version}</p>
          </div>
          <p className="text-sm text-muted-foreground">{appConfig.aboutInfo.description}</p>
          <div className="w-full border-t pt-3 mt-1">
            <p className="text-xs text-muted-foreground">
              Built with {appConfig.aboutInfo.builtWith}
            </p>
          </div>
        </div>
      </Dialog>
    </>
  )
}
