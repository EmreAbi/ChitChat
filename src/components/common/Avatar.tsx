interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
  shape?: 'circle' | 'square'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

const dotSizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export default function Avatar({ name, avatarUrl, size = 'md', online, shape = 'circle' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6
  const colors = [
    'bg-[#1b4e36]', 'bg-[#1e4360]', 'bg-[#2b3f63]',
    'bg-[#324a34]', 'bg-[#335147]', 'bg-[#253f44]',
  ]

  const radiusClass = shape === 'square' ? 'rounded-xl' : 'rounded-full'

  return (
    <div className="relative shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} ${radiusClass} object-cover ring-1 ring-stroke-soft`}
        />
      ) : (
        <div className={`${sizeClasses[size]} ${colors[colorIndex]} ${radiusClass} ring-1 ring-stroke-soft flex items-center justify-center text-[#dbffe9] font-semibold`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} rounded-full border-2 border-[#0d1f17] ${online ? 'bg-whatsapp-green' : 'bg-text-muted'}`}
        />
      )}
    </div>
  )
}
