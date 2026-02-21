import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/LanguageContext'
import { useConversations } from '../hooks/useConversations'
import ChatListItem from '../components/chat/ChatListItem'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Avatar from '../components/common/Avatar'

export default function ChatListPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { t } = useT()
  const { conversations, loading } = useConversations()
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'rooms' | 'contacts' | 'unread'>('all')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowMenu(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const filtered = useMemo(
    () => conversations
      .filter(c => {
        if (filterMode === 'rooms') return c.type === 'group'
        if (filterMode === 'contacts') return c.type === 'direct'
        if (filterMode === 'unread') return c.unread_count > 0
        return true
      })
      .filter(c => {
        if (!search) return true
        const name = c.type === 'group'
          ? c.name
          : c.members.find(m => m.user_id !== profile?.id)?.display_name
        return name?.toLowerCase().includes(search.toLowerCase())
      }),
    [conversations, filterMode, profile?.id, search],
  )

  const totalUnread = conversations.reduce((total, conversation) => total + conversation.unread_count, 0)

  return (
    <div className="relative flex h-full w-full flex-col bg-surface-elevated">
      {/* Header */}
      <header className="bg-header-bg text-header-text px-4 py-3.5 flex items-center justify-between border-b border-stroke-soft shadow-md z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            name={profile?.display_name || 'User'}
            avatarUrl={profile?.avatar_url}
            size="sm"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-[0.08em] uppercase mono-ui">{t('chatList.title')}</h1>
            <p className="text-[11px] text-text-muted truncate mono-ui">
              {totalUnread > 0 ? `${totalUnread} ${t('chatList.unread')}` : t('chatList.allClear')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {profile?.is_system_admin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-whatsapp-green/10 rounded-xl transition-colors"
              title={t('admin.adminPanel')}
              aria-label={t('admin.adminPanel')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => navigate('/new-chat')}
            className="p-2 hover:bg-whatsapp-green/10 rounded-xl transition-colors"
            title={t('newChat.title')}
            aria-label={t('chatList.newChatAria')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/new-room')}
            className="p-2 hover:bg-whatsapp-green/10 rounded-xl transition-colors"
            title={t('chatList.newGroup')}
            aria-label={t('chatList.newGroupAria')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m8-4a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-whatsapp-green/10 rounded-xl transition-colors"
              aria-label={t('chatList.menu')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0f2219] rounded-xl border border-stroke-soft shadow-xl py-1.5 z-30 animate-fade-up">
                  <button
                    onClick={() => { navigate('/profile'); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-[#163126]"
                  >
                    {t('chatList.profile')}
                  </button>
                  <button
                    onClick={() => { signOut(); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-[#163126]"
                  >
                    {t('chatList.signOut')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-3 py-2.5 bg-surface-elevated border-b border-stroke-soft/70">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('chatList.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm text-text-primary bg-[#13261d] rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/40 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          {[
            { key: 'all', label: t('chatList.filterAll') },
            { key: 'rooms', label: t('chatList.filterRooms') },
            { key: 'contacts', label: t('chatList.filterContacts') },
            { key: 'unread', label: t('chatList.filterUnread') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key as 'all' | 'rooms' | 'contacts' | 'unread')}
              className={`px-3 py-1.5 rounded-full text-xs mono-ui transition ${
                filterMode === tab.key
                  ? 'bg-whatsapp-green text-[#06110d] font-semibold'
                  : 'bg-[#13261d] text-text-muted border border-stroke-soft hover:bg-[#173226]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💬"
            title={t('chatList.emptyTitle')}
            description={t('chatList.emptyDescription')}
          />
        ) : (
          <div className="divide-y divide-stroke-soft/60">
            {filtered.map(conv => (
              <ChatListItem key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-chat')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-whatsapp-green rounded-2xl shadow-[0_10px_28px_rgba(65,243,154,0.4)] flex items-center justify-center text-[#06110d] hover:bg-[#72ffb4] transition-colors z-10"
        aria-label={t('chatList.newChatAria')}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M12 6h-1v4H7v1h4v4h1v-4h4v-1h-4z"/>
        </svg>
      </button>
    </div>
  )
}
