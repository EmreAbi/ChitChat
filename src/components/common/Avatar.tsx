interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
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

export default function Avatar({ name, avatarUrl, size = 'md', online }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
    'bg-pink-500', 'bg-amber-500', 'bg-cyan-500',
  ]

  return (
    <div className="relative shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} rounded-full border-2 border-white ${online ? 'bg-whatsapp-green' : 'bg-gray-400'}`}
        />
      )}
    </div>
  )
}
