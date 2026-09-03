import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, Check, ChevronDown, Code2, Copy, Eye, FileSignature, Image, LayoutTemplate, Link2, LockKeyhole, Mail, Megaphone, Monitor, Paintbrush, Palette, Plus, Share2, Smartphone, Sparkles, Trash2, Upload, UserRound, X } from 'lucide-react'
import { EmailSignaturePreview } from './EmailSignaturePreview'
import { BrandLockup } from './BrandLockup'
import { applyBusinessCardSnapshot, generateEmailSignatureHtml, generateEmailSignatureText, signatureFieldConfig, signatureTemplateCategories, signatureTemplates, socialLinkConfig, templateBranding } from '../lib/signatures'
import { appPath } from '../lib/routing'
import type { AppUser, CardBundle, EmailSignature, SignatureBranding, SignatureContactDetails, SignatureCtaSettings, SignatureCtaType, SignatureSocialLinks } from '../lib/types'
import type { SignatureTemplateCategory } from '../lib/signatures'

interface EmailSignaturesPageProps {
  user?: AppUser
  bundles: CardBundle[]
  signatures: EmailSignature[]
  guestSignature?: EmailSignature | null
  initialSignatureId?: string | null
  saveState: 'saved' | 'saving' | 'error'
  saveError: string
  onCreate: () => EmailSignature
  onUpdate: (signature: EmailSignature) => void
  onGuestUpdate?: (signature: EmailSignature) => void
  onDuplicate: (signature: EmailSignature) => EmailSignature
  onDelete: (id: string) => Promise<void>
  onCards: () => void
  onTemplates: () => void
  onInsights: () => void
  onSignatures: () => void
  onBranding: () => void
  onSignOut: () => void
  onRequestAuth?: () => void
  onUploadAsset?: (file: File, kind: 'profile' | 'logo') => Promise<string | null>
  onToast: (message: string, tone?: 'success' | 'error') => void
}

type EditorSection = 'details' | 'template' | 'design' | 'social' | 'addons' | 'preview'

const sectionItems: Array<{ id: EditorSection; label: string; helper: string; icon: ReactNode }> = [
  { id: 'details', label: 'Details', helper: 'Your information', icon: <UserRound size={16} /> },
  { id: 'template', label: 'Template', helper: 'Choose a layout', icon: <LayoutTemplate size={16} /> },
  { id: 'design', label: 'Design', helper: 'Colors & type', icon: <Paintbrush size={16} /> },
  { id: 'social', label: 'Social', helper: 'Profiles & links', icon: <Share2 size={16} /> },
  { id: 'addons', label: 'Add-ons', helper: 'CTA & extras', icon: <Megaphone size={16} /> },
  { id: 'preview', label: 'Preview', helper: 'Ready to share', icon: <Eye size={16} /> },
]

const ctaOptions: Array<{ value: SignatureCtaType; label: string; helper: string }> = [
  { value: 'visit_website', label: 'Visit Website', helper: 'Send people to your main site.' },
  { value: 'book_meeting', label: 'Book a Meeting', helper: 'Add a scheduling or calendar link.' },
  { value: 'business_card', label: 'View Digital Business Card', helper: 'Connect your two Cardly products.' },
  { value: 'save_contact', label: 'Save Contact', helper: 'Use the email address as a contact action.' },
  { value: 'custom', label: 'Custom CTA', helper: 'Write your own label and destination.' },
]

const formatUpdated = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
const isValidEmail = (value: string) => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
const isValidUrl = (value: string) => !value.trim() || /^(https?:\/\/|www\.)[^\s]+$/i.test(value.trim())

