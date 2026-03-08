import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { FavouritesProvider } from './contexts/FavouritesContext.tsx'
import './index.css'

async function bootstrap() {
  const data = await window.electronAPI.bootstrap()

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
