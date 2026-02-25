import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface FavouritesContextType {
  favourites: Set<string>
  toggleFavourite: (toolPath: string) => void
  isFavourite: (toolPath: string) => boolean
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined)

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.electronAPI.favourites.getAll().then((paths) => {
      setFavourites(new Set(paths))
      setLoaded(true)
    })
  }, [])

  const toggleFavourite = useCallback((toolPath: string) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      if (next.has(toolPath)) {
        next.delete(toolPath)
        window.electronAPI.favourites.remove(toolPath)
      } else {
        next.add(toolPath)
        window.electronAPI.favourites.add(toolPath)
      }
      return next
    })
  }, [])

  const isFavourite = useCallback(
    (toolPath: string) => favourites.has(toolPath),
    [favourites]
  )

  if (!loaded) return null

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  )
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext)
  if (!ctx) throw new Error("useFavourites must be used within FavouritesProvider")
  return ctx
}
