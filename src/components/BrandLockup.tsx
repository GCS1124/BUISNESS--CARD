import { useBranding } from './BrandingProvider'

export function BrandLockup({ light = false, className = '' }: { light?: boolean; className?: string }) {
  const { branding } = useBranding()
  const shortName = branding.shortName || branding.productName.slice(0, 1).toUpperCase()
  return <span className={`brand ${className}`.trim()}><span className={`brand-mark ${light ? 'brand-mark-light' : ''} ${branding.logoUrl ? 'brand-mark-image' : ''}`.trim()}>{branding.logoUrl ? <img src={branding.logoUrl} alt="" /> : shortName}</span><span>{branding.productName}</span></span>
}

