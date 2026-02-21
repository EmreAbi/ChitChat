import { useNavigate } from 'react-router'
import Avatar from '../common/Avatar'

interface ChatHeaderProps {
  name: string
  avatarUrl?: string | null
  subtitle?: string
  online?: boolean
  onCall?: () => void
  showCallButton?: boolean
}

export default function ChatHeader({ name, avatarUrl, subtitle, online, onCall, showCallButton }: ChatHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-header-bg text-header-text flex items-center gap-2 px-2 py-2.5 shadow-md z-10">
      <button
        onClick={() => navigate('/')}
        className="p-1 hover:bg-white/10 rounded-full transition-colors md:hidden"
        aria-label="Sohbet listesine don"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <Avatar name={name} avatarUrl={avatarUrl} size="sm" online={online} />
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate tracking-wide">{name}</h2>
        {subtitle && <p className="text-xs text-white/70 truncate">{subtitle}</p>}
      </div>
      {showCallButton && onCall && (
        <button
          onClick={onCall}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Sesli arama"
          aria-label="Sesli arama baslat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
      )}
    </header>
  )
}
