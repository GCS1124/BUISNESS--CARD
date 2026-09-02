import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, Check, Code2, Copy, FileSignature, Image, Link2, Mail, Monitor, Palette, Plus, Smartphone, Sparkles, Trash2, Upload, UserRound } from 'lucide-react'
import { EmailSignaturePreview } from './EmailSignaturePreview'
import { applyBusinessCardSnapshot, generateEmailSignatureHtml, signatureFieldConfig, signatureTemplates, socialLinkConfig, templateBranding } from '../lib/signatures'
import type { AppUser, CardBundle, EmailSignature, SignatureContactDetails, SignatureCtaType, SignatureSocialLinks } from '../lib/types'

interface EmailSignaturesPageProps {
  user: AppUser
  bundles: CardBundle[]
  signatures: EmailSignature[]
  saveState: 'saved' | 'saving' | 'error'
  saveError: string
  onCreate: () => EmailSignature
  onUpdate: (signature: EmailSignature) => void
  onDuplicate: (signature: EmailSignature) => EmailSignature
  onDelete: (id: string) => Promise<void>
  onCards: () => void
  onTemplates: () => void
  onInsights: () => void
  onSignatures: () => void
  onSignOut: () => void
  onToast: (message: string, tone?: 'success' | 'error') => void
}

const ctaOptions: Array<{ value: SignatureCtaType; label: string }> = [
  { value: 'save_contact', label: 'Save Contact' },
  { value: 'visit_website', label: 'Visit Website' },
  { value: 'book_meeting', label: 'Book a Meeting' },
  { value: 'business_card', label: 'View Digital Business Card' },
]

const formatUpdated = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
const isValidEmail = (value: string) => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export function EmailSignaturesPage({ user, bundles, signatures, saveState, saveError, onCreate, onUpdate, onDuplicate, onDelete, onCards, onTemplates, onInsights, onSignatures, onSignOut, onToast }: EmailSignaturesPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const selected = signatures.find((item) => item.id === selectedId)

  useEffect(() => {
    if (selectedId && !signatures.some((item) => item.id === selectedId)) setSelectedId(null)
  }, [selectedId, signatures])

  const createSignature = () => setSelectedId(onCreate().id)
  const updateSelected = (next: EmailSignature) => onUpdate(next)
  const duplicate = (signature: EmailSignature) => setSelectedId(onDuplicate(signature).id)
  const deleteSignature = async (id: string) => {
    await onDelete(id)
    setConfirmDeleteId(null)
    if (selectedId === id) setSelectedId(null)
  }

  if (selected) return <SignatureEditor signature={selected} user={user} bundles={bundles} saveState={saveState} saveError={saveError} mobilePreview={mobilePreview} onMobilePreview={setMobilePreview} onUpdate={updateSelected} onBack={() => setSelectedId(null)} onDuplicate={() => duplicate(selected)} onDelete={() => setConfirmDeleteId(selected.id)} onToast={onToast} />

  return <div className="dashboard-layout">
    <SignatureSidebar active="signatures" user={user} onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onSignOut={onSignOut} />
    <main className="dashboard-main workspace-page-main signature-page-main">
      <div className="mobile-workspace-bar"><div className="brand"><span className="brand-mark">c</span><span>cardly</span></div><button className="mobile-workspace-actions mobile-signature-new" onClick={createSignature}><Plus size={16} /></button></div>
      <header className="workspace-page-header signature-page-header"><div className="workspace-page-heading"><p className="eyebrow">Workspace tool</p><h1>Email signatures that sound like you.</h1><p>Create a polished, email-safe signature once, then take it with you to Gmail, Outlook, and every introduction after.</p></div><button className="button button-primary" onClick={createSignature}><Plus size={16} /> Create signature</button></header>
      <div className="signature-page-toolbar"><div className="signature-toolbar-copy"><FileSignature size={18} /><span><strong>{signatures.length}</strong> {signatures.length === 1 ? 'signature' : 'signatures'} in your workspace</span></div><span className="signature-toolbar-note">Tables, inline styles, no external CSS</span></div>
      {signatures.length ? <div className="signature-list">{signatures.map((signature) => <SignatureListCard key={signature.id} signature={signature} onEdit={() => setSelectedId(signature.id)} onDuplicate={() => duplicate(signature)} onDelete={() => setConfirmDeleteId(signature.id)} />)}</div> : <SignatureEmptyState onCreate={createSignature} />}
      {confirmDeleteId && <DeleteSignatureDialog onCancel={() => setConfirmDeleteId(null)} onConfirm={() => void deleteSignature(confirmDeleteId)} />}
    </main>
    <SignatureMobileNav active="signatures" onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onCreate={createSignature} />
  </div>
}

