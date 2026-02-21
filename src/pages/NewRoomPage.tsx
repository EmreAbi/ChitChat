import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/LanguageContext'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { Profile } from '../lib/types'

export default function NewRoomPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useT()
  const [users, setUsers] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupNameEdited, setGroupNameEdited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  const selectedUsers = useMemo(
    () => users.filter(user => selected.has(user.id)),
    [users, selected],
  )

  const suggestedRoomName = useMemo(() => {
    if (selectedUsers.length === 0) return ''
    const preview = selectedUsers.slice(0, 3).map(user => user.display_name)
    const extraCount = selectedUsers.length - preview.length
    return extraCount > 0 ? `${preview.join(', ')} +${extraCount}` : preview.join(', ')
  }, [selectedUsers])
  const effectiveGroupName = groupNameEdited ? groupName.trim() : suggestedRoomName.trim()

  const filtered = useMemo(() => {
    if (!search) return users
    return users.filter(user =>
      user.display_name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [search, users])

  function toggleUser(userId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function createRoom() {
    if (!session || !effectiveGroupName || selected.size < 1 || creating) return
    setCreating(true)
    setSubmitError('')

    const { data: conv, error: roomError } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        name: effectiveGroupName,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (roomError || !conv) {
      setSubmitError(t('newGroup.errorCreate'))
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

    const { error: memberError } = await supabase.from('conversation_members').insert(members)
    if (memberError) {
      setSubmitError(t('newGroup.errorCreate'))
      setCreating(false)
      return
    }

    const selectedNames = users
      .filter(u => selected.has(u.id))
      .map(u => u.display_name)
      .join(', ')

    await supabase.from('messages').insert({
      conversation_id: conv.id,
      sender_id: session.user.id,
      content: t('system.roomCreated', { names: selectedNames }),
      type: 'system',
    })

    navigate(`/chat/${conv.id}`, { replace: true })
  }

  const canCreate = Boolean(effectiveGroupName && selected.size > 0 && !creating)
  const helperText = selected.size < 1
    ? t('newGroup.minMembersHint')
    : !effectiveGroupName
      ? t('newGroup.nameRequired')
      : t('newGroup.readyHint', { count: selected.size })

  return (
    <div className="flex flex-col h-full w-full bg-surface-elevated">
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold">{t('newGroup.title')}</h2>
          <p className="text-xs text-text-muted mono-ui">
            {t('newGroup.selectedCount', { count: selected.size })}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <section className="border border-stroke-soft rounded-2xl bg-[#12281e] p-3.5 space-y-3">
          <p className="text-[11px] tracking-[0.08em] uppercase mono-ui text-text-muted">
            {t('newGroup.roomNameLabel')}
          </p>
          <input
            type="text"
            placeholder={t('newGroup.groupNamePlaceholder')}
            value={groupNameEdited ? groupName : suggestedRoomName}
            onChange={event => {
              setGroupName(event.target.value)
              if (!groupNameEdited) setGroupNameEdited(true)
            }}
            className="w-full px-4 py-3 rounded-xl border border-stroke-soft bg-[#0f2119] text-text-primary focus:border-whatsapp-teal/60 focus:ring-2 focus:ring-whatsapp-teal/20 outline-none text-sm"
          />
          <p className="text-xs text-text-muted">{t('newGroup.nameHint')}</p>
        </section>

        <section className="border border-stroke-soft rounded-2xl bg-[#0f2018] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-text-primary">{t('newGroup.members')}</p>
            <p className="text-xs mono-ui text-text-muted">
              {t('newGroup.selectedCount', { count: selected.size })}
            </p>
          </div>

          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className="flex items-center gap-1 bg-whatsapp-light border border-stroke-soft rounded-full pl-1 pr-2 py-0.5 text-xs text-text-primary"
                >
                  <Avatar name={user.display_name} avatarUrl={user.avatar_url} size="sm" />
                  {user.display_name}
                  <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">{t('newGroup.emptySelection')}</p>
          )}
        </section>

        <section className="border border-stroke-soft rounded-2xl bg-[#0f2018] overflow-hidden">
          <div className="p-3 border-b border-stroke-soft/70">
            <input
              type="text"
              placeholder={t('newGroup.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#13261d] text-text-primary rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/30 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
            />
          </div>

          <div className="max-h-[45vh] overflow-y-auto">
            {loading ? (
              <LoadingSpinner className="my-10" />
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">{t('newGroup.noResults')}</p>
            ) : (
              filtered.map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] transition-colors text-left"
                >
                  <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-text-primary truncate">{user.display_name}</p>
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
        </section>
      </div>

      <div className="mt-auto border-t border-stroke-soft bg-header-bg px-4 py-3 space-y-2">
        <p className={`text-xs mono-ui ${canCreate ? 'text-whatsapp-green' : 'text-text-muted'}`}>
          {helperText}
        </p>
        {submitError && (
          <p className="text-xs text-red-300">{submitError}</p>
        )}
        <button
          onClick={createRoom}
          disabled={!canCreate}
          className="w-full py-3 bg-whatsapp-green text-[#06110d] rounded-xl font-semibold hover:bg-[#72ffb4] transition-colors disabled:opacity-50"
        >
          {creating
            ? t('newGroup.creating')
            : t('newGroup.createWithCount', { count: selected.size })}
        </button>
      </div>
    </div>
  )
}
