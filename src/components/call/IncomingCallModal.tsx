import { useCall } from '../../contexts/CallContext'
import { useT } from '../../contexts/LanguageContext'
import Avatar from '../common/Avatar'

export default function IncomingCallModal() {
  const { callState, acceptCall, rejectCall } = useCall()
  const { t } = useT()

  if (callState.status !== 'incoming_ringing' || !callState.remoteUser) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1f18] rounded-3xl border border-stroke-soft shadow-2xl p-8 mx-4 max-w-sm w-full text-center">
        {/* Pulsing avatar */}
        <div className="flex justify-center mb-4">
          <div className="animate-pulse-ring rounded-full p-1">
            <Avatar
              name={callState.remoteUser.displayName}
              avatarUrl={callState.remoteUser.avatarUrl}
              size="lg"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-1">
          {callState.remoteUser.displayName}
        </h3>
        <p className="text-sm text-text-muted mb-8">{t('call.incoming')}</p>

        {/* Accept / Reject buttons */}
        <div className="flex justify-center gap-12">
          {/* Reject */}
          <button
            onClick={rejectCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
            aria-label={t('call.rejectAria')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-colors"
            aria-label={t('call.acceptAria')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
