import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.tsx'

// Deep-Link-Navigation, wenn eine Erinnerungs-Notification (aus dem Service Worker,
// z.B. via Periodic Background Sync) angeklickt wird.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'navigate' && typeof event.data.path === 'string') {
      window.location.hash = `#${event.data.path}`
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
