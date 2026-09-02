import { createClient } from '@supabase/supabase-js'
import type { CardBundle, CardField, EmailSignature } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabasePublishableKey!) : null

const toCardRow = (bundle: CardBundle) => ({
  id: bundle.card.id,
  user_id: bundle.card.userId,
  card_name: bundle.card.cardName,
  slug: bundle.card.slug,
  profile_image_url: bundle.card.design.profileImageUrl || null,
  cover_image_url: bundle.card.design.coverImageUrl || null,
  company_logo_url: bundle.card.design.companyLogoUrl || null,
  theme: bundle.card.theme,
  background_color: bundle.card.design.cardBackground,
  header_color: bundle.card.design.headerColor,
  accent_color: bundle.card.design.accentColor,
  text_color: bundle.card.design.textColor,
  font_family: bundle.card.design.fontFamily,
  button_style: bundle.card.design.buttonStyle,
  border_radius: bundle.card.design.borderRadius,
  mode: bundle.card.design.mode,
  is_published: bundle.card.isPublished,
  updated_at: new Date().toISOString(),
})

const fromFieldRow = (row: Record<string, unknown>): CardField => ({
  id: String(row.id),
  cardId: String(row.card_id),
  fieldType: row.field_type as CardField['fieldType'],
  category: row.category as CardField['category'],
  label: String(row.label ?? ''),
  value: String(row.value ?? ''),
  metadata: (row.metadata ?? {}) as Record<string, string>,
  iconKey: String(row.icon ?? 'link'),
  sortOrder: Number(row.sort_order ?? 0),
  isVisible: Boolean(row.is_visible ?? true),
})

const fromCardRow = (row: Record<string, any>) => ({
  id: row.id,
  userId: row.user_id,
  cardName: row.card_name,
  slug: row.slug,
  theme: row.theme ?? 'Professional',
  design: {
    headerColor: row.header_color ?? '#cde7e0',
    cardBackground: row.background_color ?? '#ffffff',
    accentColor: row.accent_color ?? '#165c51',
    textColor: row.text_color ?? '#14221f',
    fontFamily: row.font_family ?? 'Manrope',
    buttonStyle: row.button_style ?? 'solid',
    borderRadius: row.border_radius ?? 26,
    mode: row.mode ?? 'light',
    profileImageUrl: row.profile_image_url ?? '',
    coverImageUrl: row.cover_image_url ?? '',
    companyLogoUrl: row.company_logo_url ?? '',
  },
  isPublished: Boolean(row.is_published),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function loadRemoteBundles(userId: string): Promise<CardBundle[]> {
  if (!supabase) return []
  const { data: cards, error } = await supabase.from('cards').select('*').eq('user_id', userId).order('created_at')
  if (error) throw error
  const { data: fields, error: fieldError } = await supabase.from('card_fields').select('*').order('sort_order')
  if (fieldError) throw fieldError
  return (cards ?? []).map((row) => ({
    card: fromCardRow(row),
    fields: (fields ?? []).filter((field) => field.card_id === row.id).map((field) => fromFieldRow(field)),
  }))
}

export async function loadPublicBundle(slug: string): Promise<CardBundle | undefined> {
  if (!supabase) return undefined
  const { data: card, error } = await supabase.from('cards').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
  if (error) throw error
  if (!card) return undefined
  const { data: fields, error: fieldError } = await supabase.from('card_fields').select('*').eq('card_id', card.id).order('sort_order')
  if (fieldError) throw fieldError
  return { card: fromCardRow(card), fields: (fields ?? []).map((field) => fromFieldRow(field)) }
}

export async function persistRemoteBundle(bundle: CardBundle) {
  if (!supabase) return
  const { error } = await supabase.from('cards').upsert(toCardRow(bundle))
  if (error) throw error
  const { error: deleteError } = await supabase.from('card_fields').delete().eq('card_id', bundle.card.id)
  if (deleteError) throw deleteError
  const rows = bundle.fields.map((field) => ({
    id: field.id,
    card_id: bundle.card.id,
    field_type: field.fieldType,
    category: field.category,
    label: field.label,
    value: field.value,
    metadata: field.metadata,
    icon: field.iconKey,
    sort_order: field.sortOrder,
    is_visible: field.isVisible,
  }))
  if (rows.length) {
    const { error: insertError } = await supabase.from('card_fields').insert(rows)
    if (insertError) throw insertError
  }
}

export async function deleteRemoteBundle(cardId: string) {
  if (!supabase) return
  const { error } = await supabase.from('cards').delete().eq('id', cardId)
  if (error) throw error
}

const toSignatureRow = (signature: EmailSignature) => ({
  id: signature.id,
  user_id: signature.userId,
  name: signature.name,
  template_id: signature.templateId,
  contact_details: signature.contactDetails,
  visible_fields: signature.visibleFields,
  social_links: signature.socialLinks,
  branding: signature.branding,
  cta_settings: signature.ctaSettings,
  profile_image_url: signature.profileImageUrl || null,
  company_logo_url: signature.companyLogoUrl || null,
  linked_business_card_id: signature.linkedBusinessCardId || null,
  is_active: signature.isActive,
  created_at: signature.createdAt,
  updated_at: signature.updatedAt,
})

const fromSignatureRow = (row: Record<string, any>): EmailSignature => ({
  id: String(row.id),
  userId: String(row.user_id),
  name: String(row.name ?? 'Untitled signature'),
  templateId: String(row.template_id ?? 'minimal'),
  contactDetails: (row.contact_details ?? {}) as EmailSignature['contactDetails'],
  visibleFields: (row.visible_fields ?? {}) as EmailSignature['visibleFields'],
  socialLinks: (row.social_links ?? {}) as EmailSignature['socialLinks'],
  branding: (row.branding ?? {}) as EmailSignature['branding'],
  ctaSettings: (row.cta_settings ?? {}) as EmailSignature['ctaSettings'],
  profileImageUrl: String(row.profile_image_url ?? ''),
  companyLogoUrl: String(row.company_logo_url ?? ''),
  linkedBusinessCardId: String(row.linked_business_card_id ?? ''),
  isActive: Boolean(row.is_active ?? true),
  createdAt: String(row.created_at ?? new Date().toISOString()),
  updatedAt: String(row.updated_at ?? new Date().toISOString()),
})

export async function loadRemoteSignatures(userId: string): Promise<EmailSignature[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('email_signatures').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => fromSignatureRow(row))
}

export async function persistRemoteSignature(signature: EmailSignature) {
  if (!supabase) return
  const { error } = await supabase.from('email_signatures').upsert(toSignatureRow(signature))
  if (error) throw error
}

export async function deleteRemoteSignature(signatureId: string) {
  if (!supabase) return
  const { error } = await supabase.from('email_signatures').delete().eq('id', signatureId)
  if (error) throw error
}

export async function uploadCardAsset(file: File, userId: string, kind: 'profile' | 'cover' | 'logo') {
  if (!supabase) return null
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = `${userId}/${kind}-${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('card-assets').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from('card-assets').getPublicUrl(path).data.publicUrl
}

export function remoteCardUrl(slug: string) {
  return `${window.location.origin}/card/${slug}`
}
