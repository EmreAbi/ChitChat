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
    <div className="flex flex-col h-full w-full bg-surface-elevated">
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold">Direct Channel</h2>
          <p className="text-xs text-text-muted mono-ui">{users.length} contacts</p>
        </div>
      </header>

      <div className="px-3 py-2 border-b border-stroke-soft/70">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-[#13261d] text-text-primary rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/30 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-text-muted text-sm mt-8">Kisi bulunamadi</p>
        ) : (
          filtered.map(user => (
            <button
              key={user.id}
              onClick={() => startChat(user.id)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] active:bg-[#102219] transition-colors disabled:opacity-50 text-left"
            >
              <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
              <div className="text-left min-w-0">
                <p className="font-semibold text-text-primary truncate">{user.display_name}</p>
                <p className="text-sm text-text-muted truncate">{user.email}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
