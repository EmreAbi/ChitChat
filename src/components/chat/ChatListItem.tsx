import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import { useT } from '../../contexts/LanguageContext'
import { usePresenceContext } from '../../contexts/PresenceContext'
import Avatar from '../common/Avatar'
import { parseFileContent } from '../../lib/types'
import type { ConversationWithDetails } from '../../lib/types'

interface ChatListItemProps {
  conversation: ConversationWithDetails
}

export default function ChatListItem({ conversation }: ChatListItemProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAuth()
  const { lang, t } = useT()
  const { isOnline } = usePresenceContext()
  const isActive = location.pathname === `/chat/${conversation.id}`

  const locale = lang === 'tr' ? 'tr-TR' : 'en-US'

  function formatTime(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return t('chatListItem.yesterday')
    } else if (diffDays < 7) {
      return date.toLocaleDateString(locale, { weekday: 'short' })
    }
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  const otherMembers = conversation.members.filter(m => m.user_id !== session?.user.id)
  const displayName = conversation.type === 'group'
    ? conversation.name || t('chatListItem.group')
    : otherMembers[0]?.display_name || t('chatListItem.unknown')
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
        isActive ? 'bg-[#172f24]' : 'hover:bg-[#13271e] active:bg-[#102219]'
      }`}
    >
      <span className={`absolute inset-y-2 left-1 w-1 rounded-full bg-whatsapp-green transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={displayName} avatarUrl={avatarUrl} online={online} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary truncate">{displayName}</span>
            <span className={`text-xs shrink-0 ml-2 ${conversation.unread_count > 0 ? 'text-whatsapp-green font-semibold mono-ui' : 'text-text-muted mono-ui'}`}>
              {formatTime(conversation.last_message_at)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-sm text-text-muted truncate">
              {conversation.last_message_type === 'image'
                ? `\uD83D\uDCF7 ${t('chatListItem.photo')}`
                : conversation.last_message_type === 'file'
                  ? (() => {
                      const fc = parseFileContent(conversation.last_message_content || '')
                      return `\uD83D\uDCCE ${fc?.name || t('chatListItem.file')}`
                    })()
                  : conversation.last_message_content || t('chatListItem.noMessages')}
            </p>
            {conversation.unread_count > 0 && (
              <span className="ml-2 shrink-0 bg-whatsapp-green text-[#06110d] text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center mono-ui">
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
