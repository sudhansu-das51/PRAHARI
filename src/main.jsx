import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary, { EmergencyFallback } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Last resort. Sections have their own boundaries, so reaching this one
        means the whole app failed — the fallback still puts the emergency
        numbers on screen rather than leaving a blank page. */}
    <ErrorBoundary name="root" fallback={<EmergencyFallback />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
