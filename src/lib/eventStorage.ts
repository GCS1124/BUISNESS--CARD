import type {
  EventCampaign,
  EventLead,
  EventMember,
  EventQualifier,
  EventTag,
  EventWorkspace,
  LeadAsset,
  LeadNote,
} from './types'
import { makeId } from './storage'
import { isSupabaseConfigured, supabase } from './supabase'

const databaseName = 'cardly-event-leads'
const objectStoreName = 'workspaces'
const localKey = 'cardly.event-workspaces.v1'

export const emptyEventWorkspace = (): EventWorkspace => ({ events: [], members: [], tags: [], qualifiers: [], leads: [] })

const hasIndexedDb = () => typeof window !== 'undefined' && Boolean(window.indexedDB)

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  if (!hasIndexedDb()) {
    reject(new Error('IndexedDB is unavailable'))
    return
  }
  const request = window.indexedDB.open(databaseName, 1)
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(objectStoreName)) request.result.createObjectStore(objectStoreName)
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('Unable to open offline storage'))
})

const readLocalMap = (): Record<string, EventWorkspace> => {
  try {
    const raw = window.localStorage.getItem(localKey)
    return raw ? JSON.parse(raw) as Record<string, EventWorkspace> : {}
  } catch {
    return {}
  }
}

const normalizeWorkspace = (value: Partial<EventWorkspace> | null | undefined): EventWorkspace => ({
  events: Array.isArray(value?.events) ? value.events : [],
  members: Array.isArray(value?.members) ? value.members : [],
  tags: Array.isArray(value?.tags) ? value.tags : [],
  qualifiers: Array.isArray(value?.qualifiers) ? value.qualifiers : [],
  leads: Array.isArray(value?.leads) ? value.leads.map((lead) => ({ ...lead, notes: lead.notes ?? [], assets: lead.assets ?? [], tagIds: lead.tagIds ?? [], qualifierAnswers: lead.qualifierAnswers ?? {} })) : [],
})

