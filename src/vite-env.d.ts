/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_BRAND_NAME?: string
  readonly VITE_BRAND_SHORT_NAME?: string
  readonly VITE_BRAND_TAGLINE?: string
  readonly VITE_BRAND_LOGO_URL?: string
  readonly VITE_BRAND_FAVICON_URL?: string
  readonly VITE_PUBLIC_DOMAIN?: string
  readonly VITE_BRAND_PRIMARY_COLOR?: string
  readonly VITE_BRAND_PRIMARY_DARK_COLOR?: string
  readonly VITE_BRAND_ACCENT_COLOR?: string
  readonly VITE_BRAND_SURFACE_COLOR?: string
  readonly VITE_SHOW_POWERED_BY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
