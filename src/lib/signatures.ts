import { makeId } from './storage'
import type { AppUser, CardBundle, EmailSignature, SignatureBranding, SignatureContactDetails, SignatureCtaSettings, SignatureSocialLinks } from './types'

export const signatureTemplates: Array<{ id: string; name: string; description: string; swatches: string[]; branding: Partial<SignatureBranding> }> = [
  { id: 'minimal', name: 'Minimal', description: 'Quiet, compact, and easy to scan.', swatches: ['#183a35', '#dceee7'], branding: { primaryColor: '#183a35', accentColor: '#dceee7', textColor: '#17312d', alignment: 'left', showDivider: false, buttonStyle: 'outline', iconStyle: 'text' } },
  { id: 'classic', name: 'Classic', description: 'A dependable layout for everyday work.', swatches: ['#1f2937', '#d3a84f'], branding: { primaryColor: '#1f2937', accentColor: '#d3a84f', textColor: '#25313b', alignment: 'left', showDivider: true, buttonStyle: 'solid', iconStyle: 'filled' } },
  { id: 'modern', name: 'Modern', description: 'A confident color block with a crisp rhythm.', swatches: ['#5b4ae5', '#eeeafd'], branding: { primaryColor: '#5b4ae5', accentColor: '#eeeafd', textColor: '#2d2854', alignment: 'left', showDivider: true, buttonStyle: 'soft', iconStyle: 'outline' } },
  { id: 'corporate', name: 'Corporate', description: 'Structured, polished, and presentation-ready.', swatches: ['#0d4f66', '#d7edf3'], branding: { primaryColor: '#0d4f66', accentColor: '#d7edf3', textColor: '#193541', alignment: 'left', showDivider: true, buttonStyle: 'solid', iconStyle: 'filled' } },
  { id: 'profile-photo', name: 'Profile Photo', description: 'Put a human face at the center of the introduction.', swatches: ['#9a4b36', '#fae5d8'], branding: { primaryColor: '#9a4b36', accentColor: '#fae5d8', textColor: '#432c27', alignment: 'left', showDivider: false, buttonStyle: 'soft', iconStyle: 'outline', photoSize: 72 } },
  { id: 'logo-focused', name: 'Logo Focused', description: 'Make your company identity lead the way.', swatches: ['#522a70', '#eadcf4'], branding: { primaryColor: '#522a70', accentColor: '#eadcf4', textColor: '#35233f', alignment: 'left', showDivider: true, buttonStyle: 'outline', iconStyle: 'text', logoSize: 96 } },
]

export const signatureFieldConfig: Array<{ key: keyof SignatureContactDetails; label: string; helper: string; placeholder: string; type?: 'email' | 'url' | 'tel' }> = [
  { key: 'fullName', label: 'Full name', helper: 'The name recipients should remember', placeholder: 'Alex Morgan' },
  { key: 'jobTitle', label: 'Job title', helper: 'Your role or specialty', placeholder: 'Creative strategist' },
  { key: 'department', label: 'Department', helper: 'Team, practice, or division', placeholder: 'Brand & communications' },
  { key: 'companyName', label: 'Company', helper: 'Where you work', placeholder: 'Northstar Studio' },
  { key: 'phoneNumber', label: 'Phone', helper: 'A direct line', placeholder: '+1 415 555 0128', type: 'tel' },
  { key: 'mobileNumber', label: 'Mobile', helper: 'Your mobile number', placeholder: '+1 415 555 0128', type: 'tel' },
  { key: 'email', label: 'Email', helper: 'Your professional email', placeholder: 'hello@yourdomain.com', type: 'email' },
  { key: 'website', label: 'Website', helper: 'A website recipients can visit', placeholder: 'https://yourdomain.com', type: 'url' },
  { key: 'officeAddress', label: 'Office address', helper: 'Optional postal address', placeholder: '123 Market Street, San Francisco' },
]

export const socialLinkConfig: Array<{ key: keyof SignatureSocialLinks; label: string; placeholder: string }> = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/yourcompany' },
  { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/yourname' },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'x.com/yourname' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@yourcompany' },
  { key: 'github', label: 'GitHub', placeholder: 'github.com/yourname' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'wa.me/14155550128' },
]

