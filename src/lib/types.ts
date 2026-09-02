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
export type SignatureAlignment = 'left' | 'center' | 'right'
export type SignatureImageShape = 'circle' | 'rounded' | 'square'
export type SignatureDividerStyle = 'solid' | 'dashed' | 'dotted'
export type SignatureIconShape = 'circle' | 'rounded' | 'square'

export interface SignatureBranding {
  primaryColor: string
  accentColor: string
  textColor: string
  secondaryTextColor: string
  iconColor: string
  dividerColor: string
  ctaColor: string
  fontFamily: string
  fontSize: number
  nameSize: number
  detailsSize: number
  jobTitleSize: number
  logoSize: number
  photoSize: number
  spacing: number
  iconSize: number
  dividerThickness: number
  showDivider: boolean
  dividerStyle: SignatureDividerStyle
  imageShape: SignatureImageShape
  iconShape: SignatureIconShape
  iconStyle: SignatureIconStyle
  buttonStyle: SignatureButtonStyle
  alignment: SignatureAlignment
}

export type SignatureCtaType = 'save_contact' | 'visit_website' | 'book_meeting' | 'business_card' | 'custom'

export interface SignatureCtaSettings {
  enabled: boolean
  type: SignatureCtaType
  label: string
  url: string
  style: SignatureButtonStyle
  disclaimer: string
  bannerText: string
  customText: string
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

export type EventStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'archived'
export type EventType = 'conference' | 'trade_show' | 'expo' | 'networking' | 'meetup' | 'corporate' | 'career_fair' | 'custom'
export type EventMemberRole = 'event_admin' | 'sales_rep' | 'marketing_rep' | 'viewer'
export type CaptureMethod = 'qr' | 'badge' | 'business_card' | 'manual' | 'digital_business_card' | 'event_form'
export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type LeadSyncStatus = 'not_connected' | 'pending' | 'synced' | 'failed'
export type OfflineSyncStatus = 'synced' | 'pending' | 'failed'
export type EventQualifierType = 'text' | 'dropdown' | 'multi_select' | 'radio' | 'checkbox' | 'number'

export interface EventCampaign {
  id: string
  organizationId: string
  name: string
  description: string
  eventType: EventType
  location: string
  city: string
  country: string
  startDate: string
  endDate: string
  timezone: string
  budget: number | null
  revenueGoal: number | null
  actualRevenue: number | null
  leadGoal: number | null
  campaignName: string
  eventOwnerId: string
  eventOwnerName: string
  boothNumber: string
  eventWebsite: string
  internalNotes: string
  status: EventStatus
  publicFormEnabled: boolean
  publicSlug: string
  consentText: string
  linkedCardId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EventMember {
  id: string
  eventId: string
  userId: string
  name: string
  email: string
  role: EventMemberRole
}

export interface EventTag {
  id: string
  eventId: string
  name: string
  color: string
}

export interface EventQualifier {
  id: string
  eventId: string
  label: string
  type: EventQualifierType
  options: string[]
  required: boolean
  sortOrder: number
}

export interface LeadNote {
  id: string
  leadId: string
  note: string
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface LeadAsset {
  id: string
  leadId: string
  kind: 'voice_note' | 'business_card_image' | 'badge_image'
  url: string
  name: string
  createdAt: string
}

export interface EventLead {
  id: string
  eventId: string
  organizationId: string
  ownerUserId: string
  ownerName: string
  capturedByUserId: string
  capturedByName: string
  firstName: string
  lastName: string
  company: string
  jobTitle: string
  email: string
  phone: string
  website: string
  linkedinUrl: string
  address: string
  captureMethod: CaptureMethod
  leadTemperature: LeadTemperature
  tagIds: string[]
  qualifierAnswers: Record<string, string | string[] | boolean | number>
  notes: LeadNote[]
  assets: LeadAsset[]
  transcript: string
  summary: string
  nextSteps: string
  syncStatus: LeadSyncStatus
  syncError: string
  offlineStatus: OfflineSyncStatus
  capturedAt: string
  createdAt: string
  updatedAt: string
}

export interface EventWorkspace {
  events: EventCampaign[]
  members: EventMember[]
  tags: EventTag[]
  qualifiers: EventQualifier[]
  leads: EventLead[]
}
