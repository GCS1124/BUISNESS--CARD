import { getIcon } from '../lib/icons'

interface IconBadgeProps {
  iconKey: string
  size?: 'sm' | 'md'
  tone?: 'mint' | 'neutral'
}

export function IconBadge({ iconKey, size = 'md', tone = 'mint' }: IconBadgeProps) {
  const Icon = getIcon(iconKey)
  return (
    <span className={`icon-badge icon-badge-${size} icon-badge-${tone}`} aria-hidden="true">
      <Icon size={size === 'sm' ? 14 : 17} strokeWidth={1.8} />
    </span>
  )
}