export function EmailSignaturesPage({ user, bundles, signatures, guestSignature, initialSignatureId, saveState, saveError, onCreate, onUpdate, onGuestUpdate, onDuplicate, onDelete, onCards, onTemplates, onInsights, onSignatures, onBranding, onSignOut, onRequestAuth, onUploadAsset, onToast }: EmailSignaturesPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [readyId, setReadyId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState(false)
  const editingGuest = useMemo(() => guestSignature, [guestSignature])
  const selected = signatures.find((item) => item.id === selectedId)
  const readySignature = signatures.find((item) => item.id === readyId)

  useEffect(() => {
    if (selectedId && !signatures.some((item) => item.id === selectedId)) setSelectedId(null)
  }, [selectedId, signatures])

  useEffect(() => {
    if (initialSignatureId && user && signatures.some((item) => item.id === initialSignatureId)) setReadyId(initialSignatureId)
  }, [initialSignatureId, signatures, user])

  const createSignature = () => setSelectedId(onCreate().id)
  const duplicate = (signature: EmailSignature) => setSelectedId(onDuplicate(signature).id)
  const deleteSignature = async (id: string) => {
    await onDelete(id)
    setConfirmDeleteId(null)
    if (selectedId === id) setSelectedId(null)
    if (readyId === id) setReadyId(null)
  }
  const businessCardUrlFor = (signature: EmailSignature) => {
    const bundle = bundles.find((item) => item.card.id === signature.linkedBusinessCardId)
    return bundle ? `${window.location.origin}${appPath(`/card/${bundle.card.slug}`)}` : ''
  }
  const copySignature = async (signature: EmailSignature, rawHtml = false) => {
    try {
      const html = generateEmailSignatureHtml(signature, businessCardUrlFor(signature))
      const text = generateEmailSignatureText(signature)
      if (!rawHtml && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })])
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(rawHtml ? html : text)
      else throw new Error('Clipboard is not available in this browser.')
      onToast(rawHtml ? 'Email-safe HTML copied' : 'Signature copied — paste it into your email settings')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not copy the signature.', 'error')
    }
  }

  if (!user) {
    if (!editingGuest) return null
    return <div className="signature-guest-page"><GuestSignatureHeader onReset={() => onGuestUpdate?.({ ...editingGuest, contactDetails: { ...editingGuest.contactDetails, fullName: '', jobTitle: '', department: '', companyName: '', email: '', phoneNumber: '', mobileNumber: '', website: '', officeAddress: '' }, socialLinks: { linkedin: '', facebook: '', instagram: '', twitter: '', youtube: '', github: '', whatsapp: '' }, profileImageUrl: '', companyLogoUrl: '', ctaSettings: { ...editingGuest.ctaSettings, enabled: false } })} onRequestAuth={onRequestAuth} /><SignatureEditor signature={editingGuest} bundles={bundles} saveState={saveState} saveError={saveError} mobilePreview={mobilePreview} onMobilePreview={setMobilePreview} isGuest onUpdate={(next) => onGuestUpdate?.(next)} onBack={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onDuplicate={() => undefined} onDelete={() => undefined} onFinish={onRequestAuth} onRequestAuth={onRequestAuth} onToast={onToast} onUploadAsset={onUploadAsset} /></div>
  }

  if (readySignature) return <div className="dashboard-layout"><SignatureSidebar active="signatures" user={user} onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onSignOut={onSignOut} /><main className="dashboard-main workspace-page-main signature-page-main"><ReadySignatureScreen signature={readySignature} bundles={bundles} onEdit={() => setReadyId(null)} onCopy={() => void copySignature(readySignature)} onCopyHtml={() => void copySignature(readySignature, true)} onToast={onToast} /></main><SignatureMobileNav active="signatures" onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onCreate={createSignature} /></div>

  if (selected) return <div className="signature-editor-workspace"><SignatureSidebar active="signatures" user={user} onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onSignOut={onSignOut} /><SignatureEditor signature={selected} bundles={bundles} saveState={saveState} saveError={saveError} mobilePreview={mobilePreview} onMobilePreview={setMobilePreview} onUpdate={onUpdate} onBack={() => setSelectedId(null)} onDuplicate={() => duplicate(selected)} onDelete={() => setConfirmDeleteId(selected.id)} onFinish={() => setReadyId(selected.id)} onUploadAsset={onUploadAsset} onToast={onToast} /></div>

  return <div className="dashboard-layout"><SignatureSidebar active="signatures" user={user} onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onSignOut={onSignOut} /><main className="dashboard-main workspace-page-main signature-page-main"><div className="mobile-workspace-bar"><BrandLockup /><button className="mobile-workspace-actions mobile-signature-new" onClick={createSignature} aria-label="Create signature"><Plus size={16} /></button></div><header className="workspace-page-header signature-page-header"><div className="workspace-page-heading"><p className="eyebrow">Email Signature Generator</p><h1>My signatures, ready for every inbox.</h1><p>Create once, then take a polished, email-safe sign-off to Gmail, Outlook, Apple Mail, Yahoo, and iPhone.</p></div><button className="button button-primary" onClick={createSignature}><Plus size={16} /> Create signature</button></header><div className="signature-page-toolbar"><div className="signature-toolbar-copy"><FileSignature size={18} /><span><strong>{signatures.length}</strong> {signatures.length === 1 ? 'signature' : 'signatures'} in your workspace</span></div><span className="signature-toolbar-note">Dedicated email-safe HTML · independent from Digital Business Cards</span></div>{signatures.length ? <div className="signature-list">{signatures.map((signature) => <SignatureListCard key={signature.id} signature={signature} onEdit={() => setSelectedId(signature.id)} onDuplicate={() => duplicate(signature)} onDelete={() => setConfirmDeleteId(signature.id)} onCopy={() => void copySignature(signature)} onInstall={() => setReadyId(signature.id)} />)}</div> : <SignatureEmptyState onCreate={createSignature} />}{confirmDeleteId && <DeleteSignatureDialog onCancel={() => setConfirmDeleteId(null)} onConfirm={() => void deleteSignature(confirmDeleteId)} />}</main><SignatureMobileNav active="signatures" onCards={onCards} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onCreate={createSignature} /></div>
}

function GuestSignatureHeader({ onReset, onRequestAuth }: { onReset: () => void; onRequestAuth?: () => void }) {
  return <header className="signature-guest-header"><div className="signature-guest-brand"><BrandLockup /><span className="signature-guest-divider" /><div><p className="eyebrow">Email Signature Generator</p><strong>Create your professional email signature</strong></div></div><div className="signature-guest-actions"><button className="button button-ghost" onClick={onReset}><X size={14} /> Reset</button>{onRequestAuth && <button className="button button-ghost" onClick={onRequestAuth}>Sign in to save</button>}</div></header>
}

