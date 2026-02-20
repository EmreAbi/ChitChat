import { useNavigate } from 'react-router'
import Avatar from '../common/Avatar'

interface ChatHeaderProps {
  name: string
  avatarUrl?: string | null
  subtitle?: string
  online?: boolean
}

export default function ChatHeader({ name, avatarUrl, subtitle, online }: ChatHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-2 shadow-md z-10">
      <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <Avatar name={name} avatarUrl={avatarUrl} size="sm" online={online} />
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate">{name}</h2>
        {subtitle && <p className="text-xs text-white/70 truncate">{subtitle}</p>}
      </div>
    </header>
  )
}
