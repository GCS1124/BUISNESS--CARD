import type { CaptureMethod, EventLead, LeadTemperature } from './types'

export interface ParsedLeadContact {
  firstName?: string
  lastName?: string
  company?: string
  jobTitle?: string
  email?: string
  phone?: string
  website?: string
  linkedinUrl?: string
  address?: string
}

const clean = (value: string | undefined) => value?.trim().replace(/^\s+|\s+$/g, '') ?? ''

const splitName = (value: string): Pick<ParsedLeadContact, 'firstName' | 'lastName'> => {
  const parts = clean(value).split(/\s+/).filter(Boolean)
  return { firstName: parts.shift() ?? '', lastName: parts.join(' ') }
}

const unescapeVCard = (value: string) => value.replace(/\\n/gi, ', ').replace(/\\,/g, ',').replace(/\\;/g, ';').trim()

export function parseQrPayload(payload: string): ParsedLeadContact {
  const value = payload.trim()
  if (!value) return {}
  if (/^BEGIN:VCARD/i.test(value)) {
    const values = new Map<string, string>()
    value.split(/\r?\n/).forEach((line) => {
      const separator = line.indexOf(':')
      if (separator < 0) return
      const key = line.slice(0, separator).toUpperCase().split(';')[0]
      values.set(key, unescapeVCard(line.slice(separator + 1)))
    })
    const name = values.get('FN') || [values.get('N')?.split(';')[1], values.get('N')?.split(';')[0]].filter(Boolean).join(' ')
    const address = values.get('ADR') ?? ''
    return { ...splitName(name), company: values.get('ORG'), jobTitle: values.get('TITLE'), email: values.get('EMAIL'), phone: values.get('TEL'), website: values.get('URL'), address: unescapeVCard(address) }
  }
  try {
    const json = JSON.parse(value) as Record<string, unknown>
    if (json.type === 'vcard' || json.vCard || json.contact) {
      const contact = (json.contact ?? json) as Record<string, unknown>
      const name = String(contact.name ?? contact.fullName ?? '')
      return { ...splitName(name), firstName: String(contact.firstName ?? splitName(name).firstName ?? ''), lastName: String(contact.lastName ?? splitName(name).lastName ?? ''), company: String(contact.company ?? ''), jobTitle: String(contact.jobTitle ?? ''), email: String(contact.email ?? ''), phone: String(contact.phone ?? ''), website: String(contact.website ?? ''), linkedinUrl: String(contact.linkedin ?? contact.linkedinUrl ?? ''), address: String(contact.address ?? '') }
    }
  } catch {
    // It is likely a URL or a non-JSON badge payload. Keep it for review rather than guessing.
  }
  if (/^https?:\/\//i.test(value)) {
    return { website: value, linkedinUrl: /linkedin\.com/i.test(value) ? value : '' }
  }
  return {}
}

export const normalizedEmail = (value: string) => value.trim().toLowerCase()
export const normalizedPhone = (value: string) => value.replace(/\D/g, '')
export const normalizedLinkedIn = (value: string) => value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

export function findPossibleDuplicate(leads: EventLead[], draft: Pick<EventLead, 'email' | 'phone' | 'linkedinUrl'>, ignoreId = '') {
  const email = normalizedEmail(draft.email)
  const phone = normalizedPhone(draft.phone)
  const linkedin = normalizedLinkedIn(draft.linkedinUrl)
  if (!email && !phone && !linkedin) return undefined
  return leads.find((lead) => lead.id !== ignoreId && ((email && normalizedEmail(lead.email) === email) || (phone && normalizedPhone(lead.phone) === phone) || (linkedin && normalizedLinkedIn(lead.linkedinUrl) === linkedin)))
}

export function validateLead(lead: Pick<EventLead, 'firstName' | 'lastName' | 'company' | 'email' | 'phone' | 'website' | 'linkedinUrl'>) {
  const errors: Partial<Record<keyof typeof lead, string>> = {}
  if (!lead.firstName.trim() && !lead.lastName.trim()) errors.firstName = 'Add a name or at least one contact detail.'
  if (!lead.company.trim()) errors.company = 'Add the company name.'
  if (lead.email.trim() && !/^\S+@\S+\.\S+$/.test(lead.email.trim())) errors.email = 'Enter a valid email address.'
  if (lead.website.trim() && !/^https?:\/\//i.test(lead.website.trim())) errors.website = 'Use a full URL starting with https://.'
  if (lead.linkedinUrl.trim() && !/linkedin\.com/i.test(lead.linkedinUrl.trim())) errors.linkedinUrl = 'Enter a LinkedIn URL.'
  return errors
}

export const captureMethodLabel = (method: CaptureMethod) => ({ qr: 'QR code', badge: 'Event badge', business_card: 'Business card', manual: 'Manual', digital_business_card: 'Digital card', event_form: 'Event form' })[method]
export const temperatureLabel = (temperature: LeadTemperature) => temperature.charAt(0).toUpperCase() + temperature.slice(1)

export const businessCardScannerService = {
  async extract(_file: File): Promise<Partial<EventLead>> {
    return {}
  },
}

export function downloadLeadsCsv(leads: EventLead[], eventNameById: Map<string, string>, tagNameById: Map<string, string>) {
  const headers = ['First name', 'Last name', 'Company', 'Job title', 'Email', 'Phone', 'Website', 'LinkedIn', 'Address', 'Event', 'Captured by', 'Captured at', 'Temperature', 'Capture method', 'Tags', 'Notes', 'Sync status']
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
  const rows = leads.map((lead) => [lead.firstName, lead.lastName, lead.company, lead.jobTitle, lead.email, lead.phone, lead.website, lead.linkedinUrl, lead.address, eventNameById.get(lead.eventId) ?? '', lead.capturedByName, lead.capturedAt, lead.leadTemperature, captureMethodLabel(lead.captureMethod), lead.tagIds.map((tagId) => tagNameById.get(tagId) ?? '').filter(Boolean).join(', '), lead.notes.map((note) => note.note).join(' | '), lead.syncStatus])
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${eventNameById.get(leads[0]?.eventId ?? '') ?? 'event-leads'}-leads.csv`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
  anchor.click()
  URL.revokeObjectURL(url)
}
