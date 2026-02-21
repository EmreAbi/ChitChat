import { useState, useEffect } from 'react'
import { useCall } from '../../contexts/CallContext'
import { useT } from '../../contexts/LanguageContext'
import Avatar from '../common/Avatar'
import type { CallParticipant } from '../../lib/types'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function ParticipantTile({ participant }: { participant: CallParticipant }) {
  const { t } = useT()

  const statusLabel =
    participant.status === 'connected'
      ? null
      : participant.status === 'ringing'
        ? t('call.ringing')
        : participant.status === 'connecting'
          ? t('call.joining')
          : t('call.ringing')

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5">
      <div className="relative">
        <Avatar
          name={participant.displayName}
          avatarUrl={participant.avatarUrl}
          size="md"
        />
        {participant.status === 'connected' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
        )}
        {participant.status === 'left' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900" />
        )}
      </div>
      <span className="text-xs font-medium text-white truncate max-w-[80px]">
        {participant.displayName}
      </span>
      {statusLabel && (
        <span className="text-[10px] text-white/50">{statusLabel}</span>
      )}
    </div>
  )
}

export default function ActiveCallScreen() {
  const { callState, endCall, toggleMute, toggleSpeaker } = useCall()
  const { t } = useT()
  const [now, setNow] = useState(() => Date.now())

  const isActive = callState.status === 'outgoing_ringing' ||
    callState.status === 'connecting' ||
    callState.status === 'connected' ||
    callState.status === 'ended'

  // Timer for connected calls
  useEffect(() => {
    if (callState.status !== 'connected' || !callState.startedAt) return
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [callState.status, callState.startedAt])

  if (!isActive) return null
  // For 1:1, require remoteUser; for group, require participants
  if (!callState.isGroup && !callState.remoteUser) return null

  const elapsed = callState.status === 'connected' && callState.startedAt
    ? Math.floor((now - callState.startedAt) / 1000)
    : 0

  function getEndReasonText() {
    switch (callState.endReason) {
      case 'rejected': return t('call.rejected')
      case 'busy': return t('call.busy')
      case 'no_answer': return t('call.noAnswer')
      case 'failed': return t('call.failed')
      default: return t('call.ended')
    }
  }

  const statusText = callState.status === 'ended'
    ? getEndReasonText()
    : callState.status === 'outgoing_ringing'
      ? t('call.ringing')
      : callState.status === 'connecting'
        ? t('call.connecting')
        : formatDuration(elapsed)

  const isEnded = callState.status === 'ended'

  // Group call: participant grid
  if (callState.isGroup) {
    const participants = [...callState.participants.values()]
    const connectedCount = participants.filter(p => p.status === 'connected').length

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-whatsapp-dark to-gray-900 text-white py-16 px-4">
        {/* Top: Call info */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-white/70 mono-ui">
            {t('call.participantCount', { count: connectedCount + 1 })}
          </p>
          <p className={`text-sm ${isEnded ? 'text-red-400' : 'text-white/70'}`}>{statusText}</p>
        </div>

        {/* Middle: Participant grid */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm">
          <div className={`grid gap-3 w-full ${
            participants.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
          }`}>
            {participants.map(p => (
              <ParticipantTile key={p.id} participant={p} />
            ))}
          </div>
        </div>

        {/* Bottom: Controls (hidden when ended) */}
        {!isEnded && <div className="flex items-center gap-8">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              callState.isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
            }`}
            aria-label={callState.isMuted ? t('call.unmute') : t('call.mute')}
          >
            {callState.isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
            aria-label={t('call.endAria')}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          {/* Speaker */}
          <button
            onClick={toggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              callState.isSpeaker ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
            }`}
            aria-label={callState.isSpeaker ? t('call.speakerOff') : t('call.speakerOn')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>}
      </div>
    )
  }

  // 1:1 call layout
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-whatsapp-dark to-gray-900 text-white py-16 px-4">
      {/* Top: User info */}
      <div className="flex flex-col items-center gap-3">
        <Avatar
          name={callState.remoteUser!.displayName}
          avatarUrl={callState.remoteUser!.avatarUrl}
          size="lg"
        />
        <h2 className="text-xl font-semibold">{callState.remoteUser!.displayName}</h2>
        <p className={`text-sm ${isEnded ? 'text-red-400' : 'text-white/70'}`}>{statusText}</p>
      </div>

      {/* Bottom: Controls (hidden when ended) */}
      {!isEnded && (
        <div className="flex items-center gap-8">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              callState.isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
            }`}
            aria-label={callState.isMuted ? t('call.unmute') : t('call.mute')}
          >
            {callState.isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
            aria-label={t('call.endAria')}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          {/* Speaker */}
          <button
            onClick={toggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              callState.isSpeaker ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
            }`}
            aria-label={callState.isSpeaker ? t('call.speakerOff') : t('call.speakerOn')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
