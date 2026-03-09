import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { invoke } from "@tauri-apps/api/core"

interface FavouritesContextType {
  favourites: Set<string>
  toggleFavourite: (toolPath: string) => void
  isFavourite: (toolPath: string) => boolean
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined)

export function FavouritesProvider({ children, initialFavourites }: { children: ReactNode; initialFavourites?: string[] }) {
  const [favourites, setFavourites] = useState<Set<string>>(
    () => new Set(initialFavourites ?? [])
  )

  const toggleFavourite = useCallback((toolPath: string) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      if (next.has(toolPath)) {
        next.delete(toolPath)
        invoke("remove_favourite", { toolPath })
      } else {
        next.add(toolPath)
        invoke("add_favourite", { toolPath })
      }
      return next
    })
  }, [])

  const isFavourite = useCallback(
    (toolPath: string) => favourites.has(toolPath),
    [favourites]
  )

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavourites() {
  const ctx = useContext(FavouritesContext)
  if (!ctx) throw new Error("useFavourites must be used within FavouritesProvider")
  return ctx
}
