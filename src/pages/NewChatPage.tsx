import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/LanguageContext'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { Profile } from '../lib/types'

export default function NewChatPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useT()
  const [contacts, setContacts] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [contactIds, setContactIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [session])

  async function fetchContacts() {
    if (!session) return
    const { data } = await supabase
      .from('contacts')
      .select('contact_user_id, profiles!contacts_contact_user_id_fkey(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) {
      const profiles = data
        .map(c => (c as unknown as { profiles: Profile }).profiles)
        .filter(Boolean)
      setContacts(profiles)
      setContactIds(new Set(profiles.map(p => p.id)))
    }
    setLoading(false)
  }

  // Search all users when typing
  useEffect(() => {
    if (!search.trim() || !session) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session.user.id)
        .ilike('display_name', `%${search.trim()}%`)
        .order('display_name')
        .limit(20)
      if (data) setSearchResults(data)
      setSearching(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, session])

  async function addContact(userId: string) {
    if (!session) return
    setAddingId(userId)
    await supabase.from('contacts').insert({
      user_id: session.user.id,
      contact_user_id: userId,
    })
    await fetchContacts()
    setAddingId(null)
  }

  async function removeContact(userId: string) {
    if (!session) return
    setAddingId(userId)
    await supabase
      .from('contacts')
      .delete()
      .eq('user_id', session.user.id)
      .eq('contact_user_id', userId)
    await fetchContacts()
    setAddingId(null)
  }

  async function startChat(userId: string) {
    if (creating || !session) return
    setCreating(true)

    const { data: existingId } = await supabase.rpc('find_direct_conversation', {
      p_other_user_id: userId,
    })

    if (existingId) {
      navigate(`/chat/${existingId}`, { replace: true })
      return
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: session.user.id })
      .select()
      .single()

    if (error || !conv) {
      setCreating(false)
      return
    }

    await supabase.from('conversation_members').insert([
      { conversation_id: conv.id, user_id: session.user.id, role: 'admin' },
      { conversation_id: conv.id, user_id: userId, role: 'member' },
    ])

    navigate(`/chat/${conv.id}`, { replace: true })
  }

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.toLowerCase()
    return contacts.filter(c => c.display_name.toLowerCase().includes(q))
  }, [contacts, search])

  const isSearching = search.trim().length > 0
  // Show search results that are NOT already contacts
  const newUsers = searchResults.filter(u => !contactIds.has(u.id))

  return (
    <div className="flex flex-col h-full w-full bg-surface-elevated">
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold">{t('newChat.title')}</h2>
          <p className="text-xs text-text-muted mono-ui">{contacts.length} {t('newChat.contacts')}</p>
        </div>
      </header>

      <div className="px-3 py-2 border-b border-stroke-soft/70">
        <input
          type="text"
          placeholder={t('newChat.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-[#13261d] text-text-primary rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/30 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : (
          <>
            {/* Contacts list */}
            {filteredContacts.length > 0 && (
              <div>
                {!isSearching && (
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-text-muted tracking-wider mono-ui uppercase">
                    {t('newChat.contacts')}
                  </p>
                )}
                {filteredContacts.map(user => (
                  <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] transition-colors">
                    <button
                      onClick={() => startChat(user.id)}
                      disabled={creating}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left disabled:opacity-50"
                    >
                      <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary truncate">{user.display_name}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => removeContact(user.id)}
                      disabled={addingId === user.id}
                      className="text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {t('newChat.removeContact')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty contacts state */}
            {!isSearching && contacts.length === 0 && (
              <p className="text-center text-text-muted text-sm mt-8 px-6">{t('newChat.noContacts')}</p>
            )}

            {/* Search results - non-contacts */}
            {isSearching && newUsers.length > 0 && (
              <div>
                <div className="h-px bg-stroke-soft/60 mx-4" />
                {newUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] transition-colors">
                    <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary truncate">{user.display_name}</p>
                    </div>
                    <button
                      onClick={() => addContact(user.id)}
                      disabled={addingId === user.id}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium text-whatsapp-green bg-whatsapp-green/10 hover:bg-whatsapp-green/20 border border-whatsapp-green/30 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {t('newChat.addContact')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {isSearching && !searching && filteredContacts.length === 0 && newUsers.length === 0 && (
              <p className="text-center text-text-muted text-sm mt-8">{t('newChat.noResults')}</p>
            )}

            {searching && (
              <LoadingSpinner className="mt-4" />
            )}
          </>
        )}
      </div>
    </div>
  )
}