export async function readEventWorkspace(userId: string): Promise<EventWorkspace> {
  if (typeof window === 'undefined') return emptyEventWorkspace()
  if (hasIndexedDb()) {
    try {
      const database = await openDatabase()
      const value = await new Promise<unknown>((resolve, reject) => {
        const request = database.transaction(objectStoreName, 'readonly').objectStore(objectStoreName).get(userId)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      database.close()
      return normalizeWorkspace(value as Partial<EventWorkspace> | null | undefined)
    } catch {
      // Fall through to the small localStorage fallback for browsers with blocked IndexedDB.
    }
  }
  return normalizeWorkspace(readLocalMap()[userId])
}

export async function writeEventWorkspace(userId: string, workspace: EventWorkspace): Promise<void> {
  if (typeof window === 'undefined') return
  const normalized = normalizeWorkspace(workspace)
  if (hasIndexedDb()) {
    try {
      const database = await openDatabase()
      await new Promise<void>((resolve, reject) => {
        const request = database.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName).put(normalized, userId)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      database.close()
      return
    } catch {
      // Keep a localStorage copy if IndexedDB is disabled or full.
    }
  }
  const map = readLocalMap()
  map[userId] = normalized
  window.localStorage.setItem(localKey, JSON.stringify(map))
}

export function getEventStatus(event: EventCampaign, now = new Date()): EventCampaign['status'] {
  if (event.status === 'archived' || event.status === 'draft') return event.status
  const start = event.startDate ? new Date(`${event.startDate}T00:00:00`) : null
  const end = event.endDate ? new Date(`${event.endDate}T23:59:59`) : null
  if (start && now < start) return 'upcoming'
  if (end && now > end) return 'completed'
  return 'active'
}

const rowString = (row: Record<string, unknown>, key: string, fallback = '') => String(row[key] ?? fallback)
const rowNumber = (row: Record<string, unknown>, key: string): number | null => row[key] === null || row[key] === undefined || row[key] === '' ? null : Number(row[key])

export const toEventRow = (event: EventCampaign) => ({
  id: event.id,
  organization_id: event.organizationId,
  name: event.name,
  description: event.description,
  event_type: event.eventType,
  location: event.location,
  city: event.city,
  country: event.country,
  start_date: event.startDate || null,
  end_date: event.endDate || null,
  timezone: event.timezone,
  budget: event.budget,
  revenue_goal: event.revenueGoal,
  actual_revenue: event.actualRevenue,
  lead_goal: event.leadGoal,
  campaign_name: event.campaignName,
  event_owner_id: event.eventOwnerId || null,
  event_owner_name: event.eventOwnerName,
  booth_number: event.boothNumber,
  event_website: event.eventWebsite,
  internal_notes: event.internalNotes,
  status: event.status,
  public_form_enabled: event.publicFormEnabled,
  public_slug: event.publicSlug,
  consent_text: event.consentText,
  linked_card_id: event.linkedCardId || null,
  created_by: event.createdBy,
  created_at: event.createdAt,
  updated_at: event.updatedAt,
})

const fromEventRow = (row: Record<string, unknown>): EventCampaign => ({
  id: rowString(row, 'id'),
  organizationId: rowString(row, 'organization_id'),
  name: rowString(row, 'name', 'Untitled event'),
  description: rowString(row, 'description'),
  eventType: rowString(row, 'event_type', 'custom') as EventCampaign['eventType'],
  location: rowString(row, 'location'),
  city: rowString(row, 'city'),
  country: rowString(row, 'country'),
  startDate: rowString(row, 'start_date'),
  endDate: rowString(row, 'end_date'),
  timezone: rowString(row, 'timezone', Intl.DateTimeFormat().resolvedOptions().timeZone),
  budget: rowNumber(row, 'budget'),
  revenueGoal: rowNumber(row, 'revenue_goal'),
  actualRevenue: rowNumber(row, 'actual_revenue'),
  leadGoal: rowNumber(row, 'lead_goal'),
  campaignName: rowString(row, 'campaign_name'),
  eventOwnerId: rowString(row, 'event_owner_id'),
  eventOwnerName: rowString(row, 'event_owner_name'),
  boothNumber: rowString(row, 'booth_number'),
  eventWebsite: rowString(row, 'event_website'),
  internalNotes: rowString(row, 'internal_notes'),
  status: rowString(row, 'status', 'draft') as EventCampaign['status'],
  publicFormEnabled: Boolean(row.public_form_enabled),
  publicSlug: rowString(row, 'public_slug'),
  consentText: rowString(row, 'consent_text'),
  linkedCardId: rowString(row, 'linked_card_id'),
  createdBy: rowString(row, 'created_by'),
  createdAt: rowString(row, 'created_at', new Date().toISOString()),
  updatedAt: rowString(row, 'updated_at', new Date().toISOString()),
})

const toMemberRow = (member: EventMember) => ({ id: member.id, event_id: member.eventId, user_id: member.userId || null, name: member.name, email: member.email, role: member.role })
const fromMemberRow = (row: Record<string, unknown>): EventMember => ({ id: rowString(row, 'id'), eventId: rowString(row, 'event_id'), userId: rowString(row, 'user_id'), name: rowString(row, 'name'), email: rowString(row, 'email'), role: rowString(row, 'role', 'sales_rep') as EventMember['role'] })
const toTagRow = (tag: EventTag) => ({ id: tag.id, event_id: tag.eventId, name: tag.name, color: tag.color })
const fromTagRow = (row: Record<string, unknown>): EventTag => ({ id: rowString(row, 'id'), eventId: rowString(row, 'event_id'), name: rowString(row, 'name'), color: rowString(row, 'color', '#2b8068') })
const toQualifierRow = (qualifier: EventQualifier) => ({ id: qualifier.id, event_id: qualifier.eventId, label: qualifier.label, type: qualifier.type, options: qualifier.options, required: qualifier.required, sort_order: qualifier.sortOrder })
const fromQualifierRow = (row: Record<string, unknown>): EventQualifier => ({ id: rowString(row, 'id'), eventId: rowString(row, 'event_id'), label: rowString(row, 'label'), type: rowString(row, 'type', 'text') as EventQualifier['type'], options: Array.isArray(row.options) ? row.options.map(String) : [], required: Boolean(row.required), sortOrder: Number(row.sort_order ?? 0) })

export const toLeadRow = (lead: EventLead) => ({
  id: lead.id,
  event_id: lead.eventId,
  organization_id: lead.organizationId,
  owner_user_id: lead.ownerUserId || null,
  captured_by_user_id: lead.capturedByUserId || null,
  first_name: lead.firstName,
  last_name: lead.lastName,
  company: lead.company,
  job_title: lead.jobTitle,
  email: lead.email,
  phone: lead.phone,
  website: lead.website,
  linkedin_url: lead.linkedinUrl,
  address: lead.address,
  capture_method: lead.captureMethod,
  lead_temperature: lead.leadTemperature,
  qualifier_answers: lead.qualifierAnswers,
  transcript: lead.transcript,
  summary: lead.summary,
  next_steps: lead.nextSteps,
  sync_status: lead.syncStatus,
  sync_error: lead.syncError,
  offline_status: lead.offlineStatus,
  captured_at: lead.capturedAt,
  created_at: lead.createdAt,
  updated_at: lead.updatedAt,
})

const fromLeadRow = (row: Record<string, unknown>): EventLead => ({
  id: rowString(row, 'id'),
  eventId: rowString(row, 'event_id'),
  organizationId: rowString(row, 'organization_id'),
  ownerUserId: rowString(row, 'owner_user_id'),
  ownerName: rowString(row, 'owner_name'),
  capturedByUserId: rowString(row, 'captured_by_user_id'),
  capturedByName: rowString(row, 'captured_by_name'),
  firstName: rowString(row, 'first_name'),
  lastName: rowString(row, 'last_name'),
  company: rowString(row, 'company'),
  jobTitle: rowString(row, 'job_title'),
  email: rowString(row, 'email'),
  phone: rowString(row, 'phone'),
  website: rowString(row, 'website'),
  linkedinUrl: rowString(row, 'linkedin_url'),
  address: rowString(row, 'address'),
  captureMethod: rowString(row, 'capture_method', 'manual') as EventLead['captureMethod'],
  leadTemperature: rowString(row, 'lead_temperature', 'cold') as EventLead['leadTemperature'],
  tagIds: [],
  qualifierAnswers: (row.qualifier_answers ?? {}) as EventLead['qualifierAnswers'],
  notes: [],
  assets: [],
  transcript: rowString(row, 'transcript'),
  summary: rowString(row, 'summary'),
  nextSteps: rowString(row, 'next_steps'),
  syncStatus: rowString(row, 'sync_status', 'not_connected') as EventLead['syncStatus'],
  syncError: rowString(row, 'sync_error'),
  offlineStatus: rowString(row, 'offline_status', 'synced') as EventLead['offlineStatus'],
  capturedAt: rowString(row, 'captured_at', new Date().toISOString()),
  createdAt: rowString(row, 'created_at', new Date().toISOString()),
  updatedAt: rowString(row, 'updated_at', new Date().toISOString()),
})

const toNoteRow = (note: LeadNote) => ({ id: note.id, lead_id: note.leadId, note: note.note, created_by: note.createdBy, created_by_name: note.createdByName, created_at: note.createdAt })
const fromNoteRow = (row: Record<string, unknown>): LeadNote => ({ id: rowString(row, 'id'), leadId: rowString(row, 'lead_id'), note: rowString(row, 'note'), createdBy: rowString(row, 'created_by'), createdByName: rowString(row, 'created_by_name'), createdAt: rowString(row, 'created_at', new Date().toISOString()) })
const toAssetRow = (asset: LeadAsset) => ({ id: asset.id, lead_id: asset.leadId, kind: asset.kind, url: asset.url, name: asset.name, created_at: asset.createdAt })
const fromAssetRow = (row: Record<string, unknown>): LeadAsset => ({ id: rowString(row, 'id'), leadId: rowString(row, 'lead_id'), kind: rowString(row, 'kind', 'business_card_image') as LeadAsset['kind'], url: rowString(row, 'url'), name: rowString(row, 'name'), createdAt: rowString(row, 'created_at', new Date().toISOString()) })

const queryRows = async (table: string) => {
  if (!supabase) return [] as Record<string, unknown>[]
  const result = await supabase.from(table).select('*')
  if (result.error) throw result.error
  return (result.data ?? []) as Record<string, unknown>[]
}

export async function loadRemoteEventWorkspace(userId: string): Promise<EventWorkspace> {
  if (!isSupabaseConfigured || !supabase) return emptyEventWorkspace()
  const [eventRows, memberRows, tagRows, qualifierRows, leadRows, noteRows, assetRows, leadTagRows] = await Promise.all([
    queryRows('events'), queryRows('event_members'), queryRows('event_tags'), queryRows('event_qualifiers'), queryRows('event_leads'), queryRows('event_lead_notes'), queryRows('event_assets'), queryRows('event_lead_tags'),
  ])
  const events = eventRows.filter((row) => rowString(row, 'organization_id') === userId).map(fromEventRow)
  const eventIds = new Set(events.map((event) => event.id))
  const members = memberRows.filter((row) => eventIds.has(rowString(row, 'event_id'))).map(fromMemberRow)
  const tags = tagRows.filter((row) => eventIds.has(rowString(row, 'event_id'))).map(fromTagRow)
  const qualifiers = qualifierRows.filter((row) => eventIds.has(rowString(row, 'event_id'))).map(fromQualifierRow)
  const leads = leadRows.filter((row) => eventIds.has(rowString(row, 'event_id'))).map(fromLeadRow)
  const leadIds = new Set(leads.map((lead) => lead.id))
  const notes = noteRows.filter((row) => leadIds.has(rowString(row, 'lead_id'))).map(fromNoteRow)
  const assets = assetRows.filter((row) => leadIds.has(rowString(row, 'lead_id'))).map(fromAssetRow)
  const tagIdsByLead = new Map<string, string[]>()
  leadTagRows.forEach((row) => {
    const leadId = rowString(row, 'lead_id')
    const tagId = rowString(row, 'tag_id')
    tagIdsByLead.set(leadId, [...(tagIdsByLead.get(leadId) ?? []), tagId])
  })
  return { events, members, tags, qualifiers, leads: leads.map((lead) => ({ ...lead, tagIds: tagIdsByLead.get(lead.id) ?? [], notes: notes.filter((note) => note.leadId === lead.id), assets: assets.filter((asset) => asset.leadId === lead.id) })) }
}

const deleteByEvent = async (table: string, eventId: string) => {
  if (!supabase) return
  const { error } = await supabase.from(table).delete().eq('event_id', eventId)
  if (error) throw error
}

export async function persistRemoteEventWorkspace(workspace: EventWorkspace): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  for (const event of workspace.events) {
    const { error } = await supabase.from('events').upsert(toEventRow(event))
    if (error) throw error
    await Promise.all([deleteByEvent('event_members', event.id), deleteByEvent('event_tags', event.id), deleteByEvent('event_qualifiers', event.id)])
    const members = workspace.members.filter((member) => member.eventId === event.id).map(toMemberRow)
    const tags = workspace.tags.filter((tag) => tag.eventId === event.id).map(toTagRow)
    const qualifiers = workspace.qualifiers.filter((qualifier) => qualifier.eventId === event.id).map(toQualifierRow)
    if (members.length) { const result = await supabase.from('event_members').insert(members); if (result.error) throw result.error }
    if (tags.length) { const result = await supabase.from('event_tags').insert(tags); if (result.error) throw result.error }
    if (qualifiers.length) { const result = await supabase.from('event_qualifiers').insert(qualifiers); if (result.error) throw result.error }
    const leads = workspace.leads.filter((lead) => lead.eventId === event.id)
    if (leads.length) {
      const result = await supabase.from('event_leads').upsert(leads.map(toLeadRow))
      if (result.error) throw result.error
      const leadIds = leads.map((lead) => lead.id)
      await supabase.from('event_lead_tags').delete().in('lead_id', leadIds)
      await supabase.from('event_lead_notes').delete().in('lead_id', leadIds)
      await supabase.from('event_assets').delete().in('lead_id', leadIds)
      const leadTags = leads.flatMap((lead) => lead.tagIds.map((tagId) => ({ lead_id: lead.id, tag_id: tagId })))
      const notes = leads.flatMap((lead) => lead.notes.map(toNoteRow))
      const assets = leads.flatMap((lead) => lead.assets.map(toAssetRow))
      if (leadTags.length) { const result = await supabase.from('event_lead_tags').insert(leadTags); if (result.error) throw result.error }
      if (notes.length) { const result = await supabase.from('event_lead_notes').insert(notes); if (result.error) throw result.error }
      if (assets.length) { const result = await supabase.from('event_assets').insert(assets); if (result.error) throw result.error }
    }
  }
}

export async function deleteRemoteEvent(eventId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) throw error
}

export async function deleteRemoteLead(leadId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.from('event_leads').delete().eq('id', leadId)
  if (error) throw error
}

export async function loadPublicEvent(publicSlug: string): Promise<{ event: EventCampaign; qualifiers: EventQualifier[] } | undefined> {
  if (!supabase) return undefined
  const { data, error } = await supabase.from('events').select('*').eq('public_slug', publicSlug).eq('public_form_enabled', true).maybeSingle()
  if (error) throw error
  if (!data) return undefined
  const event = fromEventRow(data as Record<string, unknown>)
  const rows = await queryRows('event_qualifiers')
  return { event, qualifiers: rows.filter((row) => rowString(row, 'event_id') === event.id).map(fromQualifierRow) }
}

export async function persistPublicLead(lead: EventLead): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('event_leads').insert(toLeadRow(lead))
  if (error) throw error
}

