import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { definitionFor } from '../lib/fieldDefinitions'
import type { CardField, FieldDefinition } from '../lib/types'
import { IconBadge } from './IconBadge'

interface FieldEditorProps {
  definition: FieldDefinition
  field?: CardField
  onClose: () => void
  onSave: (data: Omit<CardField, 'id' | 'cardId' | 'sortOrder' | 'isVisible'>) => void
}

const urlTypes = new Set(['company_url', 'website', 'custom_link', 'twitter', 'instagram', 'threads', 'linkedin', 'facebook', 'youtube', 'snapchat', 'tiktok', 'twitch', 'yelp', 'github', 'booking_link', 'portfolio', 'store_link', 'calendar_link', 'custom_button'])

export function FieldEditor({ definition, field, onClose, onSave }: FieldEditorProps) {
  const [label, setLabel] = useState(field?.label ?? defaultLabel(definition.type))
  const [value, setValue] = useState(field?.value ?? '')
  const [metadata, setMetadata] = useState<Record<string, string>>(field?.metadata ?? {})
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  const isAddress = definition.type === 'address'
  const isPhone = definition.type === 'phone'
  const isCustomButton = definition.type === 'custom_button'
  const needsValue = !['address'].includes(definition.type)

  const updateMeta = (key: string, next: string) => setMetadata((current) => ({ ...current, [key]: next }))
  const save = () => {
    const cleanValue = isAddress ? [metadata.street, metadata.city, metadata.state, metadata.postalCode, metadata.country].filter(Boolean).join(', ') : value.trim()
    if (needsValue && !cleanValue) {
      setError('Add a value before saving this field.')
      return
    }
    if (urlTypes.has(definition.type) && cleanValue && !cleanValue.startsWith('http') && !cleanValue.includes('@')) {
      setValue(`https://${cleanValue}`)
    }
    onSave({ fieldType: definition.type, category: definition.category, label: label.trim() || definition.label, value: cleanValue, metadata, iconKey: definition.iconKey })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="field-editor-title">
        <div className="modal-heading">
          <div className="modal-title-wrap"><IconBadge iconKey={definition.iconKey} /><div><p className="eyebrow">Card field</p><h2 id="field-editor-title">{field ? `Edit ${definition.label}` : `Add ${definition.label}`}</h2></div></div>
          <button className="icon-button" onClick={onClose} aria-label="Close editor"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <label className="field-label">Label <span className="field-hint">Shown on your card</span><input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={definition.label} autoFocus /></label>
          {isAddress ? <div className="field-grid field-grid-two">
            <label className="field-label field-span-two">Street<input value={metadata.street ?? ''} onChange={(event) => updateMeta('street', event.target.value)} placeholder="123 Market Street" /></label>
            <label className="field-label">City<input value={metadata.city ?? ''} onChange={(event) => updateMeta('city', event.target.value)} placeholder="San Francisco" /></label>
            <label className="field-label">State / region<input value={metadata.state ?? ''} onChange={(event) => updateMeta('state', event.target.value)} placeholder="CA" /></label>
            <label className="field-label">ZIP / postal code<input value={metadata.postalCode ?? ''} onChange={(event) => updateMeta('postalCode', event.target.value)} placeholder="94105" /></label>
            <label className="field-label">Country<input value={metadata.country ?? ''} onChange={(event) => updateMeta('country', event.target.value)} placeholder="United States" /></label>
          </div> : <>
            {isPhone && <label className="field-label">Country code<input value={metadata.countryCode ?? ''} onChange={(event) => updateMeta('countryCode', event.target.value)} placeholder="+1" /></label>}
            <label className="field-label">{isCustomButton ? 'Button label' : isCustomButton ? 'Button label' : definition.type === 'custom_text' ? 'Text' : definition.type === 'email' ? 'Email address' : urlTypes.has(definition.type) ? 'URL or handle' : 'Value'}
              <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholderFor(definition.type)} inputMode={definition.type === 'phone' ? 'tel' : undefined} />
            </label>
            {isCustomButton && <label className="field-label">Button destination<input value={metadata.url ?? ''} onChange={(event) => updateMeta('url', event.target.value)} placeholder="https://example.com/book" /></label>}
            {definition.type === 'custom_link' && <label className="field-label">Optional icon key<span className="field-hint">Try: link, globe, calendar, star</span><input value={metadata.iconKey ?? ''} onChange={(event) => updateMeta('iconKey', event.target.value)} placeholder="link" /></label>}
          </>}
          {error && <p className="form-error">{error}</p>}
        </div>
        <div className="modal-footer"><button className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" onClick={save}>{field ? 'Save changes' : 'Add to card'}</button></div>
      </div>
    </div>
  )
}

interface InlineFieldEditorProps {
  definition: FieldDefinition
  field?: CardField
  onCancel: () => void
  onSave: (data: Omit<CardField, 'id' | 'cardId' | 'sortOrder' | 'isVisible'>) => void
}

