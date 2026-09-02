import { Mail, Smartphone } from 'lucide-react'
import { generateEmailSignatureHtml } from '../lib/signatures'
import type { EmailSignature } from '../lib/types'

export function EmailSignaturePreview({ signature, mobile, businessCardUrl }: { signature: EmailSignature; mobile: boolean; businessCardUrl?: string }) {
  const html = generateEmailSignatureHtml(signature, businessCardUrl)
  return <div className={`signature-preview-shell ${mobile ? 'signature-preview-shell-mobile' : ''}`}>
    <div className="signature-preview-toolbar"><span><span className="preview-live-dot" /> Live preview</span><span className="preview-device-label">{mobile ? <Smartphone size={13} /> : <Mail size={13} />}{mobile ? 'Mobile' : 'Desktop'}</span></div>
    <div className="signature-email-window">
      <div className="signature-email-meta"><div><span>To</span><strong>recipient@example.com</strong></div><div><span>Subject</span><strong>Following up</strong></div></div>
      <div className="signature-email-message"><p>Hi there,</p><p>It was great connecting with you. I’d love to continue the conversation.</p><p>Best,</p><div className="signature-render" dangerouslySetInnerHTML={{ __html: html }} /></div>
    </div>
  </div>
}
