import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { bootFromCache, refreshConfigFromServer } from './config/siteConfig'

// Apply last-known admin settings instantly, then sync with the server in the background
bootFromCache()
refreshConfigFromServer()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