export function InlineFieldEditor({ definition, field, onCancel, onSave }: InlineFieldEditorProps) {
  const [label, setLabel] = useState(field?.label ?? defaultLabel(definition.type))
  const [value, setValue] = useState(field?.value ?? '')
  const [metadata, setMetadata] = useState<Record<string, string>>(field?.metadata ?? {})
  const [error, setError] = useState('')

  const isAddress = definition.type === 'address'
  const isPhone = definition.type === 'phone'
  const isCustomButton = definition.type === 'custom_button'
  const needsValue = !isAddress
  const updateMeta = (key: string, next: string) => setMetadata((current) => ({ ...current, [key]: next }))

  const save = () => {
    const rawValue = isAddress ? [metadata.street, metadata.city, metadata.state, metadata.postalCode, metadata.country].filter(Boolean).join(', ') : value.trim()
    if (needsValue && !rawValue) {
      setError('Add a value before saving this field.')
      return
    }
    const cleanValue = urlTypes.has(definition.type) && rawValue && !rawValue.startsWith('http') && !rawValue.includes('@') ? `https://${rawValue}` : rawValue
    onSave({ fieldType: definition.type, category: definition.category, label: label.trim() || definition.label, value: cleanValue, metadata, iconKey: definition.iconKey })
  }

  return <div className="field-inline-editor" role="group" aria-label={`${field ? 'Edit' : 'Add'} ${definition.label}`}>
    <div className="field-inline-heading"><IconBadge iconKey={definition.iconKey} size="sm" /><div><strong>{field ? `Edit ${definition.label}` : `Add ${definition.label}`}</strong><span>Complete this field without leaving the list.</span></div></div>
    <div className={`field-inline-fields ${isAddress ? 'field-inline-fields-address' : ''}`}>
      <label className="field-label">Label<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={definition.label} /></label>
      {isAddress ? <div className="field-inline-address-grid">
        <label className="field-label field-inline-span-two">Street<input value={metadata.street ?? ''} onChange={(event) => updateMeta('street', event.target.value)} placeholder="123 Market Street" /></label>
        <label className="field-label">City<input value={metadata.city ?? ''} onChange={(event) => updateMeta('city', event.target.value)} placeholder="San Francisco" /></label>
        <label className="field-label">State / region<input value={metadata.state ?? ''} onChange={(event) => updateMeta('state', event.target.value)} placeholder="CA" /></label>
        <label className="field-label">ZIP / postal code<input value={metadata.postalCode ?? ''} onChange={(event) => updateMeta('postalCode', event.target.value)} placeholder="94105" /></label>
        <label className="field-label">Country<input value={metadata.country ?? ''} onChange={(event) => updateMeta('country', event.target.value)} placeholder="United States" /></label>
      </div> : <div className={`field-inline-value-wrap ${isPhone ? 'field-inline-value-wrap-phone' : ''}`}>
        {isPhone && <label className="field-label">Country code<input value={metadata.countryCode ?? ''} onChange={(event) => updateMeta('countryCode', event.target.value)} placeholder="+1" /></label>}
        <label className="field-label">{isCustomButton ? 'Button label' : definition.type === 'custom_text' ? 'Text' : definition.type === 'email' ? 'Email address' : urlTypes.has(definition.type) ? 'URL or handle' : 'Value'}<input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholderFor(definition.type)} inputMode={isPhone ? 'tel' : undefined} /></label>
        {isCustomButton && <label className="field-label">Button destination<input value={metadata.url ?? ''} onChange={(event) => updateMeta('url', event.target.value)} placeholder="https://example.com/book" /></label>}
        {definition.type === 'custom_link' && <label className="field-label">Optional icon key<span className="field-hint">Try: link, globe, calendar, star</span><input value={metadata.iconKey ?? ''} onChange={(event) => updateMeta('iconKey', event.target.value)} placeholder="link" /></label>}
      </div>}
    </div>
    {error && <p className="form-error field-inline-error">{error}</p>}
    <div className="field-inline-actions"><button className="button button-ghost" onClick={onCancel}>Cancel</button><button className="button button-primary" onClick={save}><Check size={14} /> {field ? 'Save changes' : 'Add to card'}</button></div>
  </div>
}

function defaultLabel(type: string) {
  if (type === 'email') return 'Work email'
  if (type === 'phone') return 'Mobile'
  if (type === 'custom_button') return 'Book a call'
  return definitionFor(type as CardField['fieldType']).label
}

function placeholderFor(type: string) {
  if (type === 'name') return 'Alex Morgan'
  if (type === 'job_title') return 'Creative strategist'
  if (type === 'company') return 'Northstar Studio'
  if (type === 'headline') return 'Make a memorable first impression.'
  if (type === 'email') return 'hello@yourdomain.com'
  if (type === 'phone') return '+1 415 555 0128'
  if (type === 'custom_text') return 'A short note for your visitors'
  if (urlTypes.has(type)) return 'https://'
  return 'Add a value'
}