function SignatureEditor({ signature, user, bundles, saveState, saveError, mobilePreview, onMobilePreview, onUpdate, onBack, onDuplicate, onDelete, onToast }: { signature: EmailSignature; user: AppUser; bundles: CardBundle[]; saveState: 'saved' | 'saving' | 'error'; saveError: string; mobilePreview: boolean; onMobilePreview: (mobile: boolean) => void; onUpdate: (signature: EmailSignature) => void; onBack: () => void; onDuplicate: () => void; onDelete: () => void; onToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [copying, setCopying] = useState<'rich' | 'html' | null>(null)
  const businessCardUrl = useMemo(() => {
    const bundle = bundles.find((item) => item.card.id === signature.linkedBusinessCardId)
    return bundle ? `${window.location.origin}/card/${bundle.card.slug}` : ''
  }, [bundles, signature.linkedBusinessCardId])
  const html = useMemo(() => generateEmailSignatureHtml(signature, businessCardUrl), [signature, businessCardUrl])
  const patch = (changes: Partial<EmailSignature>) => onUpdate({ ...signature, ...changes, updatedAt: new Date().toISOString() })
  const patchContact = (key: keyof SignatureContactDetails, value: string) => patch({ contactDetails: { ...signature.contactDetails, [key]: value } })
  const patchSocial = (key: keyof SignatureSocialLinks, value: string) => patch({ socialLinks: { ...signature.socialLinks, [key]: value } })
  const importBundle = (bundle: CardBundle) => {
    onUpdate(applyBusinessCardSnapshot({ ...signature, updatedAt: new Date().toISOString() }, bundle))
    onToast('Business card details imported as a snapshot')
  }
  const copyHtml = async (kind: 'rich' | 'html') => {
    setCopying(kind)
    try {
      if (kind === 'rich' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const blob = new Blob([html], { type: 'text/html' })
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([html.replace(/<[^>]+>/g, ' ')], { type: 'text/plain' }) })])
      } else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(html)
      else throw new Error('Clipboard is not available in this browser.')
      onToast(kind === 'rich' ? 'Signature copied — paste it directly into your email settings' : 'HTML source copied')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not copy the signature.', 'error')
    } finally {
      window.setTimeout(() => setCopying(null), 500)
    }
  }
  return <div className="signature-editor-page">
    <header className="signature-editor-header"><div className="signature-editor-title"><button className="icon-button" onClick={onBack} aria-label="Back to email signatures"><ArrowLeft size={18} /></button><div><p className="eyebrow">Email signature</p><input className="signature-name-input" value={signature.name} onChange={(event) => patch({ name: event.target.value })} aria-label="Signature name" /><span className="signature-save-status">{saveState === 'saving' ? 'Saving…' : saveState === 'error' ? saveError || 'Error saving' : 'Saved'}</span></div></div><div className="signature-editor-actions"><button className="button button-ghost" onClick={onDuplicate}><Copy size={15} /> Duplicate</button><button className="button button-danger-ghost" onClick={onDelete}><Trash2 size={15} /> Delete</button></div></header>
    <div className="signature-editor-layout">
      <section className="signature-controls" aria-label="Signature controls">
        <SignatureControlSection eyebrow="Start with a template" title="Choose your layout"><div className="signature-template-picker">{signatureTemplates.map((template) => <button className={`signature-template-option ${signature.templateId === template.id ? 'signature-template-option-active' : ''}`} key={template.id} onClick={() => patch({ templateId: template.id, branding: templateBranding(template.id, signature.branding) })}><span className="signature-template-swatch" style={{ background: `linear-gradient(135deg, ${template.swatches[0]} 0 50%, ${template.swatches[1]} 50%)` }} /><span><strong>{template.name}</strong><small>{template.description}</small></span>{signature.templateId === template.id && <Check size={15} />}</button>)}</div></SignatureControlSection>
        <SignatureControlSection eyebrow="Import once" title="Use your business card details"><p className="signature-section-help">Import a snapshot to get started. Changes here stay independent from your digital card.</p>{bundles.length ? <div className="signature-import-row"><select value={signature.linkedBusinessCardId || bundles[0].card.id} onChange={(event) => { const bundle = bundles.find((item) => item.card.id === event.target.value); if (bundle) importBundle(bundle) }} aria-label="Choose a business card"><option value="" disabled>Choose a card</option>{bundles.map((bundle) => <option value={bundle.card.id} key={bundle.card.id}>{bundle.card.cardName}</option>)}</select><button className="button button-soft" onClick={() => importBundle(bundles.find((item) => item.card.id === signature.linkedBusinessCardId) ?? bundles[0])}><Sparkles size={14} /> Import</button></div> : <p className="signature-inline-note">Create a digital card first to import its details.</p>}</SignatureControlSection>
        <SignatureControlSection eyebrow="Your details" title="Contact information"><div className="signature-field-list">{signatureFieldConfig.map((field) => <SignatureField key={field.key} field={field} value={signature.contactDetails[field.key]} visible={signature.visibleFields[field.key] !== false} onChange={(value) => patchContact(field.key, value)} onToggle={() => patch({ visibleFields: { ...signature.visibleFields, [field.key]: signature.visibleFields[field.key] === false } })} />)}</div></SignatureControlSection>
        <SignatureControlSection eyebrow="Stay connected" title="Social links"><div className="signature-social-grid">{socialLinkConfig.map((field) => <label className="signature-social-field" key={field.key}><span>{field.label}</span><div className="signature-input-with-icon"><Link2 size={14} /><input value={signature.socialLinks[field.key]} onChange={(event) => patchSocial(field.key, event.target.value)} placeholder={field.placeholder} /></div></label>)}</div></SignatureControlSection>
        <SignatureControlSection eyebrow="Make it yours" title="Branding"><div className="signature-branding-grid"><ColorInput label="Primary" value={signature.branding.primaryColor} onChange={(value) => patch({ branding: { ...signature.branding, primaryColor: value } })} /><ColorInput label="Soft accent" value={signature.branding.accentColor} onChange={(value) => patch({ branding: { ...signature.branding, accentColor: value } })} /><ColorInput label="Text" value={signature.branding.textColor} onChange={(value) => patch({ branding: { ...signature.branding, textColor: value } })} /></div><label className="signature-select-label">Font<select value={signature.branding.fontFamily} onChange={(event) => patch({ branding: { ...signature.branding, fontFamily: event.target.value } })}><option>Arial</option><option>Helvetica</option><option>Georgia</option><option>Verdana</option><option>Tahoma</option><option>Trebuchet MS</option></select></label><div className="signature-range-grid"><RangeInput label="Font size" value={signature.branding.fontSize} min={11} max={18} onChange={(value) => patch({ branding: { ...signature.branding, fontSize: value } })} /><RangeInput label="Spacing" value={signature.branding.spacing} min={8} max={28} onChange={(value) => patch({ branding: { ...signature.branding, spacing: value } })} /><RangeInput label="Photo size" value={signature.branding.photoSize} min={48} max={120} onChange={(value) => patch({ branding: { ...signature.branding, photoSize: value } })} /><RangeInput label="Logo size" value={signature.branding.logoSize} min={48} max={140} onChange={(value) => patch({ branding: { ...signature.branding, logoSize: value } })} /></div><div className="signature-asset-fields"><AssetInput icon={<UserRound size={15} />} label="Profile photo URL" value={signature.profileImageUrl} onChange={(value) => patch({ profileImageUrl: value })} /><AssetInput icon={<Image size={15} />} label="Company logo URL" value={signature.companyLogoUrl} onChange={(value) => patch({ companyLogoUrl: value })} /></div><div className="signature-toggle-row"><label><input type="checkbox" checked={signature.branding.showDivider} onChange={(event) => patch({ branding: { ...signature.branding, showDivider: event.target.checked } })} /> Show divider</label><label><input type="checkbox" checked={signature.branding.alignment === 'center'} onChange={(event) => patch({ branding: { ...signature.branding, alignment: event.target.checked ? 'center' : 'left' } })} /> Center align</label></div></SignatureControlSection>
        <SignatureControlSection eyebrow="Next step" title="Call to action"><label className="signature-toggle-row signature-cta-enable"><span><input type="checkbox" checked={signature.ctaSettings.enabled} onChange={(event) => patch({ ctaSettings: { ...signature.ctaSettings, enabled: event.target.checked } })} /> Add a button to my signature</span></label>{signature.ctaSettings.enabled && <div className="signature-cta-fields"><label className="signature-select-label">Button<select value={signature.ctaSettings.type} onChange={(event) => patch({ ctaSettings: { ...signature.ctaSettings, type: event.target.value as SignatureCtaType, label: ctaOptions.find((item) => item.value === event.target.value)?.label ?? signature.ctaSettings.label } })}>{ctaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="signature-select-label">Button label<input value={signature.ctaSettings.label} onChange={(event) => patch({ ctaSettings: { ...signature.ctaSettings, label: event.target.value } })} placeholder="Visit my website" /></label>{signature.ctaSettings.type !== 'save_contact' && <label className="signature-select-label">Destination URL<input type="url" value={signature.ctaSettings.url} onChange={(event) => patch({ ctaSettings: { ...signature.ctaSettings, url: event.target.value } })} placeholder={signature.ctaSettings.type === 'business_card' ? 'Uses your linked card URL' : 'https://yourdomain.com/book'} /></label>}</div>}</SignatureControlSection>
        <div className="signature-copy-panel"><div><p className="eyebrow">Ready to use</p><h2>Take it everywhere.</h2><p>Copy the formatted version into your email provider, or grab the raw source for your developer.</p></div><div className="signature-copy-actions"><button className="button button-primary" onClick={() => void copyHtml('rich')}><Copy size={15} /> {copying === 'rich' ? 'Copied' : 'Copy Signature'}</button><button className="button button-ghost" onClick={() => void copyHtml('html')}><Code2 size={15} /> {copying === 'html' ? 'Copied' : 'Copy HTML'}</button></div></div>
        <SignatureSetupHelp />
      </section>
      <aside className="signature-preview-column"><div className="signature-preview-heading"><div><p className="eyebrow">Preview in context</p><h2>See exactly what you’ll paste.</h2></div><div className="signature-device-toggle"><button className={!mobilePreview ? 'active' : ''} onClick={() => onMobilePreview(false)} aria-label="Desktop preview"><Monitor size={14} /></button><button className={mobilePreview ? 'active' : ''} onClick={() => onMobilePreview(true)} aria-label="Mobile preview"><Smartphone size={14} /></button></div></div><EmailSignaturePreview signature={signature} mobile={mobilePreview} businessCardUrl={businessCardUrl} /><div className="signature-preview-note"><Upload size={15} /><span>For images in the final HTML, use absolute HTTPS URLs. Local or temporary URLs are intentionally excluded for email-client compatibility.</span></div></aside>
    </div>
  </div>
}

function SignatureControlSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="signature-control-section"><div className="signature-section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><Palette size={16} /></div>{children}</section>
}

function SignatureField({ field, value, visible, onChange, onToggle }: { field: typeof signatureFieldConfig[number]; value: string; visible: boolean; onChange: (value: string) => void; onToggle: () => void }) {
  return <label className={`signature-field ${!visible ? 'signature-field-hidden' : ''}`}><span className="signature-field-label"><strong>{field.label}</strong><small>{field.helper}</small></span><input className="signature-form-input" type={field.type ?? 'text'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} aria-label={field.label} />{field.key !== 'fullName' && <button type="button" className="signature-visibility-toggle" onClick={onToggle}>{visible ? 'Hide' : 'Show'}</button>}{field.key === 'email' && value && !isValidEmail(value) && <small className="signature-validation-error">Enter a valid email address</small>}</label>
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="signature-color-input"><span>{label}</span><div><input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#183a35'} onChange={(event) => onChange(event.target.value)} /><input value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} color`} /></div></label>
}

function RangeInput({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="signature-range-input"><span>{label}<strong>{value}px</strong></span><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function AssetInput({ icon, label, value, onChange }: { icon: ReactNode; label: string; value: string; onChange: (value: string) => void }) {
  return <label className="signature-asset-input"><span>{icon}{label}</span><input type="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." /></label>
}

function SignatureSetupHelp() {
  const [provider, setProvider] = useState('Gmail')
  const instructions: Record<string, string> = {
    Gmail: 'Open Settings → See all settings → General. Find Signature, create a new one, then paste the copied signature into the editor.',
    Outlook: 'Open Settings → Mail → Compose and reply. Paste the copied signature into the email signature editor and save.',
    'Apple Mail': 'In Mail, open Settings → Signatures, choose your account, and paste the copied signature into a signature block.',
    iPhone: 'On iPhone, copy the signature, then open Settings → Mail → Signature and paste it into the account field.',
  }
  return <section className="signature-setup-help"><div><p className="eyebrow">Setup help</p><h2>Add it to your inbox.</h2></div><div className="signature-setup-tabs" role="tablist" aria-label="Email provider setup"><div>{Object.keys(instructions).map((item) => <button key={item} className={provider === item ? 'active' : ''} onClick={() => setProvider(item)} role="tab" aria-selected={provider === item}>{item}</button>)}</div></div><p>{instructions[provider]}</p></section>
}

function SignatureListCard({ signature, onEdit, onDuplicate, onDelete }: { signature: EmailSignature; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const name = signature.contactDetails.fullName || 'Your name'
  const identity = [signature.contactDetails.jobTitle, signature.contactDetails.companyName].filter(Boolean).join(' · ') || 'Add your details'
  return <article className="signature-list-card"><button className="signature-list-preview" onClick={onEdit}><div className="signature-list-preview-top"><span className="signature-list-brand-dot" style={{ background: signature.branding.primaryColor }} /><span>{signatureTemplates.find((template) => template.id === signature.templateId)?.name ?? 'Custom'} template</span><span className="signature-status-pill">{signature.isActive ? 'Active' : 'Draft'}</span></div><div className="signature-list-preview-content"><div className="signature-list-avatar" style={{ background: signature.branding.accentColor, color: signature.branding.primaryColor }}>{signature.profileImageUrl ? <img src={signature.profileImageUrl} alt="" /> : name.slice(0, 1).toUpperCase()}</div><div><strong style={{ color: signature.branding.primaryColor }}>{name}</strong><span>{identity}</span><small>{signature.contactDetails.email || 'hello@yourdomain.com'}</small></div></div></button><div className="signature-list-details"><div><p className="eyebrow">{signature.name}</p><h2>{identity}</h2><span>Updated {formatUpdated(signature.updatedAt)}</span></div><div className="signature-list-actions"><button className="button button-ghost" onClick={onEdit}>Edit</button><button className="icon-button" onClick={onDuplicate} aria-label={`Duplicate ${signature.name}`}><Copy size={15} /></button><button className="icon-button icon-button-danger" onClick={onDelete} aria-label={`Delete ${signature.name}`}><Trash2 size={15} /></button></div></div></article>
}

function SignatureEmptyState({ onCreate }: { onCreate: () => void }) {
  return <div className="signature-empty-state"><div className="signature-empty-icon"><Mail size={22} /></div><p className="eyebrow">A better sign-off starts here</p><h2>One signature, every inbox.</h2><p>Build your first email-safe signature with your details, social links, brand styling, and a call to action.</p><div className="signature-empty-template-row">{signatureTemplates.slice(0, 4).map((template) => <span key={template.id} style={{ background: `linear-gradient(135deg, ${template.swatches[0]}, ${template.swatches[1]})` }} />)}</div><button className="button button-primary" onClick={onCreate}><Plus size={16} /> Create your first signature</button></div>
}

function DeleteSignatureDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="dialog-backdrop"><div className="confirm-dialog signature-confirm-dialog"><div className="confirm-dialog-icon"><Trash2 size={18} /></div><h2>Delete this signature?</h2><p>This removes the signature from your workspace. Copied signatures already in your inboxes won’t be affected.</p><div className="confirm-dialog-actions"><button className="button button-ghost" onClick={onCancel}>Keep it</button><button className="button button-danger" onClick={onConfirm}>Delete signature</button></div></div></div>
}

type SignatureWorkspaceSection = 'cards' | 'templates' | 'insights' | 'signatures'

function SignatureSidebar({ active, user, onCards, onTemplates, onInsights, onSignatures, onSignOut }: { active: SignatureWorkspaceSection; user: AppUser; onCards: () => void; onTemplates: () => void; onInsights: () => void; onSignatures: () => void; onSignOut: () => void }) {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">c</span><span>cardly</span></div><div className="sidebar-label">Workspace</div><nav className="sidebar-nav" aria-label="Workspace navigation"><button className={`sidebar-link ${active === 'cards' ? 'sidebar-link-active' : ''}`} onClick={onCards}><FileSignature size={17} /> My cards</button><button className={`sidebar-link ${active === 'templates' ? 'sidebar-link-active' : ''}`} onClick={onTemplates}><Sparkles size={17} /> Templates</button><button className={`sidebar-link ${active === 'signatures' ? 'sidebar-link-active' : ''}`} onClick={onSignatures}><Mail size={17} /> Email signatures</button><button className={`sidebar-link ${active === 'insights' ? 'sidebar-link-active' : ''}`} onClick={onInsights}><Palette size={17} /> Insights</button></nav><div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={16} /><p><strong>Make it yours.</strong><span>Bring your digital identity into every email.</span></p></div><button className="user-menu" onClick={onSignOut}><span className="avatar-small">{user.name.slice(0, 1).toUpperCase()}</span><span className="user-menu-copy"><strong>{user.name}</strong><span>{user.email}</span></span></button></div></aside>
}

function SignatureMobileNav({ active, onCards, onTemplates, onInsights, onSignatures, onCreate }: { active: SignatureWorkspaceSection; onCards: () => void; onTemplates: () => void; onInsights: () => void; onSignatures: () => void; onCreate: () => void }) {
  return <nav className="mobile-bottom-nav signature-mobile-nav" aria-label="Mobile workspace navigation"><button className={`mobile-bottom-link ${active === 'cards' ? 'mobile-bottom-link-active' : ''}`} onClick={onCards}><FileSignature size={16} /><span>Cards</span></button><button className={`mobile-bottom-link ${active === 'templates' ? 'mobile-bottom-link-active' : ''}`} onClick={onTemplates}><Sparkles size={16} /><span>Templates</span></button><button className={`mobile-bottom-link ${active === 'signatures' ? 'mobile-bottom-link-active' : ''}`} onClick={onSignatures}><Mail size={16} /><span>Signatures</span></button><button className={`mobile-bottom-link ${active === 'insights' ? 'mobile-bottom-link-active' : ''}`} onClick={onInsights}><Palette size={16} /><span>Insights</span></button><button className="mobile-bottom-create" onClick={onCreate}><span><Plus size={18} /></span><small>New</small></button></nav>
}