function SignatureEditor({ signature, bundles, saveState, saveError, mobilePreview, onMobilePreview, isGuest = false, onUpdate, onBack, onDuplicate, onDelete, onFinish, onRequestAuth, onUploadAsset, onToast }: { signature: EmailSignature; bundles: CardBundle[]; saveState: 'saved' | 'saving' | 'error'; saveError: string; mobilePreview: boolean; onMobilePreview: (mobile: boolean) => void; isGuest?: boolean; onUpdate: (signature: EmailSignature) => void; onBack: () => void; onDuplicate: () => void; onDelete: () => void; onFinish?: () => void; onRequestAuth?: () => void; onUploadAsset?: (file: File, kind: 'profile' | 'logo') => Promise<string | null>; onToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [activeSection, setActiveSection] = useState<EditorSection>('details')
  const [copying, setCopying] = useState<'rich' | 'html' | null>(null)
  const [activeSocialKeys, setActiveSocialKeys] = useState<Array<keyof SignatureSocialLinks>>(() => (Object.keys(signature.socialLinks) as Array<keyof SignatureSocialLinks>).filter((key) => Boolean(signature.socialLinks[key].trim())))
  const [uploading, setUploading] = useState<'profile' | 'logo' | null>(null)
  const businessCardUrl = useMemo(() => {
    const bundle = bundles.find((item) => item.card.id === signature.linkedBusinessCardId)
    return bundle ? `${window.location.origin}${appPath(`/card/${bundle.card.slug}`)}` : ''
  }, [bundles, signature.linkedBusinessCardId])
  const html = useMemo(() => generateEmailSignatureHtml(signature, businessCardUrl), [signature, businessCardUrl])
  const patch = (changes: Partial<EmailSignature>) => onUpdate({ ...signature, ...changes, updatedAt: new Date().toISOString() })
  const patchContact = (key: keyof SignatureContactDetails, value: string) => patch({ contactDetails: { ...signature.contactDetails, [key]: value } })
  const patchSocial = (key: keyof SignatureSocialLinks, value: string) => patch({ socialLinks: { ...signature.socialLinks, [key]: value } })
  const patchBranding = (changes: Partial<SignatureBranding>) => patch({ branding: { ...signature.branding, ...changes } })
  const patchCta = (changes: Partial<SignatureCtaSettings>) => patch({ ctaSettings: { ...signature.ctaSettings, ...changes } })
  const importBundle = (bundle: CardBundle) => {
    const next = applyBusinessCardSnapshot({ ...signature, updatedAt: new Date().toISOString() }, bundle)
    setActiveSocialKeys((Object.keys(next.socialLinks) as Array<keyof SignatureSocialLinks>).filter((key) => Boolean(next.socialLinks[key].trim())))
    onUpdate(next)
    onToast('Business card details imported as an editable snapshot')
  }
  const handleAsset = async (file: File, kind: 'profile' | 'logo') => {
    setUploading(kind)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      patch(kind === 'profile' ? { profileImageUrl: dataUrl } : { companyLogoUrl: dataUrl })
      const remoteUrl = await onUploadAsset?.(file, kind)
      if (remoteUrl) patch(kind === 'profile' ? { profileImageUrl: remoteUrl } : { companyLogoUrl: remoteUrl })
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not add that image.', 'error')
    } finally {
      setUploading(null)
    }
  }
  const copyHtml = async (kind: 'rich' | 'html') => {
    setCopying(kind)
    try {
      const plainText = generateEmailSignatureText(signature)
      if (kind === 'rich' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([plainText], { type: 'text/plain' }) })])
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(kind === 'html' ? html : plainText)
      else throw new Error('Clipboard is not available in this browser.')
      onToast(kind === 'rich' ? 'Signature copied — paste it directly into your email settings' : 'Email-safe HTML source copied')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not copy the signature.', 'error')
    } finally {
      window.setTimeout(() => setCopying(null), 600)
    }
  }
  const selectSection = (section: EditorSection) => {
    setActiveSection(section)
    if (section === 'preview') onMobilePreview(false)
  }
  const finish = () => {
    if (!signature.contactDetails.fullName.trim()) { onToast('Add your full name before continuing.', 'error'); setActiveSection('details'); return }
    if (!isValidEmail(signature.contactDetails.email)) { onToast('Check the email address before continuing.', 'error'); setActiveSection('details'); return }
    const cta = signature.ctaSettings
    if (cta.enabled) {
      if (cta.url && !isValidUrl(cta.url)) { onToast('Use a complete URL for your call to action.', 'error'); setActiveSection('addons'); return }
      if (cta.type === 'save_contact' && !signature.contactDetails.email.trim()) { onToast('Add an email address for the Save Contact button.', 'error'); setActiveSection('details'); return }
      if ((cta.type === 'book_meeting' || cta.type === 'custom') && !cta.url.trim()) { onToast('Add a destination URL for your call to action.', 'error'); setActiveSection('addons'); return }
      if (cta.type === 'visit_website' && !cta.url.trim() && !signature.contactDetails.website.trim()) { onToast('Add a website URL for the call to action.', 'error'); setActiveSection('addons'); return }
      if (cta.type === 'business_card' && !cta.url.trim() && !businessCardUrl) { onToast('Link a business card before using this button.', 'error'); setActiveSection('details'); return }
    }
    onFinish?.()
  }
  const addSocial = (key: keyof SignatureSocialLinks) => setActiveSocialKeys((current) => current.includes(key) ? current : [...current, key])
  const removeSocial = (key: keyof SignatureSocialLinks) => { setActiveSocialKeys((current) => current.filter((item) => item !== key)); patchSocial(key, '') }
  const currentCard = bundles.find((item) => item.card.id === signature.linkedBusinessCardId) ?? bundles[0]

  return <div className="signature-editor-page"><header className="signature-editor-header"><div className="signature-editor-title"><button className="icon-button" onClick={onBack} aria-label={isGuest ? 'Scroll to top' : 'Back to email signatures'}><ArrowLeft size={18} /></button><div><p className="eyebrow">{isGuest ? 'Start free · no login required' : 'Email signature'}</p><input className="signature-name-input" value={signature.name} onChange={(event) => patch({ name: event.target.value })} aria-label="Signature name" /><span className="signature-save-status">{saveState === 'saving' ? 'Saving…' : saveState === 'error' ? saveError || 'Error saving' : isGuest ? 'Saved in this browser' : 'Saved'}</span></div></div><div className="signature-editor-actions"><button className="button button-ghost" onClick={() => void copyHtml('rich')}><Copy size={15} /> {copying === 'rich' ? 'Copied' : 'Copy'}</button>{!isGuest && <><button className="button button-ghost" onClick={onDuplicate}><Copy size={15} /> Duplicate</button><button className="button button-danger-ghost" onClick={onDelete}><Trash2 size={15} /> Delete</button></>}{onFinish && <button className="button button-primary signature-finish-button" onClick={finish}>{isGuest ? 'Get my signature' : 'Install signature'} <Check size={15} /></button>}</div></header><div className="signature-editor-layout"><div className="signature-editor-left"><SignatureSectionNav active={activeSection} onSelect={selectSection} /><section className="signature-editor-panel" aria-label="Signature editor">{activeSection === 'details' && <DetailsSection signature={signature} bundles={bundles} currentCard={currentCard} onPatchContact={patchContact} onPatch={patch} onImport={importBundle} onRequestAuth={onRequestAuth} onAsset={handleAsset} uploading={uploading} />}{activeSection === 'template' && <TemplateSection signature={signature} onSelect={(templateId) => patch({ templateId, branding: templateBranding(templateId, signature.branding) })} />}{activeSection === 'design' && <DesignSection branding={signature.branding} onPatch={patchBranding} />}{activeSection === 'social' && <SocialSection links={signature.socialLinks} activeKeys={activeSocialKeys} onAdd={addSocial} onRemove={removeSocial} onChange={patchSocial} />}{activeSection === 'addons' && <AddonsSection cta={signature.ctaSettings} onPatch={patchCta} businessCardAvailable={Boolean(currentCard)} />}{activeSection === 'preview' && <PreviewFocusSection onPreview={() => onMobilePreview(false)} />}</section><div className="signature-editor-footer-cta"><div><p className="eyebrow">{isGuest ? 'Your signature is ready when you are' : 'Ready to publish'}</p><strong>{isGuest ? 'Finish your details, then save it to your workspace.' : 'Take this signature everywhere.'}</strong></div><button className="button button-primary" onClick={finish}>{isGuest ? 'Get my signature' : 'Install signature'} <ArrowLeft size={15} className="rotate-180" /></button></div><div className="signature-copy-panel"><div><p className="eyebrow">Export safely</p><h2>Copy it into your inbox.</h2><p>The preview is for the web. Copy actions use dedicated table-based HTML with inline styles.</p></div><div className="signature-copy-actions"><button className="button button-soft" onClick={() => void copyHtml('rich')}><Copy size={15} /> {copying === 'rich' ? 'Copied' : 'Copy Signature'}</button><button className="button button-ghost" onClick={() => void copyHtml('html')}><Code2 size={15} /> {copying === 'html' ? 'Copied' : 'Copy HTML'}</button></div></div><SignatureSetupHelp /></div><aside className={`signature-preview-column ${mobilePreview ? 'signature-preview-column-mobile-focus' : ''}`}><div className="signature-preview-heading"><div><h2>Signature Preview</h2><p>Pick your favorite layout from the numbers below</p></div></div><EmailSignaturePreview signature={signature} mobile={mobilePreview} businessCardUrl={businessCardUrl} onBrandingChange={patchBranding} /><div className="signature-preview-note"><Upload size={15} /><span>{signature.profileImageUrl?.startsWith('data:') || signature.companyLogoUrl?.startsWith('data:') ? 'Local images preview here and are uploaded after you save your signature.' : 'For copied email HTML, images must use absolute HTTPS URLs for email-client compatibility.'}</span></div></aside></div></div>
}

