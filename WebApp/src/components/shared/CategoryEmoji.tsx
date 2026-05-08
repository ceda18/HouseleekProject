const CATEGORY_EMOJI: Record<string, string> = {
  'Lighting': '💡',
  'Climate Control': '🌡️',
  'Security': '🔒',
  'Entertainment': '🎬',
  'Appliances': '🏠',
  'Sensors': '📡',
  'Energy': '⚡',
  'Garden': '🌿',
  'Network': '📶',
}

export function getCategoryEmoji(categoryName?: string | null): string {
  if (!categoryName) return '📦'
  // Case-insensitive match
  const key = Object.keys(CATEGORY_EMOJI).find(
    (k) => k.toLowerCase() === categoryName.toLowerCase(),
  )
  return key ? CATEGORY_EMOJI[key] : '📦'
}

interface CategoryEmojiProps {
  category?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryEmoji({ category, size = 'md', className }: CategoryEmojiProps) {
  const sizeClass = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }[size]
  return (
    <span className={`${sizeClass} leading-none ${className ?? ''}`} role="img" aria-label={category ?? 'device'}>
      {getCategoryEmoji(category)}
    </span>
  )
}
