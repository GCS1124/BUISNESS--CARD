import { ArrowUpRight, ChevronRight, Mail, MapPin, PhoneCall, Share2 } from 'lucide-react'
import type { CardBundle, CardField } from '../lib/types'
import { getIcon } from '../lib/icons'
import { fieldDefinitions } from '../lib/fieldDefinitions'

interface PhonePreviewProps {
  bundle: CardBundle
  onShare?: () => void
  publicView?: boolean
}

const detailTypes = new Set(['name', 'job_title', 'company', 'headline'])

const fieldHref = (field: CardField) => {
  const value = (field.fieldType === 'custom_button' ? field.metadata.url : field.value).trim()
  if (field.fieldType === 'phone' || field.fieldType === 'whatsapp') return `tel:${value.replace(/[^+\d]/g, '')}`
  if (field.fieldType === 'email') return `mailto:${value}`
  if (field.fieldType === 'address' || field.fieldType === 'location') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
  }
  if (/^https?:\/\//i.test(value)) return value
  if (field.fieldType === 'linkedin') return `https://${value}`
  return value ? `https://${value}` : undefined
}

const isExternal = (field: CardField) => Boolean(fieldHref(field)?.startsWith('http'))

const initialsFor = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AM'

function fieldText(field: CardField) {
  if (field.fieldType === 'address' && field.metadata.city) {
    return [field.metadata.street, field.metadata.city, field.metadata.state, field.metadata.postalCode]
      .filter(Boolean)
      .join(', ')
  }
  return field.value
}

export function PhonePreview({ bundle, onShare, publicView = false }: PhonePreviewProps) {
  const { card, fields } = bundle
  const visibleField = (type: CardField['fieldType']) => fields.find((field) => field.fieldType === type && field.isVisible && field.value.trim())
  const name = visibleField('name')?.value || 'Your name'
  const jobTitle = visibleField('job_title')?.value
  const company = visibleField('company')?.value
  const headline = visibleField('headline')?.value
  const visibleDetails = fields.filter((field) => field.isVisible && !detailTypes.has(field.fieldType) && field.value)
  const design = card.design
  const logo = fields.find((field) => field.fieldType === 'company')?.value
  const font = design.fontFamily === 'DM Sans' ? 'DM Sans, sans-serif' : design.fontFamily === 'Space Grotesk' ? 'Space Grotesk, sans-serif' : 'Manrope, sans-serif'

  return (
    <div className={`phone-shell ${publicView ? 'phone-shell-public' : ''}`}>
      <div className="phone-speaker" />
      <div className="phone-screen" style={{ fontFamily: font }}>
        <div className="phone-cover" style={{ backgroundColor: design.headerColor, backgroundImage: design.coverImageUrl ? `linear-gradient(180deg, rgba(10,25,22,.05), rgba(10,25,22,.28)), url(${design.coverImageUrl})` : undefined }}>
          <div className="phone-cover-actions">
            <span className="phone-chip">{card.theme}</span>
            {onShare && <button className="icon-button icon-button-on-cover" onClick={onShare} aria-label="Share card"><Share2 size={15} /></button>}
          </div>
        </div>
        <div className="phone-card-body" style={{ background: design.cardBackground, color: design.textColor, borderRadius: `${design.borderRadius}px ${design.borderRadius}px 0 0` }}>
          <div className="phone-profile-row">
            {design.profileImageUrl ? <img className="phone-avatar" src={design.profileImageUrl} alt={name} /> : <div className="phone-avatar phone-avatar-placeholder">{initialsFor(name)}</div>}
            <div className="phone-profile-copy">
              <h3>{name}</h3>
              {jobTitle && <p>{jobTitle}</p>}
              {company && <span>{company}</span>}
            </div>
            {design.companyLogoUrl ? <img className="phone-company-logo" src={design.companyLogoUrl} alt="Company logo" /> : <div className="phone-company-mark">{initialsFor(logo || 'Co')}</div>}
          </div>
          {headline && <p className="phone-headline">{headline}</p>}
          <div className="phone-actions-row">
            {visibleField('phone') && <a href={fieldHref(visibleField('phone')!)} className="phone-action phone-action-primary"><PhoneCall size={14} /> Call</a>}
            {visibleField('email') && <a href={fieldHref(visibleField('email')!)} className="phone-action"><Mail size={14} /> Email</a>}
          </div>
          <div className="phone-detail-list">
            {visibleDetails.length === 0 && <div className="phone-empty-detail">Add your details to see them here.</div>}
            {visibleDetails.map((field) => {
              const Icon = getIcon(field.iconKey)
              const href = fieldHref(field)
              const definition = fieldDefinitions.find((item) => item.type === field.fieldType)
              const content = <><span className="phone-detail-icon"><Icon size={15} /></span><span className="phone-detail-copy"><small>{field.label || definition?.label}</small><strong>{fieldText(field)}</strong></span><ChevronRight size={14} className="phone-detail-arrow" /></>
              return href ? <a key={field.id} className="phone-detail" href={href} target={isExternal(field) ? '_blank' : undefined} rel={isExternal(field) ? 'noreferrer' : undefined}>{content}</a> : <div key={field.id} className="phone-detail">{content}</div>
            })}
          </div>
          <div className="phone-footer-note"><span /> Shared with Cardly <ArrowUpRight size={12} /></div>
        </div>
      </div>
    </div>
  )
}
