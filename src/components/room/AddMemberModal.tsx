import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useT } from '../../contexts/LanguageContext'
import Avatar from '../common/Avatar'
import LoadingSpinner from '../common/LoadingSpinner'
import type { Profile, MemberInfo } from '../../lib/types'

interface AddMemberModalProps {
  conversationId: string
  currentMembers: MemberInfo[]
  onClose: () => void
  onMemberAdded: () => void
}

export default function AddMemberModal({ conversationId, currentMembers, onClose, onMemberAdded }: AddMemberModalProps) {
  const { session } = useAuth()
  const { t } = useT()
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name')
      if (data) {
        const memberIds = new Set(currentMembers.map(m => m.user_id))
        setUsers(data.filter(u => !memberIds.has(u.id)))
      }
      setLoading(false)
    }
    fetchUsers()
  }, [session, currentMembers])

  const filtered = search
    ? users.filter(u => u.display_name.toLowerCase().includes(search.toLowerCase()))
    : users

  async function handleAdd(userId: string) {
    setAdding(userId)
    const { error } = await supabase.rpc('add_room_member', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    })
    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      onMemberAdded()
    }
    setAdding(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1f18] rounded-3xl border border-stroke-soft shadow-2xl mx-4 max-w-sm w-full max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-stroke-soft">
          <h3 className="text-sm font-semibold text-text-primary mb-3 mono-ui">{t('addMember.title')}</h3>
          <input
            type="text"
            placeholder={t('addMember.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#13261d] text-text-primary rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/30 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingSpinner className="my-8" />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">{t('addMember.noResults')}</p>
          ) : (
            filtered.map(user => (
              <button
                key={user.id}
                onClick={() => handleAdd(user.id)}
                disabled={adding === user.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] transition-colors text-left disabled:opacity-50"
              >
                <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{user.display_name}</p>
                </div>
                {adding === user.id && (
                  <span className="text-xs text-text-muted mono-ui">{t('addMember.adding')}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
