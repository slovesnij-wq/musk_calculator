import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

const isVercelHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'vercel.app' ||
    window.location.hostname.endsWith('.vercel.app'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {isVercelHost ? <Analytics /> : null}
  </StrictMode>,
)
