import type { FieldCategory, FieldDefinition, FieldType } from './types'

const definition = (
  type: FieldType,
  label: string,
  category: FieldCategory,
  description: string,
  iconKey: string,
  multiple = true,
): FieldDefinition => ({ type, label, category, description, iconKey, multiple })

export const fieldDefinitions: FieldDefinition[] = [
  definition('name', 'Name', 'Personal', 'Your full name', 'user', false),
  definition('job_title', 'Job title', 'Personal', 'What you do', 'briefcase', false),
  definition('department', 'Department', 'Personal', 'Your team or practice', 'building', false),
  definition('company', 'Company name', 'Personal', 'Where you work', 'building', false),
  definition('accreditations', 'Accreditations', 'Personal', 'Certifications and credentials', 'medal', true),
  definition('headline', 'Headline', 'Personal', 'A short statement about you', 'sparkles', false),
  definition('email', 'Email', 'General', 'A direct email address', 'mail', true),
  definition('phone', 'Phone', 'General', 'A phone number', 'phone', true),
  definition('company_url', 'Company URL', 'General', 'Your company home page', 'globe', false),
  definition('website', 'Website', 'General', 'A personal website', 'globe', true),
  definition('custom_link', 'Custom link', 'General', 'Link to anything', 'link', true),
  definition('address', 'Address', 'General', 'A postal address', 'map-pin', true),
  definition('twitter', 'X / Twitter', 'Social', 'Your X profile', 'twitter', true),
  definition('instagram', 'Instagram', 'Social', 'Your Instagram profile', 'instagram', true),
  definition('threads', 'Threads', 'Social', 'Your Threads profile', 'at-sign', true),
  definition('linkedin', 'LinkedIn', 'Social', 'Your LinkedIn profile', 'linkedin', true),
  definition('facebook', 'Facebook', 'Social', 'Your Facebook profile', 'facebook', true),
  definition('youtube', 'YouTube', 'Social', 'Your YouTube channel', 'youtube', true),
  definition('snapchat', 'Snapchat', 'Social', 'Your Snapchat profile', 'ghost', true),
  definition('tiktok', 'TikTok', 'Social', 'Your TikTok profile', 'music', true),
  definition('twitch', 'Twitch', 'Social', 'Your Twitch channel', 'twitch', true),
  definition('yelp', 'Yelp', 'Social', 'Your Yelp business page', 'star', true),
  definition('github', 'GitHub', 'Social', 'Your GitHub profile', 'github', true),
  definition('whatsapp', 'WhatsApp', 'Messaging', 'Start a WhatsApp chat', 'message-circle', true),
  definition('signal', 'Signal', 'Messaging', 'Your Signal contact', 'shield', true),
  definition('telegram', 'Telegram', 'Messaging', 'Your Telegram contact', 'send', true),
  definition('discord', 'Discord', 'Messaging', 'Your Discord handle', 'gamepad', true),
  definition('messenger', 'Messenger', 'Messaging', 'Your Messenger profile', 'messages', true),
  definition('skype', 'Skype', 'Messaging', 'Your Skype contact', 'video', true),
  definition('booking_link', 'Booking link', 'Business', 'Let people book time with you', 'calendar', true),
  definition('portfolio', 'Portfolio', 'Business', 'Showcase your work', 'image', true),
  definition('store_link', 'Store link', 'Business', 'Send people to your store', 'store', true),
  definition('calendar_link', 'Calendar link', 'Business', 'Your shared calendar', 'calendar-days', true),
  definition('location', 'Location', 'Business', 'A physical location', 'map', true),
  definition('custom_text', 'Custom text', 'Business', 'Add a freeform note', 'text', true),
  definition('custom_button', 'Custom button', 'Business', 'Add a call-to-action', 'mouse-pointer', true),
]

export const definitionFor = (type: FieldType) => fieldDefinitions.find((item) => item.type === type) ?? fieldDefinitions[0]

export const categoryOrder: FieldCategory[] = ['Personal', 'General', 'Social', 'Messaging', 'Business']
