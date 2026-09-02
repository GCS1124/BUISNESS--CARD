import { useState } from 'react'
import { Check, Globe2, Image, Palette, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { useBranding } from './BrandingProvider'
import type { BrandingConfig } from '../lib/branding'

const colorFields: Array<{ key: 'primaryColor' | 'primaryDarkColor' | 'accentColor' | 'surfaceColor'; label: string; helper: string }> = [
  { key: 'primaryColor', label: 'Primary', helper: 'Buttons, links, and active states' },
  { key: 'primaryDarkColor', label: 'Primary dark', helper: 'Hover and emphasis states' },
  { key: 'accentColor', label: 'Accent', helper: 'Soft surfaces and highlights' },
  { key: 'surfaceColor', label: 'App surface', helper: 'Background tint across the workspace' },
]

const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value)

export function BrandingPage() {
  const { branding, updateBranding, resetBranding } = useBranding()
  const [saved, setSaved] = useState(false)

  const patch = (changes: Partial<BrandingConfig>) => {
    updateBranding(changes)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return <div className="branding-page">
    <header className="workspace-page-header branding-page-header">
      <div className="workspace-page-heading">
        <p className="eyebrow">Project identity</p>
        <h1>Make the whole experience yours.</h1>
        <p>White-label the workspace, sign-in screen, public cards, and email tools from one simple brand system.</p>
      </div>
      <span className="branding-save-state">{saved ? <><Check size={14} /> Saved</> : <><ShieldCheck size={14} /> Saved on this device</>}</span>
    </header>

    <div className="branding-layout">
      <div className="branding-settings-column">
        <section className="branding-panel">
          <div className="branding-panel-heading"><span className="branding-panel-icon"><Sparkles size={17} /></span><div><p className="eyebrow">Core identity</p><h2>What should people see?</h2><p>These details replace the default product identity across the app.</p></div></div>
          <div className="branding-form-grid">
            <label className="field-label">Product name<input value={branding.productName} onChange={(event) => patch({ productName: event.target.value })} placeholder="Acme Connect" maxLength={48} /></label>
            <label className="field-label">Short mark<input value={branding.shortName} onChange={(event) => patch({ shortName: event.target.value })} placeholder="A" maxLength={3} /></label>
            <label className="field-label branding-field-wide">Tagline<input value={branding.tagline} onChange={(event) => patch({ tagline: event.target.value })} placeholder="Digital identity, beautifully shared" maxLength={90} /></label>
            <label className="field-label branding-field-wide"><span className="branding-label-with-icon"><Globe2 size={13} /> Public link label</span><input value={branding.publicDomain} onChange={(event) => patch({ publicDomain: event.target.value })} placeholder="connect.acme.com" maxLength={120} /><small>Display label only. Add the matching custom domain in your hosting provider.</small></label>
          </div>
        </section>

        <section className="branding-panel">
          <div className="branding-panel-heading"><span className="branding-panel-icon"><Image size={17} /></span><div><p className="eyebrow">Brand assets</p><h2>Bring your visual signature.</h2><p>Use hosted image URLs so your logo and favicon stay available on every device.</p></div></div>
          <div className="branding-form-grid">
            <label className="field-label branding-field-wide">Logo URL<input type="url" value={branding.logoUrl} onChange={(event) => patch({ logoUrl: event.target.value })} placeholder="https://example.com/logo.png" /><small>Shown in navigation, authentication, and public pages.</small></label>
            <label className="field-label branding-field-wide">Favicon URL<input type="url" value={branding.faviconUrl} onChange={(event) => patch({ faviconUrl: event.target.value })} placeholder="https://example.com/favicon.png" /><small>Optional browser tab icon. Leave empty to use the generated mark.</small></label>
          </div>
        </section>

        <section className="branding-panel">
          <div className="branding-panel-heading"><span className="branding-panel-icon"><Palette size={17} /></span><div><p className="eyebrow">Color system</p><h2>Set the tone everywhere.</h2><p>Use six-digit hex colors for a consistent accessible interface.</p></div></div>
          <div className="branding-color-grid">{colorFields.map((field) => <label className="branding-color-field" key={field.key}><span>{field.label}</span><small>{field.helper}</small><span className="branding-color-control"><input type="color" value={isHex(branding[field.key]) ? branding[field.key] : '#165c51'} onChange={(event) => patch({ [field.key]: event.target.value })} /><input value={branding[field.key]} onChange={(event) => patch({ [field.key]: event.target.value })} aria-label={`${field.label} hex value`} /></span></label>)}</div>
          <label className="branding-toggle"><input type="checkbox" checked={branding.showPoweredBy} onChange={(event) => patch({ showPoweredBy: event.target.checked })} /><span><strong>Show “Powered by {branding.productName}”</strong><small>Keep this off for a completely white-labeled public experience.</small></span></label>
        </section>

        <div className="branding-actions"><button className="button button-ghost" onClick={resetBranding}><RotateCcw size={15} /> Restore defaults</button><span>Changes apply instantly to every surface.</span></div>
      </div>

      <aside className="branding-live-preview"><div className="branding-live-preview-top"><span className="eyebrow">Live preview</span><span className="branding-preview-status"><span /> In sync</span></div><div className="branding-preview-card" style={{ background: branding.surfaceColor }}><div className="branding-preview-nav"><span className="branding-preview-logo">{branding.logoUrl ? <img src={branding.logoUrl} alt="" /> : branding.shortName || branding.productName.slice(0, 1)}</span><strong>{branding.productName}</strong></div><div className="branding-preview-hero"><span className="branding-preview-kicker">Your digital identity</span><h2>Make a memorable introduction.</h2><p>{branding.tagline}</p><button style={{ background: branding.primaryColor }}>Create your card <span>→</span></button></div><div className="branding-preview-public"><div><span className="branding-preview-avatar" style={{ background: branding.primaryColor }}>AM</span><span><strong>Alex Morgan</strong><small>Creative strategist</small></span></div><span className="branding-preview-domain">{branding.publicDomain}/alex</span></div></div><p className="branding-preview-note">Your configured identity is reflected in authentication, navigation, builder, public cards, and exported experiences.</p></aside>
    </div>
  </div>
}