export async function readPublicEventFromLocal(publicSlug: string): Promise<{ event: EventCampaign; qualifiers: EventQualifier[] } | undefined> {
  if (typeof window === 'undefined') return undefined
  let workspaces: EventWorkspace[] = []
  if (hasIndexedDb()) {
    try {
      const database = await openDatabase()
      const value = await new Promise<unknown>((resolve, reject) => {
        const request = database.transaction(objectStoreName, 'readonly').objectStore(objectStoreName).getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      database.close()
      workspaces = (value as EventWorkspace[]).map((item) => normalizeWorkspace(item))
    } catch {
      workspaces = []
    }
  }
  if (!workspaces.length) workspaces = Object.values(readLocalMap()).map((item) => normalizeWorkspace(item))
  for (const workspace of workspaces) {
    const event = workspace.events.find((item) => item.publicSlug === publicSlug && item.publicFormEnabled && ['upcoming', 'active'].includes(getEventStatus(item)))
    if (event) return { event, qualifiers: workspace.qualifiers.filter((qualifier) => qualifier.eventId === event.id) }
  }
  return undefined
}

export interface BusinessCardScannerService {
  extract(file: File): Promise<Partial<EventLead>>
}

export const businessCardScannerService: BusinessCardScannerService = {
  async extract() {
    // OCR is deliberately not faked. A provider can implement this interface later.
    return {}
  },
}

export interface TranscriptionService {
  transcribe(asset: LeadAsset): Promise<string>
}

export const transcriptionService: TranscriptionService = {
  async transcribe() {
    // Return an explicit integration error instead of inventing a transcript.
    throw new Error('Transcription provider is not configured.')
  },
}

export const makeEventId = () => makeId()