export const defaultSignatureBranding: SignatureBranding = {
  primaryColor: '#183a35',
  accentColor: '#dceee7',
  textColor: '#17312d',
  fontFamily: 'Arial',
  fontSize: 14,
  logoSize: 72,
  photoSize: 72,
  spacing: 16,
  showDivider: false,
  iconStyle: 'text',
  buttonStyle: 'outline',
  alignment: 'left',
}

const emptyContactDetails: SignatureContactDetails = {
  fullName: '',
  jobTitle: '',
  department: '',
  companyName: '',
  phoneNumber: '',
  mobileNumber: '',
  email: '',
  website: '',
  officeAddress: '',
}

const emptySocialLinks: SignatureSocialLinks = {
  linkedin: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  github: '',
  whatsapp: '',
}

const emptyCtaSettings: SignatureCtaSettings = {
  enabled: false,
  type: 'visit_website',
  label: 'Visit my website',
  url: '',
}

const text = (value: unknown) => typeof value === 'string' ? value : ''

export function normalizeSignature(value: Partial<EmailSignature>): EmailSignature {
  const now = new Date().toISOString()
  const visibleFields = { ...Object.fromEntries(Object.keys(emptyContactDetails).map((key) => [key, true])), ...(value.visibleFields ?? {}) }
  return {
    id: text(value.id) || makeId(),
    userId: text(value.userId),
    name: text(value.name) || 'Untitled signature',
    templateId: text(value.templateId) || 'minimal',
    contactDetails: { ...emptyContactDetails, ...(value.contactDetails ?? {}) },
    visibleFields,
    socialLinks: { ...emptySocialLinks, ...(value.socialLinks ?? {}) },
    branding: { ...defaultSignatureBranding, ...(value.branding ?? {}) },
    ctaSettings: { ...emptyCtaSettings, ...(value.ctaSettings ?? {}) },
    profileImageUrl: text(value.profileImageUrl),
    companyLogoUrl: text(value.companyLogoUrl),
    linkedBusinessCardId: text(value.linkedBusinessCardId),
    isActive: value.isActive !== false,
    createdAt: text(value.createdAt) || now,
    updatedAt: text(value.updatedAt) || now,
  }
}

const fieldValue = (bundle: CardBundle, ...types: string[]) => bundle.fields.find((field) => types.includes(field.fieldType) && field.value.trim())?.value.trim() ?? ''

export function applyBusinessCardSnapshot(signature: EmailSignature, bundle: CardBundle): EmailSignature {
  const contactDetails: SignatureContactDetails = {
    fullName: fieldValue(bundle, 'name') || signature.contactDetails.fullName,
    jobTitle: fieldValue(bundle, 'job_title') || signature.contactDetails.jobTitle,
    department: fieldValue(bundle, 'department') || signature.contactDetails.department,
    companyName: fieldValue(bundle, 'company') || signature.contactDetails.companyName,
    phoneNumber: fieldValue(bundle, 'phone') || signature.contactDetails.phoneNumber,
    mobileNumber: fieldValue(bundle, 'mobile') || signature.contactDetails.mobileNumber,
    email: fieldValue(bundle, 'email') || signature.contactDetails.email,
    website: fieldValue(bundle, 'website', 'company_url') || signature.contactDetails.website,
    officeAddress: fieldValue(bundle, 'address') || signature.contactDetails.officeAddress,
  }
  const socialLinks = { ...signature.socialLinks }
  ;(['linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'github', 'whatsapp'] as const).forEach((key) => {
    socialLinks[key] = fieldValue(bundle, key) || socialLinks[key]
  })
  return normalizeSignature({
    ...signature,
    contactDetails,
    socialLinks,
    profileImageUrl: bundle.card.design.profileImageUrl || signature.profileImageUrl,
    companyLogoUrl: bundle.card.design.companyLogoUrl || signature.companyLogoUrl,
    linkedBusinessCardId: bundle.card.id,
  })
}

export function createDefaultSignature(user: AppUser, bundle?: CardBundle): EmailSignature {
  const now = new Date().toISOString()
  const signature = normalizeSignature({ id: makeId(), userId: user.id, name: 'Untitled signature', createdAt: now, updatedAt: now })
  if (!bundle) return normalizeSignature({ ...signature, contactDetails: { ...signature.contactDetails, fullName: user.name } })
  return applyBusinessCardSnapshot(signature, bundle)
}

