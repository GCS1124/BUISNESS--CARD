import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrandingProvider } from './components/BrandingProvider'
import './styles.css'
import './ui-refinements.css'
import './signatures.css'
import './branding.css'
import './visual-refresh.css'
import './event-lead-capture.css'
import './premium-theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandingProvider>
      <App />
    </BrandingProvider>
  </StrictMode>,
)
