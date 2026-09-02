export interface BrandingConfig {
  productName: string
  shortName: string
  tagline: string
  logoUrl: string
  faviconUrl: string
  publicDomain: string
  primaryColor: string
  primaryDarkColor: string
  accentColor: string
  surfaceColor: string
  showPoweredBy: boolean
}

const brandingKey = 'cardly.branding.v1'

const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value)
const cleanText = (value: unknown, fallback: string, maxLength: number) => {
  const next = typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
  return next || fallback
}

export const defaultBranding: BrandingConfig = {
  productName: 'Cardly',
  shortName: 'C',
  tagline: 'Digital identity, beautifully shared',
  logoUrl: '',
  faviconUrl: '',
  publicDomain: 'cardly.me',
  primaryColor: '#165c51',
  primaryDarkColor: '#0d453d',
  accentColor: '#cde7e0',
  surfaceColor: '#f7f7f3',
  showPoweredBy: false,
}

const environmentBranding: Partial<BrandingConfig> = {
  productName: import.meta.env.VITE_BRAND_NAME,
  shortName: import.meta.env.VITE_BRAND_SHORT_NAME,
  tagline: import.meta.env.VITE_BRAND_TAGLINE,
  logoUrl: import.meta.env.VITE_BRAND_LOGO_URL,
  faviconUrl: import.meta.env.VITE_BRAND_FAVICON_URL,
  publicDomain: import.meta.env.VITE_PUBLIC_DOMAIN,
  primaryColor: import.meta.env.VITE_BRAND_PRIMARY_COLOR,
  primaryDarkColor: import.meta.env.VITE_BRAND_PRIMARY_DARK_COLOR,
  accentColor: import.meta.env.VITE_BRAND_ACCENT_COLOR,
  surfaceColor: import.meta.env.VITE_BRAND_SURFACE_COLOR,
  showPoweredBy: import.meta.env.VITE_SHOW_POWERED_BY === 'true' ? true : undefined,
}

export const normalizeBranding = (value: Partial<BrandingConfig> = {}): BrandingConfig => {
  const merged = { ...defaultBranding, ...environmentBranding, ...value }
  return {
    productName: cleanText(merged.productName, defaultBranding.productName, 48),
    shortName: cleanText(merged.shortName, cleanText(merged.productName, 'C', 1).slice(0, 1).toUpperCase(), 3),
    tagline: cleanText(merged.tagline, defaultBranding.tagline, 90),
    logoUrl: cleanText(merged.logoUrl, '', 500),
    faviconUrl: cleanText(merged.faviconUrl, '', 500),
    publicDomain: cleanText(merged.publicDomain, defaultBranding.publicDomain, 120).replace(/^https?:\/\//i, '').replace(/\/$/, ''),
    primaryColor: isHexColor(merged.primaryColor) ? merged.primaryColor : defaultBranding.primaryColor,
    primaryDarkColor: isHexColor(merged.primaryDarkColor) ? merged.primaryDarkColor : defaultBranding.primaryDarkColor,
    accentColor: isHexColor(merged.accentColor) ? merged.accentColor : defaultBranding.accentColor,
    surfaceColor: isHexColor(merged.surfaceColor) ? merged.surfaceColor : defaultBranding.surfaceColor,
    showPoweredBy: Boolean(merged.showPoweredBy),
  }
}

const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const readLocalBranding = (): BrandingConfig => {
  if (!hasStorage()) return normalizeBranding()
  try {
    const raw = window.localStorage.getItem(brandingKey)
    return normalizeBranding(raw ? JSON.parse(raw) as Partial<BrandingConfig> : {})
  } catch {
    return normalizeBranding()
  }
}

export const writeLocalBranding = (branding: BrandingConfig) => {
  if (hasStorage()) window.localStorage.setItem(brandingKey, JSON.stringify(branding))
}