function SignatureSectionNav({ active, onSelect }: { active: EditorSection; onSelect: (section: EditorSection) => void }) {
  return <nav className="signature-section-nav" aria-label="Signature editor sections"><div className="signature-section-nav-intro"><p className="eyebrow">Build your signature</p><strong>Make it sound like you.</strong></div>{sectionItems.map((item) => <button key={item.id} className={active === item.id ? 'signature-section-link signature-section-link-active' : 'signature-section-link'} onClick={() => onSelect(item.id)} aria-current={active === item.id ? 'step' : undefined}><span className="signature-section-icon">{item.icon}</span><span><strong>{item.label}</strong><small>{item.helper}</small></span><ChevronDown size={14} className="signature-section-chevron" /></button>)}</nav>
}

function DetailsSection({ signature, bundles, currentCard, onPatchContact, onPatch, onImport, onRequestAuth, onAsset, uploading }: { signature: EmailSignature; bundles: CardBundle[]; currentCard?: CardBundle; onPatchContact: (key: keyof SignatureContactDetails, value: string) => void; onPatch: (changes: Partial<EmailSignature>) => void; onImport: (bundle: CardBundle) => void; onRequestAuth?: () => void; onAsset: (file: File, kind: 'profile' | 'logo') => Promise<void>; uploading: 'profile' | 'logo' | null }) {
  return <div className="signature-section-content"><SectionIntro eyebrow="Details" title="Start with the essentials." description="Add the information people need to recognize you and get in touch. You can hide any optional field." /><SignatureSubsection eyebrow="Personal" title="Your identity"><div className="signature-field-list">{signatureFieldConfig.slice(0, 3).map((field) => <SignatureField key={field.key} field={field} value={signature.contactDetails[field.key]} visible={signature.visibleFields[field.key] !== false} onChange={(value) => onPatchContact(field.key, value)} onToggle={() => onPatch({ visibleFields: { ...signature.visibleFields, [field.key]: signature.visibleFields[field.key] === false } })} />)}</div></SignatureSubsection><SignatureSubsection eyebrow="Company" title="Work details"><div className="signature-field-list">{signatureFieldConfig.slice(3).map((field) => <SignatureField key={field.key} field={field} value={signature.contactDetails[field.key]} visible={signature.visibleFields[field.key] !== false} onChange={(value) => onPatchContact(field.key, value)} onToggle={() => onPatch({ visibleFields: { ...signature.visibleFields, [field.key]: signature.visibleFields[field.key] === false } })} />)}</div></SignatureSubsection><SignatureSubsection eyebrow="Images" title="Add your face and a second image"><p className="signature-section-help">Upload a profile photo first. The executive template repeats it in the second slot until you add a company logo or another photo.</p><div className="signature-asset-fields"><AssetInput icon={<UserRound size={15} />} label="Profile photo" value={signature.profileImageUrl} onChange={(value) => onPatch({ profileImageUrl: value })} onFile={(file) => void onAsset(file, 'profile')} uploading={uploading === 'profile'} /><AssetInput icon={<Image size={15} />} label="Second photo or logo" value={signature.companyLogoUrl} onChange={(value) => onPatch({ companyLogoUrl: value })} onFile={(file) => void onAsset(file, 'logo')} uploading={uploading === 'logo'} /></div></SignatureSubsection><SignatureSubsection eyebrow="Use a saved card" title="Bring over business card details">{bundles.length ? <div className="signature-import-row"><select value={signature.linkedBusinessCardId || bundles[0].card.id} onChange={(event) => { const bundle = bundles.find((item) => item.card.id === event.target.value); if (bundle) onImport(bundle) }} aria-label="Choose a business card"><option value="" disabled>Choose a card</option>{bundles.map((bundle) => <option value={bundle.card.id} key={bundle.card.id}>{bundle.card.cardName}</option>)}</select><button className="button button-soft" onClick={() => onImport(currentCard ?? bundles[0])}><Sparkles size={14} /> Use details</button></div> : onRequestAuth ? <button className="signature-auth-prompt" onClick={onRequestAuth}><LockKeyhole size={15} /><span><strong>Sign in to use your business card</strong><small>Your card data stays separate from this signature.</small></span><ArrowLeft size={14} className="rotate-180" /></button> : <p className="signature-inline-note">Create a digital card first to import its details.</p>}</SignatureSubsection></div>
}

