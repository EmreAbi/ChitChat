import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useConversations } from '../hooks/useConversations'
import ChatListItem from '../components/chat/ChatListItem'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function ChatListPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { conversations, loading } = useConversations()
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const filtered = search
    ? conversations.filter(c => {
        const name = c.type === 'group'
          ? c.name
          : c.members.find(m => m.user_id !== profile?.id)?.display_name
        return name?.toLowerCase().includes(search.toLowerCase())
      })
    : conversations

  return (
    <div className="relative flex flex-col h-full w-full bg-white">
      {/* Header */}
      <header className="bg-header-bg text-header-text px-4 py-3 flex items-center justify-between shadow-md z-10">
        <h1 className="text-xl font-bold">ChitChat</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/new-group')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="New group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m8-4a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
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
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-30">
                  <button
                    onClick={() => { navigate('/profile'); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { signOut(); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-3 py-2 bg-white">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-whatsapp-teal"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No conversations yet"
            description="Start a new chat by tapping the button below"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(conv => (
              <ChatListItem key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-chat')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-whatsapp-green rounded-full shadow-lg flex items-center justify-center text-white hover:bg-whatsapp-teal transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M12 6h-1v4H7v1h4v4h1v-4h4v-1h-4z"/>
        </svg>
      </button>
    </div>
  )
}
