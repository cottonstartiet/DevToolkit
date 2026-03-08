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

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: string }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Use pre-fetched bootstrap data or fall back to localStorage cache
    if (initialTheme && ["dark", "light", "system"].includes(initialTheme)) {
      return initialTheme as Theme
    }
    return (localStorage.getItem("devtoolkit-theme") as Theme) || "dark"
  })

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("devtoolkit-theme", newTheme)
    window.electronAPI.settings.set("theme", newTheme)
  }

  // Keep localStorage in sync when initialTheme is used
  useEffect(() => {
    localStorage.setItem("devtoolkit-theme", theme)
  }, [theme])

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