function TemplateSection({ signature, onSelect }: { signature: EmailSignature; onSelect: (templateId: string) => void }) {
  const [category, setCategory] = useState<'all' | SignatureTemplateCategory>('all')
  const filteredTemplates = category === 'all' ? signatureTemplates : signatureTemplates.filter((template) => template.category === category)
  const activeCategory = signatureTemplateCategories.find((item) => item.id === category) ?? signatureTemplateCategories[0]
  return <div className="signature-section-content"><SectionIntro eyebrow="Template" title="Choose a layout with a point of view." description="Start with the exact two-image reference, or explore the expanded set of layouts below. Your details, links, and add-ons stay exactly where you left them." /><div className="signature-template-library-bar"><div><p className="eyebrow">Signature library</p><strong>{filteredTemplates.length} {filteredTemplates.length === 1 ? 'layout' : 'layouts'}</strong></div><span>{activeCategory.helper} · Click any card to apply it instantly.</span></div><div className="signature-template-category-tabs" role="tablist" aria-label="Filter signature templates">{signatureTemplateCategories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)} role="tab" aria-selected={category === item.id}>{item.label}<small>{item.id === 'all' ? signatureTemplates.length : signatureTemplates.filter((template) => template.category === item.id).length}</small></button>)}</div><div className="signature-template-picker signature-template-picker-rich">{filteredTemplates.map((template) => <button className={`signature-template-option ${signature.templateId === template.id ? 'signature-template-option-active' : ''}`} key={template.id} onClick={() => onSelect(template.id)}><TemplateMiniPreview template={template} signature={signature} /><span className="signature-template-copy"><strong>{template.name}</strong><small>{template.description}</small></span>{signature.templateId === template.id && <Check size={15} />}</button>)}</div></div>
}

const templateDemoPhoto = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80'
const templateDemoLogo = 'https://dummyimage.com/240x240/000000/ffffff.png&text=MW'

function TemplateMiniPreview({ template, signature }: { template: typeof signatureTemplates[number]; signature: EmailSignature }) {
  const photo = signature.profileImageUrl || templateDemoPhoto
  const logo = signature.companyLogoUrl || templateDemoLogo
  const photoLayout = template.branding.layout === 'photo-left' || template.branding.layout === 'photo-right' || template.id === 'executive'
  return <span className={`signature-template-mini-preview signature-template-mini-preview-${template.branding.layout ?? 'standard'}`} style={{ background: template.swatches[1] }}><span className="signature-template-mini-images"><img src={photo} alt="" /><img src={logo} alt="" /></span><span className="signature-template-mini-copy"><strong>Taylor Maxwell</strong><small>{photoLayout ? 'CEO' : 'CEO · Maxwell Inc'}</small>{photoLayout && <small>Maxwell Inc</small>}</span><span className="signature-template-mini-rule" style={{ background: template.swatches[0] }} /><span className="signature-template-mini-details"><i style={{ background: template.swatches[0] }} /><i style={{ background: template.swatches[0] }} /><i style={{ background: template.swatches[0] }} /></span></span>
}

function DesignSection({ branding, onPatch }: { branding: SignatureBranding; onPatch: (changes: Partial<SignatureBranding>) => void }) {
  const colors: Array<{ key: keyof Pick<SignatureBranding, 'primaryColor' | 'textColor' | 'secondaryTextColor' | 'accentColor' | 'iconColor' | 'dividerColor' | 'ctaColor'>; label: string; helper: string }> = [
    { key: 'primaryColor', label: 'Primary', helper: 'Name and links' },
    { key: 'textColor', label: 'Text', helper: 'Main information' },
    { key: 'secondaryTextColor', label: 'Secondary text', helper: 'Supporting details' },
    { key: 'accentColor', label: 'Accent', helper: 'Soft surfaces' },
    { key: 'iconColor', label: 'Icon', helper: 'Social profiles' },
    { key: 'dividerColor', label: 'Divider', helper: 'Separator line' },
    { key: 'ctaColor', label: 'CTA', helper: 'Button border' },
  ]
  return <div className="signature-section-content"><SectionIntro eyebrow="Design" title="Make the signature feel unmistakably yours." description="These defaults come from Cardly’s existing theme. Keep the hierarchy calm, or tune every small detail." /><SignatureSubsection eyebrow="Colors" title="Set the tone"><div className="signature-color-grid">{colors.map((color) => <ColorInput key={color.key} label={color.label} helper={color.helper} value={branding[color.key]} onChange={(value) => onPatch({ [color.key]: value })} />)}</div></SignatureSubsection><SignatureSubsection eyebrow="Type" title="Keep it email-safe"><div className="signature-design-form-grid"><label className="signature-select-label">Font family<select value={branding.fontFamily} onChange={(event) => onPatch({ fontFamily: event.target.value })}><option>Arial</option><option>Verdana</option><option>Tahoma</option><option>Trebuchet MS</option><option>Georgia</option><option>Times New Roman</option></select></label><RangeInput label="Name size" value={branding.nameSize} min={16} max={32} onChange={(value) => onPatch({ nameSize: value })} /><RangeInput label="Details size" value={branding.detailsSize} min={10} max={20} onChange={(value) => onPatch({ detailsSize: value })} /><RangeInput label="Job title size" value={branding.jobTitleSize} min={11} max={24} onChange={(value) => onPatch({ jobTitleSize: value })} /></div></SignatureSubsection><SignatureSubsection eyebrow="Layout" title="Tune the rhythm"><div className="signature-range-grid"><RangeInput label="Spacing" value={branding.spacing} min={8} max={32} onChange={(value) => onPatch({ spacing: value })} /><RangeInput label="Photo size" value={branding.photoSize} min={48} max={140} onChange={(value) => onPatch({ photoSize: value })} /><RangeInput label="Logo size" value={branding.logoSize} min={48} max={160} onChange={(value) => onPatch({ logoSize: value })} /><RangeInput label="Icon size" value={branding.iconSize} min={10} max={18} onChange={(value) => onPatch({ iconSize: value })} /><RangeInput label="Divider thickness" value={branding.dividerThickness} min={1} max={4} onChange={(value) => onPatch({ dividerThickness: value })} /></div><div className="signature-design-form-grid"><SelectInput label="Image shape" value={branding.imageShape} options={['circle', 'rounded', 'square']} onChange={(value) => onPatch({ imageShape: value as SignatureBranding['imageShape'] })} /><SelectInput label="Divider style" value={branding.dividerStyle} options={['solid', 'dashed', 'dotted']} onChange={(value) => onPatch({ dividerStyle: value as SignatureBranding['dividerStyle'] })} /><SelectInput label="Icon shape" value={branding.iconShape} options={['circle', 'rounded', 'square']} onChange={(value) => onPatch({ iconShape: value as SignatureBranding['iconShape'] })} /><SelectInput label="Icon style" value={branding.iconStyle} options={['text', 'filled', 'outline']} onChange={(value) => onPatch({ iconStyle: value as SignatureBranding['iconStyle'] })} /><SelectInput label="Alignment" value={branding.alignment} options={['left', 'center', 'right']} onChange={(value) => onPatch({ alignment: value as SignatureBranding['alignment'] })} /><SelectInput label="Button style" value={branding.buttonStyle} options={['solid', 'soft', 'outline']} onChange={(value) => onPatch({ buttonStyle: value as SignatureBranding['buttonStyle'] })} /></div><label className="signature-toggle-row"><span><input type="checkbox" checked={branding.showDivider} onChange={(event) => onPatch({ showDivider: event.target.checked })} /> Show divider</span></label></SignatureSubsection></div>
}

