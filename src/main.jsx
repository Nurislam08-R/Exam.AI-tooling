import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker for PWA only in production builds.
// During development we explicitly unregister any service workers to avoid
// cached assets preventing HMR / seeing file changes.
if ('serviceWorker' in navigator) {
  if (import.meta.env && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch(()=>{})
  } else {
    // In dev: unregister existing service workers to avoid caching issues
    try {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))
    } catch (e) { /* ignore */ }
  }
}
