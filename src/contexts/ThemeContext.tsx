import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [loaded, setLoaded] = useState(false)

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  // Load persisted theme from SQLite on mount
  useEffect(() => {
    window.electronAPI.settings.get("theme").then((value) => {
      if (value) setThemeState(value as Theme)
      setLoaded(true)
    })
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    window.electronAPI.settings.set("theme", newTheme)
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(getSystemTheme())
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  if (!loaded) return null

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
