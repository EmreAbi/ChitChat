import { useState, useEffect } from 'react'
import { useCall } from '../../contexts/CallContext'
import Avatar from '../common/Avatar'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function ActiveCallScreen() {
  const { callState, endCall, toggleMute, toggleSpeaker } = useCall()
  const [elapsed, setElapsed] = useState(0)

  const isActive = callState.status === 'outgoing_ringing' ||
    callState.status === 'connecting' ||
    callState.status === 'connected'

  // Timer for connected calls
  useEffect(() => {
    if (callState.status !== 'connected' || !callState.startedAt) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - callState.startedAt!) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [callState.status, callState.startedAt])

  // Reset elapsed when call ends
  useEffect(() => {
    if (callState.status === 'idle') setElapsed(0)
  }, [callState.status])

  if (!isActive || !callState.remoteUser) return null

  const statusText = callState.status === 'outgoing_ringing'
    ? 'Aranıyor...'
    : callState.status === 'connecting'
      ? 'Bağlanıyor...'
      : formatDuration(elapsed)

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-whatsapp-dark to-gray-900 text-white py-16 px-4">
      {/* Top: User info */}
      <div className="flex flex-col items-center gap-3">
        <Avatar
          name={callState.remoteUser.displayName}
          avatarUrl={callState.remoteUser.avatarUrl}
          size="lg"
        />
        <h2 className="text-xl font-semibold">{callState.remoteUser.displayName}</h2>
        <p className="text-sm text-white/70">{statusText}</p>
      </div>

      {/* Bottom: Controls */}
      <div className="flex items-center gap-8">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            callState.isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
          }`}
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
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
