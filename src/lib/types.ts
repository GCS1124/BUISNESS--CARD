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

export type SignatureFieldKey = 'fullName' | 'jobTitle' | 'department' | 'companyName' | 'phoneNumber' | 'mobileNumber' | 'email' | 'website' | 'officeAddress'

export interface SignatureContactDetails {
  fullName: string
  jobTitle: string
  department: string
  companyName: string
  phoneNumber: string
  mobileNumber: string
  email: string
  website: string
  officeAddress: string
}

export interface SignatureSocialLinks {
  linkedin: string
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  github: string
  whatsapp: string
}

export type SignatureIconStyle = 'text' | 'filled' | 'outline'
export type SignatureButtonStyle = 'solid' | 'soft' | 'outline'
export type SignatureAlignment = 'left' | 'center'

export interface SignatureBranding {
  primaryColor: string
  accentColor: string
  textColor: string
  fontFamily: string
  fontSize: number
  logoSize: number
  photoSize: number
  spacing: number
  showDivider: boolean
  iconStyle: SignatureIconStyle
  buttonStyle: SignatureButtonStyle
  alignment: SignatureAlignment
}

export type SignatureCtaType = 'save_contact' | 'visit_website' | 'book_meeting' | 'business_card'

export interface SignatureCtaSettings {
  enabled: boolean
  type: SignatureCtaType
  label: string
  url: string
}

export interface EmailSignature {
  id: string
  userId: string
  name: string
  templateId: string
  contactDetails: SignatureContactDetails
  visibleFields: Partial<Record<SignatureFieldKey, boolean>>
  socialLinks: SignatureSocialLinks
  branding: SignatureBranding
  ctaSettings: SignatureCtaSettings
  profileImageUrl: string
  companyLogoUrl: string
  linkedBusinessCardId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