function SocialSection({ links, activeKeys, onAdd, onRemove, onChange }: { links: SignatureSocialLinks; activeKeys: Array<keyof SignatureSocialLinks>; onAdd: (key: keyof SignatureSocialLinks) => void; onRemove: (key: keyof SignatureSocialLinks) => void; onChange: (key: keyof SignatureSocialLinks, value: string) => void }) {
  const available = socialLinkConfig.filter((field) => !activeKeys.includes(field.key))
  return <div className="signature-section-content"><SectionIntro eyebrow="Social" title="Stay connected beyond the inbox." description="Only profiles you add appear in the final signature. Use full URLs or handles that resolve to a public profile." /><div className="signature-social-list">{activeKeys.map((key) => { const field = socialLinkConfig.find((item) => item.key === key); if (!field) return null; return <div className="signature-social-row" key={field.key}><span className="signature-social-badge"><Link2 size={14} /></span><label><strong>{field.label}</strong><input value={links[field.key]} onChange={(event) => onChange(field.key, event.target.value)} placeholder={field.placeholder} aria-label={`${field.label} URL`} /></label><button type="button" className="icon-button icon-button-danger" onClick={() => onRemove(field.key)} aria-label={`Remove ${field.label}`}><X size={14} /></button></div> })}</div>{available.length ? <label className="signature-add-social"><Plus size={15} /><span><strong>Add a social profile</strong><small>LinkedIn, Instagram, YouTube, GitHub, and more.</small></span><select value="" onChange={(event) => { if (event.target.value) onAdd(event.target.value as keyof SignatureSocialLinks) }} aria-label="Add social profile"><option value="">Choose platform</option>{available.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}</select></label> : <p className="signature-inline-note">You’ve added every available profile.</p>}</div>
}

