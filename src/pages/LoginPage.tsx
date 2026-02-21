import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signIn, session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_20%_10%,rgba(65,243,154,0.16),transparent_35%),radial-gradient(circle_at_80%_100%,rgba(31,208,122,0.15),transparent_30%),linear-gradient(160deg,#050b08_0%,#08110d_100%)]">
      <div className="w-full max-w-sm bg-[#0d1d16]/96 rounded-3xl border border-stroke-soft shadow-[0_26px_70px_rgba(0,0,0,0.6)] p-8 backdrop-blur-sm">
        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-whatsapp-green rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-8 h-8 text-[#06110d]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-[0.08em] uppercase mono-ui">ESA</h1>
          <p className="text-sm text-text-muted mt-1">Encrypted Secure App</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="bg-red-950/40 border border-red-800/50 text-red-300 text-sm p-3 rounded-xl">{error}</div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-muted mono-ui">EMAIL</span>
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-stroke-soft bg-[#12251c] text-text-primary focus:border-whatsapp-teal focus:ring-2 focus:ring-whatsapp-teal/20 outline-none text-sm transition"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-muted mono-ui">PASSWORD</span>
            <input
              type="password"
              placeholder="Sifreni gir"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-stroke-soft bg-[#12251c] text-text-primary focus:border-whatsapp-teal focus:ring-2 focus:ring-whatsapp-teal/20 outline-none text-sm transition"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-whatsapp-green text-[#06110d] rounded-xl font-semibold hover:bg-[#72ffb4] transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Giris yapiliyor...' : 'Giris Yap'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Hesabin yok mu?{' '}
          <Link to="/register" className="text-whatsapp-green font-semibold hover:underline">
            Kayit Ol
          </Link>
        </p>
      </div>
    </div>
  )
}