export function duplicateSignature(source: EmailSignature): EmailSignature {
  const now = new Date().toISOString()
  return normalizeSignature({ ...source, id: makeId(), name: `${source.name} copy`, createdAt: now, updatedAt: now })
}

export function templateBranding(templateId: string, current: SignatureBranding): SignatureBranding {
  const template = signatureTemplates.find((item) => item.id === templateId)
  return { ...current, ...(template?.branding ?? {}) }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
const httpsImage = (value: string) => /^https:\/\/[^\s"'<>]+$/i.test(value.trim()) ? value.trim() : ''
const safeColor = (value: string, fallback: string) => /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback
const safeFont = (value: string) => ['Arial', 'Helvetica', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS'].includes(value) ? value : 'Arial'
const absoluteLink = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}
const contactHref = (value: string, kind: 'email' | 'phone' | 'url') => kind === 'email' ? `mailto:${value.trim()}` : kind === 'phone' ? `tel:${value.replace(/[^+\d]/g, '')}` : absoluteLink(value)

const socialInitial: Record<keyof SignatureSocialLinks, string> = { linkedin: 'in', facebook: 'f', instagram: 'ig', twitter: 'X', youtube: '▶', github: 'gh', whatsapp: 'wa' }

export function generateEmailSignatureHtml(signature: EmailSignature, businessCardUrl = '') {
  const normalized = normalizeSignature(signature)
  const { contactDetails: contact, visibleFields: visible, socialLinks: socials, branding: brand, ctaSettings: cta } = normalized
  const font = escapeHtml(safeFont(brand.fontFamily))
  const primary = safeColor(brand.primaryColor, defaultSignatureBranding.primaryColor)
  const accent = safeColor(brand.accentColor, defaultSignatureBranding.accentColor)
  const textColor = safeColor(brand.textColor, defaultSignatureBranding.textColor)
  const align = brand.alignment === 'center' ? 'center' : 'left'
  const padding = Math.max(8, Math.min(32, Math.round(brand.spacing)))
  const photo = httpsImage(normalized.profileImageUrl)
  const logo = httpsImage(normalized.companyLogoUrl)
  const imageHtml = photo ? `<td valign="top" style="padding:0 ${padding}px 0 0;"><img src="${escapeHtml(photo)}" width="${Math.max(40, Math.min(140, Math.round(brand.photoSize)))}" height="${Math.max(40, Math.min(140, Math.round(brand.photoSize)))}" alt="${escapeHtml(contact.fullName || 'Profile photo')}" style="display:block;border:0;border-radius:50%;object-fit:cover;"></td>` : ''
  const logoHtml = logo ? `<tr><td style="padding:0 0 ${Math.max(8, padding / 2)}px 0;"><img src="${escapeHtml(logo)}" width="${Math.max(48, Math.min(180, Math.round(brand.logoSize)))}" alt="${escapeHtml(contact.companyName || 'Company logo')}" style="display:block;border:0;max-width:180px;height:auto;"></td></tr>` : ''
  const identity = [visible.jobTitle !== false ? contact.jobTitle : '', visible.department !== false ? contact.department : '', visible.companyName !== false ? contact.companyName : ''].filter(Boolean).join(' · ')
  const contactRows = [
    visible.email !== false && contact.email ? `<tr><td style="padding:3px 0;font:${Math.max(11, brand.fontSize - 1)}px/${Math.max(16, brand.fontSize + 4)}px ${font};color:${textColor};"><a href="${escapeHtml(contactHref(contact.email, 'email'))}" style="color:${primary};text-decoration:none;">${escapeHtml(contact.email)}</a></td></tr>` : '',
    visible.phoneNumber !== false && contact.phoneNumber ? `<tr><td style="padding:3px 0;font:${Math.max(11, brand.fontSize - 1)}px/${Math.max(16, brand.fontSize + 4)}px ${font};color:${textColor};">P&nbsp; <a href="${escapeHtml(contactHref(contact.phoneNumber, 'phone'))}" style="color:${textColor};text-decoration:none;">${escapeHtml(contact.phoneNumber)}</a></td></tr>` : '',
    visible.mobileNumber !== false && contact.mobileNumber ? `<tr><td style="padding:3px 0;font:${Math.max(11, brand.fontSize - 1)}px/${Math.max(16, brand.fontSize + 4)}px ${font};color:${textColor};">M&nbsp; <a href="${escapeHtml(contactHref(contact.mobileNumber, 'phone'))}" style="color:${textColor};text-decoration:none;">${escapeHtml(contact.mobileNumber)}</a></td></tr>` : '',
    visible.website !== false && contact.website ? `<tr><td style="padding:3px 0;font:${Math.max(11, brand.fontSize - 1)}px/${Math.max(16, brand.fontSize + 4)}px ${font};"><a href="${escapeHtml(contactHref(contact.website, 'url'))}" style="color:${primary};text-decoration:none;">${escapeHtml(contact.website)}</a></td></tr>` : '',
    visible.officeAddress !== false && contact.officeAddress ? `<tr><td style="padding:3px 0;font:${Math.max(11, brand.fontSize - 1)}px/${Math.max(16, brand.fontSize + 4)}px ${font};color:${textColor};">${escapeHtml(contact.officeAddress)}</td></tr>` : '',
  ].filter(Boolean).join('')
  const socialRows = (Object.keys(socialInitial) as Array<keyof SignatureSocialLinks>).filter((key) => socials[key].trim()).map((key) => `<td style="padding:0 8px 0 0;"><a href="${escapeHtml(absoluteLink(socials[key]))}" style="display:inline-block;padding:5px 7px;border-radius:5px;background:${brand.iconStyle === 'filled' ? primary : brand.iconStyle === 'outline' ? '#ffffff' : accent};border:1px solid ${primary};color:${brand.iconStyle === 'filled' ? '#ffffff' : primary};font:bold 11px Arial,sans-serif;text-decoration:none;">${socialInitial[key]}</a></td>`).join('')
  const socialHtml = socialRows ? `<tr><td style="padding-top:${Math.max(8, padding / 2)}px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${socialRows}</tr></table></td></tr>` : ''
  const divider = brand.showDivider ? `border-left:1px solid ${accent};` : ''
  const resolvedCtaUrl = cta.url.trim() || (cta.type === 'business_card' ? businessCardUrl : cta.type === 'visit_website' ? absoluteLink(contact.website) : '')
  const ctaHref = cta.type === 'save_contact' && contact.email ? contactHref(contact.email, 'email') : cta.type === 'book_meeting' ? absoluteLink(resolvedCtaUrl) : cta.type === 'business_card' ? absoluteLink(resolvedCtaUrl) : absoluteLink(resolvedCtaUrl)
  const ctaHtml = cta.enabled && ctaHref ? `<tr><td style="padding-top:${padding}px;"><a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:${brand.buttonStyle === 'solid' ? primary : brand.buttonStyle === 'soft' ? accent : '#ffffff'};border:1px solid ${primary};color:${brand.buttonStyle === 'solid' ? '#ffffff' : primary};font:bold ${Math.max(11, brand.fontSize - 1)}px ${font};text-decoration:none;">${escapeHtml(cta.label || 'Learn more')}</a></td></tr>` : ''
  const content = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${font};text-align:${align};"><tr>${imageHtml}<td valign="top" style="${divider}padding-left:${brand.showDivider ? padding : 0};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;text-align:${align};">${logoHtml}<tr><td style="padding:0;font:bold ${Math.max(16, brand.fontSize + 4)}px/${Math.max(21, brand.fontSize + 7)}px ${font};color:${primary};">${escapeHtml(contact.fullName || 'Your name')}</td></tr>${identity ? `<tr><td style="padding:3px 0 0;font:${brand.fontSize}px/${Math.max(20, brand.fontSize + 5)}px ${font};color:${textColor};">${escapeHtml(identity)}</td></tr>` : ''}${contactRows ? `<tr><td style="padding-top:${Math.max(8, padding / 2)}px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;text-align:${align};">${contactRows}</table></td></tr>` : ''}${socialHtml}${ctaHtml}</table></td></tr></table>`
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;font-family:${font};"><tr><td style="padding:0;">${content}</td></tr></table>`
}
