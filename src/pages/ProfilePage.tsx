import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/common/Avatar'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!profile || !displayName.trim()) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return null

  return (
    <div className="flex flex-col h-full w-full bg-surface-elevated">
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-semibold">Profil</h2>
      </header>

      <div className="flex flex-col items-center p-8 border-b border-stroke-soft/80">
        <Avatar name={profile.display_name} avatarUrl={profile.avatar_url} size="lg" />
        <p className="text-sm text-text-muted mt-3 mono-ui">{profile.email}</p>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="text-sm text-text-muted mb-1 block mono-ui">DISPLAY NAME</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stroke-soft bg-[#13261d] text-text-primary focus:border-whatsapp-teal focus:ring-2 focus:ring-whatsapp-teal/20 outline-none text-sm transition"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full py-3 bg-whatsapp-green text-[#06110d] rounded-xl font-semibold hover:bg-[#72ffb4] transition-colors disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Degisiklikleri Kaydet'}
        </button>

        <button
          onClick={signOut}
          className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
        >
          Cikis Yap
        </button>
      </div>
    </div>
  )
}
