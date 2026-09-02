import { makeId } from './storage'
import type { AppUser, CardBundle, EmailSignature, SignatureBranding, SignatureContactDetails, SignatureCtaSettings, SignatureSocialLinks } from './types'

export const signatureTemplates: Array<{ id: string; name: string; description: string; swatches: string[]; branding: Partial<SignatureBranding> }> = [
  { id: 'minimal', name: 'Minimal', description: 'Quiet, compact, and easy to scan.', swatches: ['#165c51', '#cde7e0'], branding: { primaryColor: '#165c51', accentColor: '#cde7e0', textColor: '#14221f', alignment: 'left', showDivider: false, buttonStyle: 'outline', iconStyle: 'text', imageShape: 'circle' } },
  { id: 'classic', name: 'Classic', description: 'A dependable layout for everyday work.', swatches: ['#0f4038', '#e2eee8'], branding: { primaryColor: '#0f4038', accentColor: '#e2eee8', textColor: '#18332d', alignment: 'left', showDivider: true, buttonStyle: 'solid', iconStyle: 'filled', dividerStyle: 'solid' } },
  { id: 'modern', name: 'Modern', description: 'A confident color block with a crisp rhythm.', swatches: ['#165c51', '#f0f5ef'], branding: { primaryColor: '#165c51', accentColor: '#f0f5ef', textColor: '#14221f', alignment: 'left', showDivider: true, buttonStyle: 'soft', iconStyle: 'outline', dividerStyle: 'dashed' } },
  { id: 'corporate', name: 'Corporate', description: 'Structured, polished, and presentation-ready.', swatches: ['#234b45', '#d9e6da'], branding: { primaryColor: '#234b45', accentColor: '#d9e6da', textColor: '#193b34', alignment: 'left', showDivider: true, buttonStyle: 'solid', iconStyle: 'filled', dividerStyle: 'solid' } },
  { id: 'profile-photo', name: 'Photo Left', description: 'Put a human face at the center of the introduction.', swatches: ['#165c51', '#e5f0eb'], branding: { primaryColor: '#165c51', accentColor: '#e5f0eb', textColor: '#17352e', alignment: 'left', showDivider: false, buttonStyle: 'soft', iconStyle: 'outline', photoSize: 72, imageShape: 'rounded' } },
  { id: 'logo-focused', name: 'Logo Focused', description: 'Make your company identity lead the way.', swatches: ['#0f4038', '#cde7e0'], branding: { primaryColor: '#0f4038', accentColor: '#cde7e0', textColor: '#17352e', alignment: 'left', showDivider: true, buttonStyle: 'outline', iconStyle: 'text', logoSize: 96 } },
  { id: 'elegant', name: 'Elegant', description: 'Warm contrast and considered spacing for a premium sign-off.', swatches: ['#356258', '#edf4ee'], branding: { primaryColor: '#356258', accentColor: '#edf4ee', textColor: '#253d36', alignment: 'left', showDivider: true, buttonStyle: 'outline', iconStyle: 'text', imageShape: 'rounded' } },
  { id: 'compact', name: 'Compact', description: 'A focused signature that stays light in busy threads.', swatches: ['#56786e', '#eff6f2'], branding: { primaryColor: '#56786e', accentColor: '#eff6f2', textColor: '#29453b', fontSize: 12, spacing: 10, photoSize: 54, logoSize: 56, showDivider: false, buttonStyle: 'soft' } },
  { id: 'photo-right', name: 'Photo Right', description: 'A friendly, balanced layout with the image leading the close.', swatches: ['#1b6e60', '#d9e9e2'], branding: { primaryColor: '#1b6e60', accentColor: '#d9e9e2', textColor: '#173b33', alignment: 'right', showDivider: false, buttonStyle: 'soft', iconStyle: 'outline', imageShape: 'circle' } },
  { id: 'clean-professional', name: 'Clean Professional', description: 'Simple hierarchy, strong details, and a reliable finish.', swatches: ['#165c51', '#f0f5ef'], branding: { primaryColor: '#165c51', accentColor: '#f0f5ef', textColor: '#14221f', alignment: 'left', showDivider: true, buttonStyle: 'solid', iconStyle: 'outline', imageShape: 'square' } },
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
  primaryColor: '#165c51',
  accentColor: '#cde7e0',
  textColor: '#14221f',
  secondaryTextColor: '#6d7e74',
  iconColor: '#165c51',
  dividerColor: '#d9e6da',
  ctaColor: '#165c51',
  fontFamily: 'Arial',
  fontSize: 14,
  nameSize: 20,
  detailsSize: 12,
  jobTitleSize: 13,
  logoSize: 72,
  photoSize: 72,
  spacing: 16,
  iconSize: 12,
  dividerThickness: 1,
  showDivider: false,
  dividerStyle: 'solid',
  imageShape: 'circle',
  iconShape: 'rounded',
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
  style: 'solid',
  disclaimer: '',
  bannerText: '',
  customText: '',
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

export function createGuestSignature(): EmailSignature {
  const now = new Date().toISOString()
  return normalizeSignature({ id: makeId(), userId: '', name: 'Untitled signature', createdAt: now, updatedAt: now })
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
const imageSource = (value: string) => /^(https:\/\/[^\s"'<>]+|data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=]+)$/i.test(value.trim()) ? value.trim() : ''
const safeColor = (value: string, fallback: string) => /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback
const safeFont = (value: string) => ['Arial', 'Helvetica', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman'].includes(value) ? value : 'Arial'
const absoluteLink = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}
const contactHref = (value: string, kind: 'email' | 'phone' | 'url') => kind === 'email' ? `mailto:${value.trim()}` : kind === 'phone' ? `tel:${value.replace(/[^+\d]/g, '')}` : absoluteLink(value)

const socialInitial: Record<keyof SignatureSocialLinks, string> = { linkedin: 'in', facebook: 'f', instagram: 'ig', twitter: 'X', youtube: '▶', github: 'gh', whatsapp: 'wa' }

const imageRadius = (shape: SignatureBranding['imageShape']) => shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : '0'
const iconRadius = (shape: SignatureBranding['iconShape']) => shape === 'circle' ? '50%' : shape === 'rounded' ? '5px' : '0'

export function generateEmailSignatureText(signature: EmailSignature) {
  const normalized = normalizeSignature(signature)
  const { contactDetails: contact, visibleFields: visible, socialLinks: socials, ctaSettings: cta } = normalized
  const lines = [
    visible.fullName !== false ? contact.fullName : '',
    [visible.jobTitle !== false ? contact.jobTitle : '', visible.department !== false ? contact.department : '', visible.companyName !== false ? contact.companyName : ''].filter(Boolean).join(' · '),
    visible.email !== false ? contact.email : '',
    visible.phoneNumber !== false ? contact.phoneNumber : '',
    visible.mobileNumber !== false ? contact.mobileNumber : '',
    visible.website !== false ? contact.website : '',
    visible.officeAddress !== false ? contact.officeAddress : '',
    ...(Object.values(socials).filter(Boolean)),
    cta.enabled ? `${cta.label}: ${cta.url}` : '',
    cta.bannerText,
    cta.customText,
    cta.disclaimer,
  ].filter(Boolean)
  return lines.join('\n')
}

export function generateEmailSignatureHtml(signature: EmailSignature, businessCardUrl = '', options: { allowLocalImages?: boolean } = {}) {
  const normalized = normalizeSignature(signature)
  const { contactDetails: contact, visibleFields: visible, socialLinks: socials, branding: brand, ctaSettings: cta } = normalized
  const font = escapeHtml(safeFont(brand.fontFamily))
  const primary = safeColor(brand.primaryColor, defaultSignatureBranding.primaryColor)
  const accent = safeColor(brand.accentColor, defaultSignatureBranding.accentColor)
  const textColor = safeColor(brand.textColor, defaultSignatureBranding.textColor)
  const secondaryTextColor = safeColor(brand.secondaryTextColor, defaultSignatureBranding.secondaryTextColor)
  const iconColor = safeColor(brand.iconColor, primary)
  const dividerColor = safeColor(brand.dividerColor, defaultSignatureBranding.dividerColor)
  const ctaColor = safeColor(brand.ctaColor, primary)
  const align = brand.alignment === 'center' ? 'center' : brand.alignment === 'right' ? 'right' : 'left'
  const padding = Math.max(8, Math.min(32, Math.round(brand.spacing)))
  const photo = options.allowLocalImages ? imageSource(normalized.profileImageUrl) : httpsImage(normalized.profileImageUrl)
  const logo = options.allowLocalImages ? imageSource(normalized.companyLogoUrl) : httpsImage(normalized.companyLogoUrl)
  const photoPadding = brand.alignment === 'right' ? `padding:0 0 0 ${padding}px;` : `padding:0 ${padding}px 0 0;`
  const imageHtml = photo ? `<td valign="top" style="${photoPadding}"><img src="${escapeHtml(photo)}" width="${Math.max(40, Math.min(140, Math.round(brand.photoSize)))}" height="${Math.max(40, Math.min(140, Math.round(brand.photoSize)))}" alt="${escapeHtml(contact.fullName || 'Profile photo')}" style="display:block;border:0;border-radius:${imageRadius(brand.imageShape)};"></td>` : ''
  const logoHtml = logo ? `<tr><td style="padding:0 0 ${Math.max(8, padding / 2)}px 0;"><img src="${escapeHtml(logo)}" width="${Math.max(48, Math.min(180, Math.round(brand.logoSize)))}" alt="${escapeHtml(contact.companyName || 'Company logo')}" style="display:block;border:0;max-width:180px;height:auto;"></td></tr>` : ''
  const identity = [visible.jobTitle !== false ? contact.jobTitle : '', visible.department !== false ? contact.department : '', visible.companyName !== false ? contact.companyName : ''].filter(Boolean).join(' · ')
  const name = visible.fullName !== false ? contact.fullName : ''
  const contactRows = [
    visible.email !== false && contact.email ? `<tr><td style="padding:3px 0;font:${Math.max(11, Math.round(brand.detailsSize))}px/${Math.max(16, Math.round(brand.detailsSize) + 5)}px ${font};color:${secondaryTextColor};"><a href="${escapeHtml(contactHref(contact.email, 'email'))}" style="color:${primary};text-decoration:none;">${escapeHtml(contact.email)}</a></td></tr>` : '',
    visible.phoneNumber !== false && contact.phoneNumber ? `<tr><td style="padding:3px 0;font:${Math.max(11, Math.round(brand.detailsSize))}px/${Math.max(16, Math.round(brand.detailsSize) + 5)}px ${font};color:${secondaryTextColor};">P&nbsp; <a href="${escapeHtml(contactHref(contact.phoneNumber, 'phone'))}" style="color:${secondaryTextColor};text-decoration:none;">${escapeHtml(contact.phoneNumber)}</a></td></tr>` : '',
    visible.mobileNumber !== false && contact.mobileNumber ? `<tr><td style="padding:3px 0;font:${Math.max(11, Math.round(brand.detailsSize))}px/${Math.max(16, Math.round(brand.detailsSize) + 5)}px ${font};color:${secondaryTextColor};">M&nbsp; <a href="${escapeHtml(contactHref(contact.mobileNumber, 'phone'))}" style="color:${secondaryTextColor};text-decoration:none;">${escapeHtml(contact.mobileNumber)}</a></td></tr>` : '',
    visible.website !== false && contact.website ? `<tr><td style="padding:3px 0;font:${Math.max(11, Math.round(brand.detailsSize))}px/${Math.max(16, Math.round(brand.detailsSize) + 5)}px ${font};"><a href="${escapeHtml(contactHref(contact.website, 'url'))}" style="color:${primary};text-decoration:none;">${escapeHtml(contact.website)}</a></td></tr>` : '',
    visible.officeAddress !== false && contact.officeAddress ? `<tr><td style="padding:3px 0;font:${Math.max(11, Math.round(brand.detailsSize))}px/${Math.max(16, Math.round(brand.detailsSize) + 5)}px ${font};color:${secondaryTextColor};">${escapeHtml(contact.officeAddress)}</td></tr>` : '',
  ].filter(Boolean).join('')
  const socialRows = (Object.keys(socialInitial) as Array<keyof SignatureSocialLinks>).filter((key) => socials[key].trim()).map((key) => `<td style="padding:0 8px 0 0;"><a href="${escapeHtml(absoluteLink(socials[key]))}" style="display:inline-block;min-width:${Math.max(18, Math.round(brand.iconSize) + 8)}px;padding:5px 7px;border-radius:${iconRadius(brand.iconShape)};text-align:center;background:${brand.iconStyle === 'filled' ? iconColor : brand.iconStyle === 'outline' ? '#ffffff' : accent};border:1px solid ${iconColor};color:${brand.iconStyle === 'filled' ? '#ffffff' : iconColor};font:bold ${Math.max(10, Math.round(brand.iconSize) - 1)}px Arial,sans-serif;text-decoration:none;">${socialInitial[key]}</a></td>`).join('')
  const socialHtml = socialRows ? `<tr><td style="padding-top:${Math.max(8, padding / 2)}px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${socialRows}</tr></table></td></tr>` : ''
  const divider = brand.showDivider ? `border-left:${Math.max(1, Math.round(brand.dividerThickness))}px ${brand.dividerStyle} ${dividerColor};` : ''
  const resolvedCtaUrl = cta.url.trim() || (cta.type === 'business_card' ? businessCardUrl : cta.type === 'visit_website' ? absoluteLink(contact.website) : '')
  const ctaHref = cta.type === 'save_contact' && contact.email ? contactHref(contact.email, 'email') : absoluteLink(resolvedCtaUrl)
  const ctaStyle = cta.style || brand.buttonStyle
  const ctaHtml = cta.enabled && ctaHref ? `<tr><td style="padding-top:${padding}px;"><a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:${ctaStyle === 'solid' ? ctaColor : ctaStyle === 'soft' ? accent : '#ffffff'};border:1px solid ${ctaColor};color:${ctaStyle === 'solid' ? '#ffffff' : ctaColor};font:bold ${Math.max(11, brand.fontSize - 1)}px ${font};text-decoration:none;">${escapeHtml(cta.label || 'Learn more')}</a></td></tr>` : ''
  const bannerHtml = cta.bannerText.trim() ? `<tr><td style="padding-top:${padding}px;"><div style="padding:9px 11px;background:${accent};color:${textColor};font:${Math.max(11, brand.detailsSize)}px/${Math.max(16, brand.detailsSize + 4)}px ${font};">${escapeHtml(cta.bannerText)}</div></td></tr>` : ''
  const customTextHtml = cta.customText.trim() ? `<tr><td style="padding-top:${Math.max(8, padding / 2)}px;color:${textColor};font:${Math.max(11, brand.detailsSize)}px/${Math.max(16, brand.detailsSize + 4)}px ${font};">${escapeHtml(cta.customText)}</td></tr>` : ''
  const disclaimerHtml = cta.disclaimer.trim() ? `<tr><td style="padding-top:${Math.max(8, padding / 2)}px;color:${secondaryTextColor};font:${Math.max(10, brand.detailsSize - 1)}px/${Math.max(15, brand.detailsSize + 3)}px ${font};">${escapeHtml(cta.disclaimer)}</td></tr>` : ''
  const content = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${font};text-align:${align};"><tr>${brand.alignment === 'right' ? '' : imageHtml}<td valign="top" style="${divider}padding-left:${brand.showDivider && brand.alignment !== 'right' ? padding : 0};padding-right:${brand.showDivider && brand.alignment === 'right' ? padding : 0};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;text-align:${align};">${logoHtml}${name ? `<tr><td style="padding:0;font:bold ${Math.max(16, Math.round(brand.nameSize))}px/${Math.max(21, Math.round(brand.nameSize) + 7)}px ${font};color:${primary};">${escapeHtml(name)}</td></tr>` : ''}${identity ? `<tr><td style="padding:3px 0 0;font:${Math.max(11, Math.round(brand.jobTitleSize))}px/${Math.max(18, Math.round(brand.jobTitleSize) + 6)}px ${font};color:${textColor};">${escapeHtml(identity)}</td></tr>` : ''}${contactRows ? `<tr><td style="padding-top:${Math.max(8, padding / 2)}px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;text-align:${align};">${contactRows}</table></td></tr>` : ''}${socialHtml}${ctaHtml}${bannerHtml}${customTextHtml}${disclaimerHtml}</table></td>${brand.alignment === 'right' ? imageHtml : ''}</tr></table>`
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;font-family:${font};"><tr><td style="padding:0;">${content}</td></tr></table>`
}
