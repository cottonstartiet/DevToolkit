import React from 'react'
import ReactDOM from 'react-dom/client'
import { invoke } from '@tauri-apps/api/core'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { FavouritesProvider } from './contexts/FavouritesContext.tsx'
import './index.css'

interface BootstrapData {
  settings: Record<string, string>
  favourites: string[]
}

async function bootstrap() {
  const data = await invoke<BootstrapData>('bootstrap')

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider initialTheme={data.settings.theme}>
        <FavouritesProvider initialFavourites={data.favourites}>
          <App />
        </FavouritesProvider>
      </ThemeProvider>
    </React.StrictMode>,
  )

  const splash = document.getElementById('splash')
  if (splash) {
    const elapsed = performance.now()
    const remaining = Math.max(0, 1500 - elapsed)
    setTimeout(() => {
      splash.style.opacity = '0'
      splash.addEventListener('transitionend', () => splash.remove())
    }, remaining)
  }
}

bootstrap()
