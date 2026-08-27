export type FieldCategory = 'Personal' | 'General' | 'Social' | 'Messaging' | 'Business'

export type FieldType =
  | 'name'
  | 'job_title'
  | 'department'
  | 'company'
  | 'accreditations'
  | 'headline'
  | 'email'
  | 'phone'
  | 'company_url'
  | 'website'
  | 'custom_link'
  | 'address'
  | 'twitter'
  | 'instagram'
  | 'threads'
  | 'linkedin'
  | 'facebook'
  | 'youtube'
  | 'snapchat'
  | 'tiktok'
  | 'twitch'
  | 'yelp'
  | 'github'
  | 'whatsapp'
  | 'signal'
  | 'telegram'
  | 'discord'
  | 'messenger'
  | 'skype'
  | 'booking_link'
  | 'portfolio'
  | 'store_link'
  | 'calendar_link'
  | 'location'
  | 'custom_text'
  | 'custom_button'

export type ButtonStyle = 'solid' | 'soft' | 'outline'
export type CardMode = 'light' | 'dark'

export interface CardField {
  id: string
  cardId: string
  fieldType: FieldType
  category: FieldCategory
  label: string
  value: string
  metadata: Record<string, string>
  iconKey: string
  sortOrder: number
  isVisible: boolean
}

export interface DesignSettings {
  headerColor: string
  cardBackground: string
  accentColor: string
  textColor: string
  fontFamily: string
  buttonStyle: ButtonStyle
  borderRadius: number
  mode: CardMode
  profileImageUrl: string
  coverImageUrl: string
  companyLogoUrl: string
}

export interface Card {
  id: string
  userId: string
  cardName: string
  slug: string
  theme: string
  design: DesignSettings
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface AppUser {
  id: string
  email: string
  name: string
}

export interface CardBundle {
  card: Card
  fields: CardField[]
}

export interface FieldDefinition {
  type: FieldType
  label: string
  category: FieldCategory
  description: string
  iconKey: string
  multiple?: boolean
}
