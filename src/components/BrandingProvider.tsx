import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultBranding, normalizeBranding, readLocalBranding, writeLocalBranding, type BrandingConfig } from '../lib/branding'

interface BrandingContextValue {
  branding: BrandingConfig
  updateBranding: (patch: Partial<BrandingConfig>) => void
  resetBranding: () => void
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(() => readLocalBranding())

  const updateBranding = (patch: Partial<BrandingConfig>) => {
    setBranding((current) => {
      const next = normalizeBranding({ ...current, ...patch })
      writeLocalBranding(next)
      return next
    })
  }

  const resetBranding = () => {
    const next = normalizeBranding(defaultBranding)
    writeLocalBranding(next)
    setBranding(next)
  }

  useEffect(() => {
    document.title = `${branding.productName} — ${branding.tagline}`
    document.documentElement.style.setProperty('--brand-primary', branding.primaryColor)
    document.documentElement.style.setProperty('--brand-primary-dark', branding.primaryDarkColor)
    document.documentElement.style.setProperty('--brand-accent', branding.accentColor)
    document.documentElement.style.setProperty('--brand-surface', branding.surfaceColor)
    document.documentElement.style.setProperty('--accent', branding.primaryColor)
    document.documentElement.style.setProperty('--accent-dark', branding.primaryDarkColor)
    document.documentElement.style.setProperty('--mint', branding.accentColor)
    document.documentElement.style.setProperty('--soft', branding.surfaceColor)
    document.documentElement.style.setProperty('color-scheme', 'light')
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    const mark = branding.shortName.slice(0, 1) || branding.productName.slice(0, 1).toUpperCase()
    const fallbackFavicon = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="${branding.primaryColor}"/><text x="32" y="42" fill="white" font-family="Arial,sans-serif" font-size="31" font-weight="700" text-anchor="middle">${mark}</text></svg>`)}`
    favicon.href = branding.faviconUrl || fallbackFavicon
  }, [branding])

  const value = useMemo(() => ({ branding, updateBranding, resetBranding }), [branding])
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  const value = useContext(BrandingContext)
  if (!value) throw new Error('useBranding must be used inside BrandingProvider')
  return value
}
