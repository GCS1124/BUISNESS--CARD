import type { AppUser, Card, CardBundle, CardField, DesignSettings, FieldType } from './types'

const cardsKey = 'cardly.cards.v1'
const userKey = 'cardly.user.v1'

export const makeId = () => typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => { const random = Math.random() * 16 | 0; const value = token === 'x' ? random : random & 3 | 8; return value.toString(16) })

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'my-card'

export const defaultDesign: DesignSettings = {
  headerColor: '#cde7e0',
  cardBackground: '#ffffff',
  accentColor: '#165c51',
  textColor: '#14221f',
  fontFamily: 'Manrope',
  buttonStyle: 'solid',
  borderRadius: 26,
  mode: 'light',
  profileImageUrl: '',
  coverImageUrl: '',
  companyLogoUrl: '',
}

export const defaultUser: AppUser = {
  id: 'local-demo-user',
  email: 'demo@cardly.local',
  name: 'Alex Morgan',
}

const baseField = (
  cardId: string,
  fieldType: FieldType,
  label: string,
  value: string,
  iconKey: string,
  sortOrder: number,
  metadata: Record<string, string> = {},
): CardField => ({
  id: makeId(),
  cardId,
  fieldType,
  category: 'Personal',
  label,
  value,
  metadata,
  iconKey,
  sortOrder,
  isVisible: true,
})

export const createSeedBundle = (): CardBundle => {
  const cardId = makeId()
  const now = new Date().toISOString()
  const card: Card = {
    id: cardId,
    userId: defaultUser.id,
    cardName: 'My main card',
    slug: 'alex-morgan',
    theme: 'Professional',
    design: defaultDesign,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }
  const fields: CardField[] = [
    { ...baseField(cardId, 'name', 'Name', 'Alex Morgan', 'user', 0), category: 'Personal' },
    { ...baseField(cardId, 'job_title', 'Job title', 'Creative strategist', 'briefcase', 1), category: 'Personal' },
    { ...baseField(cardId, 'company', 'Company name', 'Northstar Studio', 'building', 2), category: 'Personal' },
    { ...baseField(cardId, 'headline', 'Headline', 'Make your first impression memorable.', 'sparkles', 3), category: 'Personal' },
    { ...baseField(cardId, 'email', 'Work email', 'alex@northstar.studio', 'mail', 4), category: 'General' },
    { ...baseField(cardId, 'phone', 'Mobile', '+1 415 555 0128', 'phone', 5), category: 'General' },
    { ...baseField(cardId, 'linkedin', 'LinkedIn', 'linkedin.com/in/alexmorgan', 'linkedin', 6), category: 'Social' },
  ]
  return { card, fields }
}

const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const readLocalBundles = (): CardBundle[] => {
  if (!hasStorage()) return [createSeedBundle()]
  try {
    const raw = window.localStorage.getItem(cardsKey)
    if (!raw) {
      const seed = createSeedBundle()
      writeLocalBundles([seed])
      return [seed]
    }
    return JSON.parse(raw) as CardBundle[]
  } catch {
    return [createSeedBundle()]
  }
}

export const writeLocalBundles = (bundles: CardBundle[]) => {
  if (hasStorage()) window.localStorage.setItem(cardsKey, JSON.stringify(bundles))
}

export const readLocalUser = (): AppUser => {
  if (!hasStorage()) return defaultUser
  try {
    const raw = window.localStorage.getItem(userKey)
    return raw ? (JSON.parse(raw) as AppUser) : defaultUser
  } catch {
    return defaultUser
  }
}

export const writeLocalUser = (user: AppUser) => {
  if (hasStorage()) window.localStorage.setItem(userKey, JSON.stringify(user))
}