function AddonsSection({ cta, onPatch, businessCardAvailable }: { cta: SignatureCtaSettings; onPatch: (changes: Partial<SignatureCtaSettings>) => void; businessCardAvailable: boolean }) {
  const selectedCta = ctaOptions.find((option) => option.value === cta.type) ?? ctaOptions[0]
  return <div className="signature-section-content"><SectionIntro eyebrow="Add-ons / CTA" title="Give people an obvious next step." description="Keep the sign-off useful. Start with one strong action, then add a little context only when it earns its space." /><SignatureSubsection eyebrow="Primary action" title="Call to action"><label className="signature-feature-toggle"><input type="checkbox" checked={cta.enabled} onChange={(event) => onPatch({ enabled: event.target.checked })} /><span><strong>Add a button to my signature</strong><small>{selectedCta.helper}</small></span></label>{cta.enabled && <div className="signature-cta-fields"><label className="signature-select-label">Button type<select value={cta.type} onChange={(event) => { const option = ctaOptions.find((item) => item.value === event.target.value); onPatch({ type: event.target.value as SignatureCtaType, label: option?.label ?? cta.label }) }}><option value="visit_website">Visit Website</option><option value="book_meeting">Book a Meeting</option><option value="business_card" disabled={!businessCardAvailable}>View Digital Business Card</option><option value="save_contact">Save Contact</option><option value="custom">Custom CTA</option></select></label><label className="signature-select-label">Button label<input value={cta.label} onChange={(event) => onPatch({ label: event.target.value })} placeholder="Book a meeting" /></label>{cta.type !== 'save_contact' && <label className="signature-select-label">Destination URL<input type="url" value={cta.url} onChange={(event) => onPatch({ url: event.target.value })} placeholder={cta.type === 'business_card' ? 'Uses your linked business card' : 'https://yourdomain.com/book'} />{cta.url && !isValidUrl(cta.url) && <small className="signature-validation-error-static">Use a complete URL, for example https://yourdomain.com</small>}</label>}<SelectInput label="Button style" value={cta.style} options={['solid', 'soft', 'outline']} onChange={(value) => onPatch({ style: value as SignatureCtaSettings['style'] })} /></div>}</SignatureSubsection><SignatureSubsection eyebrow="Optional context" title="Add a little more"><label className="signature-textarea-label">Banner or eco message<textarea value={cta.bannerText} onChange={(event) => onPatch({ bannerText: event.target.value })} placeholder="A small note, offer, or sustainability message" rows={2} /></label><label className="signature-textarea-label">Custom text or quote<textarea value={cta.customText} onChange={(event) => onPatch({ customText: event.target.value })} placeholder="A short line that adds personality" rows={2} /></label><label className="signature-textarea-label">Disclaimer<textarea value={cta.disclaimer} onChange={(event) => onPatch({ disclaimer: event.target.value })} placeholder="This email and any attachments are confidential." rows={2} /></label></SignatureSubsection></div>
}

function PreviewFocusSection({ onPreview }: { onPreview: () => void }) {
  return <div className="signature-preview-focus"><div className="signature-preview-focus-icon"><Eye size={20} /></div><p className="eyebrow">Preview</p><h2>Keep your eye on the finish.</h2><p>The live email preview stays beside your controls on larger screens and becomes the first view on mobile.</p><button className="button button-soft" onClick={onPreview}><Monitor size={15} /> Show desktop preview</button></div>
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="signature-section-intro"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>
}

function SignatureSubsection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="signature-subsection"><div className="signature-subsection-heading"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div><span /></div>{children}</section>
}

function SignatureField({ field, value, visible, onChange, onToggle }: { field: typeof signatureFieldConfig[number]; value: string; visible: boolean; onChange: (value: string) => void; onToggle: () => void }) {
  return <label className={`signature-field ${!visible ? 'signature-field-hidden' : ''}`}><span className="signature-field-label"><strong>{field.label}</strong><small>{field.helper}</small></span><input className="signature-form-input" type={field.type ?? 'text'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} aria-label={field.label} />{field.key !== 'fullName' && <button type="button" className="signature-visibility-toggle" onClick={onToggle}>{visible ? 'Hide' : 'Show'}</button>}{field.key === 'email' && value && !isValidEmail(value) && <small className="signature-validation-error">Enter a valid email address</small>}</label>
}

function ColorInput({ label, helper, value, onChange }: { label: string; helper: string; value: string; onChange: (value: string) => void }) {
  return <label className="signature-color-input"><span><strong>{label}</strong><small>{helper}</small></span><div><input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#165c51'} onChange={(event) => onChange(event.target.value)} /><input value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} color`} /></div></label>
}

function RangeInput({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="signature-range-input"><span>{label}<strong>{value}px</strong></span><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="signature-select-label">{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replace(/(^|-)(\w)/g, (_, separator, character) => `${separator ? ' ' : ''}${character.toUpperCase()}`)}</option>)}</select></label>
}

function AssetInput({ icon, label, value, onChange, onFile, uploading }: { icon: ReactNode; label: string; value: string; onChange: (value: string) => void; onFile: (file: File) => void; uploading: boolean }) {
  return <div className="signature-asset-input"><span>{icon}{label}</span><input type="url" value={value.startsWith('data:') ? '' : value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." /><label className="signature-file-button"><Upload size={13} /> {uploading ? 'Adding…' : 'Upload image'}<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); event.currentTarget.value = '' }} /></label></div>
}

function SignatureSetupHelp() {
  const [provider, setProvider] = useState('Gmail')
  const instructions: Record<string, string> = {
    Gmail: 'Open Settings → See all settings → General. Find Signature, create a new one, then paste the copied signature into the editor.',
    Outlook: 'Open Settings → Mail → Compose and reply. Paste the copied signature into the email signature editor and save.',
    'Apple Mail': 'In Mail, open Settings → Signatures, choose your account, and paste the copied signature into a signature block.',
    Yahoo: 'Open Settings → More Settings → Writing email. Paste your signature into the signature editor and save.',
    iPhone: 'Open Settings → Mail → Signature on iPhone, then paste the copied signature into the account field.',
  }
  return <section className="signature-setup-help"><div><p className="eyebrow">Install help</p><h2>Add it to your inbox.</h2></div><div className="signature-setup-tabs" role="tablist" aria-label="Email provider setup"><div>{Object.keys(instructions).map((item) => <button key={item} className={provider === item ? 'active' : ''} onClick={() => setProvider(item)} role="tab" aria-selected={provider === item}>{item}</button>)}</div></div><p>{instructions[provider]}</p></section>
}

function ReadySignatureScreen({ signature, bundles, onEdit, onCopy, onCopyHtml, onToast }: { signature: EmailSignature; bundles: CardBundle[]; onEdit: () => void; onCopy: () => void; onCopyHtml: () => void; onToast: (message: string, tone?: 'success' | 'error') => void }) {
  const businessCard = bundles.find((bundle) => bundle.card.id === signature.linkedBusinessCardId)
  return <div className="signature-ready-page"><div className="mobile-workspace-bar"><BrandLockup /><button className="mobile-overview-link" onClick={onEdit}><ArrowLeft size={14} /> Edit</button></div><header className="signature-ready-header"><div><p className="eyebrow">Signature ready</p><h1>Your email signature is ready.</h1><p>Copy the formatted version into your provider, or keep editing the details and style.</p></div><div className="signature-ready-actions"><button className="button button-primary" onClick={onCopy}><Copy size={15} /> Copy Signature</button><button className="button button-ghost" onClick={onCopyHtml}><Code2 size={15} /> Copy HTML</button><button className="button button-ghost" onClick={onEdit}>Edit signature</button></div></header><div className="signature-ready-grid"><section><div className="signature-ready-preview-label"><span className="preview-live-dot" /> Live preview</div><EmailSignaturePreview signature={signature} mobile={false} businessCardUrl={businessCard ? `${window.location.origin}${appPath(`/card/${businessCard.card.slug}`)}` : ''} /><div className="signature-ready-note"><Check size={15} /> Your saved signature uses email-safe table markup and inline styles.</div></section><aside><SignatureSetupHelp /><div className="signature-ready-next"><p className="eyebrow">Next best move</p><h2>Make it part of every introduction.</h2><p>Install it once, then let every email carry the same polished first impression.</p><button className="button button-soft" onClick={() => onToast('Installation instructions are ready above')}>I’m ready to install <ArrowLeft size={14} className="rotate-180" /></button></div></aside></div></div>
}

function SignatureListCard({ signature, onEdit, onDuplicate, onDelete, onCopy, onInstall }: { signature: EmailSignature; onEdit: () => void; onDuplicate: () => void; onDelete: () => void; onCopy: () => void; onInstall: () => void }) {
  const name = signature.contactDetails.fullName || 'Your name'
  const identity = [signature.contactDetails.jobTitle, signature.contactDetails.companyName].filter(Boolean).join(' · ') || 'Add your details'
  return <article className="signature-list-card"><button className="signature-list-preview" onClick={onEdit}><div className="signature-list-preview-top"><span className="signature-list-brand-dot" style={{ background: signature.branding.primaryColor }} /><span>{signatureTemplates.find((template) => template.id === signature.templateId)?.name ?? 'Custom'} template</span><span className="signature-status-pill">{signature.isActive ? 'Active' : 'Draft'}</span></div><div className="signature-list-preview-content"><div className="signature-list-avatar" style={{ background: signature.branding.accentColor, color: signature.branding.primaryColor }}>{signature.profileImageUrl ? <img src={signature.profileImageUrl} alt="" /> : name.slice(0, 1).toUpperCase()}</div><div><strong style={{ color: signature.branding.primaryColor }}>{name}</strong><span>{identity}</span><small>{signature.contactDetails.email || 'Add an email address'}</small></div></div></button><div className="signature-list-details"><div><p className="eyebrow">{signature.name}</p><h2>{identity}</h2><span>Updated {formatUpdated(signature.updatedAt)}</span></div><div className="signature-list-actions"><button className="button button-ghost" onClick={onEdit}>Edit</button><button className="button button-soft" onClick={onInstall}><Eye size={14} /> Preview</button><button className="icon-button" onClick={onCopy} aria-label={`Copy ${signature.name}`}><Copy size={15} /></button><button className="icon-button" onClick={onDuplicate} aria-label={`Duplicate ${signature.name}`}><Copy size={15} /></button><button className="icon-button icon-button-danger" onClick={onDelete} aria-label={`Delete ${signature.name}`}><Trash2 size={15} /></button></div></div></article>
}

function SignatureEmptyState({ onCreate }: { onCreate: () => void }) {
  return <div className="signature-empty-state"><div className="signature-empty-icon"><Mail size={22} /></div><p className="eyebrow">A better sign-off starts here</p><h2>One signature, every inbox.</h2><p>Build your first email-safe signature with your details, social links, brand styling, and a call to action.</p><div className="signature-empty-template-row">{signatureTemplates.slice(0, 5).map((template) => <span key={template.id} style={{ background: `linear-gradient(135deg, ${template.swatches[0]}, ${template.swatches[1]})` }} />)}</div><button className="button button-primary" onClick={onCreate}><Plus size={16} /> Create your first signature</button></div>
}

function DeleteSignatureDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="dialog-backdrop"><div className="confirm-dialog signature-confirm-dialog"><div className="confirm-dialog-icon"><Trash2 size={18} /></div><h2>Delete this signature?</h2><p>This removes the signature from your workspace. Copied signatures already in your inboxes won’t be affected.</p><div className="confirm-dialog-actions"><button className="button button-ghost" onClick={onCancel}>Keep it</button><button className="button button-danger" onClick={onConfirm}>Delete signature</button></div></div></div>
}

type SignatureWorkspaceSection = 'cards' | 'templates' | 'insights' | 'signatures' | 'branding'

function SignatureSidebar({ active, user, onCards, onTemplates, onInsights, onSignatures, onBranding, onSignOut }: { active: SignatureWorkspaceSection; user: AppUser; onCards: () => void; onTemplates: () => void; onInsights: () => void; onSignatures: () => void; onBranding: () => void; onSignOut: () => void }) {
  return <aside className="sidebar"><BrandLockup /><div className="sidebar-label">Workspace</div><nav className="sidebar-nav" aria-label="Workspace navigation"><button className={`sidebar-link ${active === 'cards' ? 'sidebar-link-active' : ''}`} onClick={onCards}><FileSignature size={17} /> My cards</button><button className={`sidebar-link ${active === 'templates' ? 'sidebar-link-active' : ''}`} onClick={onTemplates}><Sparkles size={17} /> Templates</button><button className={`sidebar-link ${active === 'signatures' ? 'sidebar-link-active' : ''}`} onClick={onSignatures}><Mail size={17} /> Email signatures</button><button className={`sidebar-link ${active === 'insights' ? 'sidebar-link-active' : ''}`} onClick={onInsights}><Palette size={17} /> Insights</button><button className={`sidebar-link ${active === 'branding' ? 'sidebar-link-active' : ''}`} onClick={onBranding}><Palette size={17} /> Branding</button></nav><div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={16} /><p><strong>Make it yours.</strong><span>Bring your digital identity into every email.</span></p></div><button className="user-menu" onClick={onSignOut}><span className="avatar-small">{user.name.slice(0, 1).toUpperCase()}</span><span className="user-menu-copy"><strong>{user.name}</strong><span>{user.email}</span></span></button></div></aside>
}

function SignatureMobileNav({ active, onCards, onTemplates, onInsights, onSignatures, onBranding, onCreate }: { active: SignatureWorkspaceSection; onCards: () => void; onTemplates: () => void; onInsights: () => void; onSignatures: () => void; onBranding: () => void; onCreate: () => void }) {
  return <nav className="mobile-bottom-nav signature-mobile-nav" aria-label="Mobile workspace navigation"><button className={`mobile-bottom-link ${active === 'cards' ? 'mobile-bottom-link-active' : ''}`} onClick={onCards}><FileSignature size={16} /><span>Cards</span></button><button className={`mobile-bottom-link ${active === 'templates' ? 'mobile-bottom-link-active' : ''}`} onClick={onTemplates}><Sparkles size={16} /><span>Templates</span></button><button className={`mobile-bottom-link ${active === 'signatures' ? 'mobile-bottom-link-active' : ''}`} onClick={onSignatures}><Mail size={16} /><span>Signatures</span></button><button className={`mobile-bottom-link ${active === 'insights' ? 'mobile-bottom-link-active' : ''}`} onClick={onInsights}><Palette size={16} /><span>Insights</span></button><button className={`mobile-bottom-link ${active === 'branding' ? 'mobile-bottom-link-active' : ''}`} onClick={onBranding}><Palette size={16} /><span>Branding</span></button><button className="mobile-bottom-create" onClick={onCreate}><span><Plus size={18} /></span><small>New</small></button></nav>
}

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read that image.')); reader.readAsDataURL(file) })
