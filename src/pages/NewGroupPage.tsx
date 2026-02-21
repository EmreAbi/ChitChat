import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { Profile } from '../lib/types'

export default function NewGroupPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [step, setStep] = useState<'members' | 'details'>('members')
  const [users, setUsers] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [groupName, setGroupName] = useState('')
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

  function toggleUser(userId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function createGroup() {
    if (!session || !groupName.trim() || selected.size < 1) return
    setCreating(true)

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        name: groupName.trim(),
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error || !conv) {
      setCreating(false)
      return
    }

    const members = [
      { conversation_id: conv.id, user_id: session.user.id, role: 'admin' as const },
      ...Array.from(selected).map(userId => ({
        conversation_id: conv.id,
        user_id: userId,
        role: 'member' as const,
      })),
    ]

    await supabase.from('conversation_members').insert(members)

    // System message
    const selectedNames = users
      .filter(u => selected.has(u.id))
      .map(u => u.display_name)
      .join(', ')

    await supabase.from('messages').insert({
      conversation_id: conv.id,
      sender_id: session.user.id,
      content: `Group created with ${selectedNames}`,
      type: 'system',
    })

    navigate(`/chat/${conv.id}`, { replace: true })
  }

  if (step === 'details') {
    const selectedUsers = users.filter(u => selected.has(u.id))
    return (
      <div className="flex flex-col h-full w-full bg-surface-elevated">
        <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
          <button onClick={() => setStep('members')} className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-semibold">Team Channel</h2>
            <p className="text-xs text-text-muted mono-ui">configure members</p>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Grup adi"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stroke-soft bg-[#13261d] text-text-primary focus:border-whatsapp-teal focus:ring-2 focus:ring-whatsapp-teal/20 outline-none text-sm"
            autoFocus
          />

          <div>
            <p className="text-sm text-text-muted mb-2">Uyeler: {selectedUsers.length}</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(u => (
                <div key={u.id} className="flex items-center gap-1.5 bg-[#13261d] border border-stroke-soft rounded-full pl-1 pr-3 py-1">
                  <Avatar name={u.display_name} avatarUrl={u.avatar_url} size="sm" />
                  <span className="text-sm text-text-primary">{u.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-4">
          <button
            onClick={createGroup}
            disabled={!groupName.trim() || creating}
            className="w-full py-3 bg-whatsapp-green text-[#06110d] rounded-xl font-semibold hover:bg-[#72ffb4] transition-colors disabled:opacity-50"
          >
            {creating ? 'Olusturuluyor...' : 'Grup Olustur'}
          </button>
        </div>
      </div>
    )
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
          <h2 className="font-semibold">Team Channel</h2>
          <p className="text-xs text-text-muted mono-ui">select members</p>
        </div>
      </header>

      {/* Selected chips */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-stroke-soft">
          {users.filter(u => selected.has(u.id)).map(u => (
            <button
              key={u.id}
              onClick={() => toggleUser(u.id)}
              className="flex items-center gap-1 bg-whatsapp-light border border-stroke-soft rounded-full pl-1 pr-2 py-0.5 text-xs text-text-primary"
            >
              <Avatar name={u.display_name} size="sm" />
              {u.display_name}
              <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Kisi ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-[#13261d] text-text-primary rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/30 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : (
          filtered.map(user => (
            <button
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] transition-colors text-left"
            >
              <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
              <div className="flex-1 text-left">
                <p className="font-semibold text-text-primary">{user.display_name}</p>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected.has(user.id) ? 'bg-whatsapp-green border-whatsapp-green' : 'border-stroke-soft'
              }`}>
                {selected.has(user.id) && (
                  <svg className="w-3 h-3 text-[#06110d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {selected.size > 0 && (
        <div className="p-3 border-t border-stroke-soft">
          <button
            onClick={() => setStep('details')}
            className="w-full py-3 bg-whatsapp-green text-[#06110d] rounded-xl font-semibold hover:bg-[#72ffb4] transition-colors"
          >
            Ileri ({selected.size} secili)
          </button>
        </div>
      )}
    </div>
  )
}
