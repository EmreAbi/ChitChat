import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { Profile } from '../lib/types'

export default function NewChatPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session?.user.id ?? '')
        .order('display_name')
      if (data) setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [session])

  const filtered = search
    ? users.filter(u =>
        u.display_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  async function startChat(userId: string) {
    if (creating || !session) return
    setCreating(true)

    // Check for existing conversation
    const { data: existingId } = await supabase.rpc('find_direct_conversation', {
      p_other_user_id: userId,
    })

    if (existingId) {
      navigate(`/chat/${existingId}`, { replace: true })
      return
    }

    // Create new conversation
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: session.user.id })
      .select()
      .single()

    if (error || !conv) {
      setCreating(false)
      return
    }

    // Add both members
    await supabase.from('conversation_members').insert([
      { conversation_id: conv.id, user_id: session.user.id, role: 'admin' },
      { conversation_id: conv.id, user_id: userId, role: 'member' },
    ])

    navigate(`/chat/${conv.id}`, { replace: true })
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 shadow-md z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold">New Chat</h2>
          <p className="text-xs text-white/70">{users.length} contacts</p>
        </div>
      </header>

      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-whatsapp-teal"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-8">No users found</p>
        ) : (
          filtered.map(user => (
            <button
              key={user.id}
              onClick={() => startChat(user.id)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">{user.display_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
