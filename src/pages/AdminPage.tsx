import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/LanguageContext'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { Profile } from '../lib/types'

export default function AdminPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { t } = useT()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.is_system_admin) {
      navigate('/', { replace: true })
      return
    }
    fetchUsers()
  }, [profile, navigate])

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name')
    if (data) setUsers(data)
    setLoading(false)
  }

  async function toggleAdmin(userId: string, currentValue: boolean) {
    setTogglingId(userId)
    await supabase
      .from('profiles')
      .update({ is_system_admin: !currentValue })
      .eq('id', userId)
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, is_system_admin: !currentValue } : u
      )
    )
    setTogglingId(null)
  }

  async function toggleBan(userId: string, currentValue: boolean) {
    setTogglingId(userId)
    await supabase
      .from('profiles')
      .update({ is_banned: !currentValue })
      .eq('id', userId)
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, is_banned: !currentValue } : u
      )
    )
    setTogglingId(null)
  }

  const filtered = useMemo(
    () =>
      users.filter(u => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          u.display_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        )
      }),
    [users, search],
  )

  if (!profile?.is_system_admin) return null

  return (
    <div className="flex flex-col h-full w-full bg-surface-elevated">
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold">{t('admin.title')}</h2>
          <p className="text-[11px] text-text-muted mono-ui">
            {filtered.length} {t('admin.users').toLowerCase()}
          </p>
        </div>
      </header>

      <div className="px-3 py-2.5 border-b border-stroke-soft/70">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('admin.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm text-text-primary bg-[#13261d] rounded-xl border border-stroke-soft outline-none focus:bg-[#172e24] focus:border-whatsapp-teal/40 focus:ring-2 focus:ring-whatsapp-teal/20 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-text-muted text-sm mt-12">{t('admin.noUsers')}</p>
        ) : (
          <div className="divide-y divide-stroke-soft/60">
            {filtered.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#13271e] transition-colors">
                <Avatar name={user.display_name} avatarUrl={user.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">
                    {user.display_name}
                    {user.id === profile.id && (
                      <span className="text-text-muted font-normal ml-1">(you)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-muted truncate mono-ui">@{user.email}</p>
                </div>
                {user.is_banned && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 mono-ui shrink-0">
                    {t('admin.banned')}
                  </span>
                )}
                {user.is_system_admin && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-whatsapp-green/15 text-whatsapp-green border border-whatsapp-green/30 mono-ui shrink-0">
                    {t('admin.systemAdmin')}
                  </span>
                )}
                {user.id !== profile.id && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleBan(user.id, user.is_banned)}
                      disabled={togglingId === user.id}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        user.is_banned
                          ? 'text-whatsapp-green hover:text-[#72ffb4] bg-whatsapp-green/10 hover:bg-whatsapp-green/20 border border-whatsapp-green/30'
                          : 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      {user.is_banned ? t('admin.unban') : t('admin.ban')}
                    </button>
                    <button
                      onClick={() => toggleAdmin(user.id, user.is_system_admin)}
                      disabled={togglingId === user.id}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        user.is_system_admin
                          ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
                          : 'text-whatsapp-green hover:text-[#72ffb4] bg-whatsapp-green/10 hover:bg-whatsapp-green/20 border border-whatsapp-green/30'
                      }`}
                    >
                      {user.is_system_admin ? t('admin.revokeAdmin') : t('admin.grantAdmin')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
