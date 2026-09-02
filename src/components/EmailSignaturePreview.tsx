import { Mail, Smartphone } from 'lucide-react'
import { generateEmailSignatureHtml } from '../lib/signatures'
import type { EmailSignature } from '../lib/types'

export function EmailSignaturePreview({ signature, mobile, businessCardUrl }: { signature: EmailSignature; mobile: boolean; businessCardUrl?: string }) {
  const html = generateEmailSignatureHtml(signature, businessCardUrl, { allowLocalImages: true })
  return <div className={`signature-preview-shell ${mobile ? 'signature-preview-shell-mobile' : ''}`}>
    <div className="signature-preview-toolbar"><span><span className="preview-live-dot" /> Live preview</span><span className="preview-device-label">{mobile ? <Smartphone size={13} /> : <Mail size={13} />}{mobile ? 'Mobile' : 'Desktop'}</span></div>
    <div className="signature-email-window">
      <div className="signature-email-meta"><div><span>To</span><strong>client@example.com</strong></div><div><span>Subject</span><strong>Great speaking with you</strong></div></div>
      <div className="signature-email-message"><p>Hi John,</p><p>Thank you for your time today. I’m looking forward to keeping the conversation moving.</p><p>Best,</p><div className="signature-render" dangerouslySetInnerHTML={{ __html: html }} /></div>
    </div>
  </div>
}
