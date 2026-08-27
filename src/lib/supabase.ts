import { createClient } from '@supabase/supabase-js'
import type { CardBundle, CardField } from './types'

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
