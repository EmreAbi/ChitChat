import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import { usePresenceContext } from '../../contexts/PresenceContext'
import Avatar from '../common/Avatar'
import { parseFileContent } from '../../lib/types'
import type { ConversationWithDetails } from '../../lib/types'

interface ChatListItemProps {
  conversation: ConversationWithDetails
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Dun'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('tr-TR', { weekday: 'short' })
  }
  return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
}

export default function ChatListItem({ conversation }: ChatListItemProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAuth()
  const { isOnline } = usePresenceContext()
  const isActive = location.pathname === `/chat/${conversation.id}`

  const otherMembers = conversation.members.filter(m => m.user_id !== session?.user.id)
  const displayName = conversation.type === 'group'
    ? conversation.name || 'Grup'
    : otherMembers[0]?.display_name || 'Bilinmeyen'
  const avatarUrl = conversation.type === 'group'
    ? conversation.avatar_url
    : otherMembers[0]?.avatar_url
  const online = conversation.type === 'direct' && otherMembers[0]
    ? isOnline(otherMembers[0].user_id)
    : undefined

  return (
    <button
      onClick={() => navigate(`/chat/${conversation.id}`)}
      className={`group relative w-full text-left transition-colors ${
        isActive ? 'bg-emerald-50/80' : 'hover:bg-gray-50 active:bg-gray-100'
      }`}
    >
      <span className={`absolute inset-y-2 left-1 w-1 rounded-full bg-whatsapp-teal transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={displayName} avatarUrl={avatarUrl} online={online} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 truncate">{displayName}</span>
            <span className={`text-xs shrink-0 ml-2 ${conversation.unread_count > 0 ? 'text-whatsapp-green font-semibold' : 'text-gray-500'}`}>
              {formatTime(conversation.last_message_at)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-sm text-gray-500 truncate">
              {conversation.last_message_type === 'image'
                ? '\uD83D\uDCF7 Fotograf'
                : conversation.last_message_type === 'file'
                  ? (() => {
                      const fc = parseFileContent(conversation.last_message_content || '')
                      return `\uD83D\uDCCE ${fc?.name || 'Dosya'}`
                    })()
                  : conversation.last_message_content || 'Henuz mesaj yok'}
            </p>
            {conversation.unread_count > 0 && (
              <span className="ml-2 shrink-0 bg-whatsapp-green text-white text-xs font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
