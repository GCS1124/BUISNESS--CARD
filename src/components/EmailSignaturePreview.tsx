import { ChevronDown } from 'lucide-react'
import { generateEmailSignatureHtml } from '../lib/signatures'
import type { EmailSignature, SignatureBranding } from '../lib/types'

const fontOptions = ['Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Georgia', 'Times New Roman']
const textSizeOptions = [14, 16, 18, 20]

export function EmailSignaturePreview({ signature, mobile, businessCardUrl, onBrandingChange }: { signature: EmailSignature; mobile: boolean; businessCardUrl?: string; onBrandingChange?: (changes: Partial<SignatureBranding>) => void }) {
  const html = generateEmailSignatureHtml(signature, businessCardUrl, { allowLocalImages: true })
  const { branding } = signature
  const disabled = !onBrandingChange
  return <div className={`signature-preview-shell ${mobile ? 'signature-preview-shell-mobile' : ''}`}>
    <div className="signature-preview-controls" role="toolbar" aria-label="Signature preview controls">
      <label className="signature-preview-color-control" title="Primary color">
        <input type="color" value={branding.primaryColor} onChange={(event) => onBrandingChange?.({ primaryColor: event.target.value })} disabled={disabled} aria-label="Primary color" />
        <span aria-hidden="true" style={{ background: branding.primaryColor }} />
      </label>
      <label className="signature-preview-text-control" title="Text color">
        <input type="color" value={branding.textColor} onChange={(event) => onBrandingChange?.({ textColor: event.target.value })} disabled={disabled} aria-label="Text color" />
        <span aria-hidden="true" style={{ color: branding.textColor, textDecorationColor: branding.textColor }}>A</span>
      </label>
      <span className="signature-preview-control-divider" aria-hidden="true" />
      <label className="signature-preview-select signature-preview-font-select">
        <select value={branding.fontFamily} onChange={(event) => onBrandingChange?.({ fontFamily: event.target.value })} disabled={disabled} aria-label="Font family">
          {fontOptions.map((font) => <option key={font}>{font}</option>)}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </label>
      <span className="signature-preview-control-divider" aria-hidden="true" />
      <label className="signature-preview-select signature-preview-size-select">
        <span aria-hidden="true">Tt</span>
        <select value={branding.detailsSize} onChange={(event) => onBrandingChange?.({ detailsSize: Number(event.target.value) })} disabled={disabled} aria-label="Details text size">
          {textSizeOptions.map((size) => <option value={size} key={size}>{size}</option>)}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </label>
      <span className="signature-preview-control-divider" aria-hidden="true" />
      <span className="signature-preview-choice">Details Label: <strong>Icon</strong><ChevronDown size={16} aria-hidden="true" /></span>
      <span className="signature-preview-control-divider" aria-hidden="true" />
      <span className="signature-preview-choice">Socials: <strong>Theme</strong><ChevronDown size={16} aria-hidden="true" /></span>
    </div>
    <div className="signature-preview-canvas">
      <div className="signature-render" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </div>
}
