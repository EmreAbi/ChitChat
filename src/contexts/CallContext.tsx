import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { getTurnCredentials } from '../lib/turnCredentials'
import { playRingtone, playRingback, stopAllTones } from '../lib/ringtoneSound'
import { applyVoiceEffect, getStoredVoiceEffect, type VoiceEffect } from '../lib/voiceEffects'
import type { CallState } from '../lib/types'

// --- Actions ---

type CallAction =
  | { type: 'START_OUTGOING'; conversationId: string; callLogId: string; remoteUser: CallState['remoteUser'] }
  | { type: 'INCOMING_CALL'; conversationId: string; callLogId: string; remoteUser: CallState['remoteUser'] }
  | { type: 'CALL_ACCEPTED' }
  | { type: 'CONNECTED' }
  | { type: 'CALL_ENDED' }
  | { type: 'RESET' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SPEAKER' }

const initialState: CallState = {
  status: 'idle',
  conversationId: null,
  callLogId: null,
  remoteUser: null,
  isMuted: false,
  isSpeaker: false,
  startedAt: null,
}

function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case 'START_OUTGOING':
      return {
        ...initialState,
        status: 'outgoing_ringing',
        conversationId: action.conversationId,
        callLogId: action.callLogId,
        remoteUser: action.remoteUser,
      }
    case 'INCOMING_CALL':
      return {
        ...initialState,
        status: 'incoming_ringing',
        conversationId: action.conversationId,
        callLogId: action.callLogId,
        remoteUser: action.remoteUser,
      }
    case 'CALL_ACCEPTED':
      return { ...state, status: 'connecting' }
    case 'CONNECTED':
      return { ...state, status: 'connected', startedAt: Date.now() }
    case 'CALL_ENDED':
      return { ...state, status: 'ended' }
    case 'RESET':
      return initialState
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }
    case 'TOGGLE_SPEAKER':
      return { ...state, isSpeaker: !state.isSpeaker }
    default:
      return state
  }
}

// --- Context ---

interface CallContextType {
  callState: CallState
  voiceEffect: VoiceEffect
  startCall: (conversationId: string, remoteUser: CallState['remoteUser'], voiceEffect?: VoiceEffect) => Promise<void>
  acceptCall: () => void
  rejectCall: () => void
  endCall: () => void
  toggleMute: () => void
  toggleSpeaker: () => void
}

const CallContext = createContext<CallContextType | undefined>(undefined)

// --- Provider ---

const RING_TIMEOUT_MS = 30000

export function CallProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [callState, dispatch] = useReducer(callReducer, initialState)

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const remoteAudio = useRef<HTMLAudioElement | null>(null)
  const sessionChannel = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const stopTone = useRef<(() => void) | null>(null)
  const ringTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const voiceEffectRef = useRef<VoiceEffect>(getStoredVoiceEffect())

  // Store callState in ref for use in callbacks
  const callStateRef = useRef(callState)
  callStateRef.current = callState

  // --- Cleanup ---

  const cleanup = useCallback(() => {
    stopAllTones()
    if (stopTone.current) {
      stopTone.current()
      stopTone.current = null
    }
    if (ringTimeout.current) {
      clearTimeout(ringTimeout.current)
      ringTimeout.current = null
    }
    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop())
      localStream.current = null
    }
    if (sessionChannel.current) {
      supabase.removeChannel(sessionChannel.current)
      sessionChannel.current = null
    }
  }, [])

  // --- Create WebRTC Peer Connection ---

  const createPeerConnection = useCallback(async (_callLogId: string, effect: VoiceEffect = 'disguise') => {
    const iceServers = await getTurnCredentials()
    const pc = new RTCPeerConnection({ iceServers })
    peerConnection.current = pc

    // Get local audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    localStream.current = stream

    // Insert Web Audio API processing between mic and peer connection
    const actx = new AudioContext()
    audioContextRef.current = actx
    const source = actx.createMediaStreamSource(stream)
    const effectOutput = await applyVoiceEffect(actx, source, effect)
    const destination = actx.createMediaStreamDestination()
    effectOutput.connect(destination)
    // Add processed tracks to pc instead of raw tracks
    destination.stream.getTracks().forEach(track => pc.addTrack(track, destination.stream))

    // Handle remote audio
    pc.ontrack = (event) => {
      if (!remoteAudio.current) {
        remoteAudio.current = new Audio()
        remoteAudio.current.autoplay = true
      }
      remoteAudio.current.srcObject = event.streams[0]
    }

    // ICE candidates → send via session channel
    pc.onicecandidate = (event) => {
      if (event.candidate && sessionChannel.current) {
        sessionChannel.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate.toJSON() },
        })
      }
    }

    // Connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        stopAllTones()
        dispatch({ type: 'CONNECTED' })
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        endCallInternal()
      }
    }

    return pc
  }, [])

  // --- Join session channel for WebRTC signaling ---

  const joinSessionChannel = useCallback((callLogId: string, _isCaller: boolean) => {
    const channel = supabase.channel(`call:session:${callLogId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (!peerConnection.current) return
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        const answer = await peerConnection.current.createAnswer()
        await peerConnection.current.setLocalDescription(answer)
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: { sdp: answer },
        })
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (!peerConnection.current) return
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (!peerConnection.current) return
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate))
        } catch {
          // Candidate may arrive before remote description
        }
      })
      .on('broadcast', { event: 'call-end' }, () => {
        endCallInternal()
      })
      .subscribe()

    sessionChannel.current = channel
    return channel
  }, [])

  // --- End call (internal, no signaling) ---

  const endCallInternal = useCallback(() => {
    const state = callStateRef.current
    if (state.status === 'idle' || state.status === 'ended') return

    // Update call log
    if (state.callLogId) {
      const updates: Record<string, unknown> = { ended_at: new Date().toISOString() }
      if (state.status === 'connected' && state.startedAt) {
        updates.status = 'completed'
        updates.duration_seconds = Math.round((Date.now() - state.startedAt) / 1000)
      } else if (state.status === 'incoming_ringing') {
        updates.status = 'missed'
      } else if (state.status === 'outgoing_ringing') {
        updates.status = 'no_answer'
      }
      supabase.from('call_logs').update(updates).eq('id', state.callLogId).then()
    }

    cleanup()
    dispatch({ type: 'CALL_ENDED' })
    setTimeout(() => dispatch({ type: 'RESET' }), 2000)
  }, [cleanup])

  // --- Listen for incoming calls on user channel ---

  useEffect(() => {
    if (!session?.user?.id) return

    const userChannel = supabase.channel(`call:user:${session.user.id}`, {
      config: { broadcast: { self: false } },
    })

    userChannel
      .on('broadcast', { event: 'call-invite' }, ({ payload }) => {
        const current = callStateRef.current
        // Busy — reject if already in a call
        if (current.status !== 'idle') {
          // Send busy signal back
          const callerChannel = supabase.channel(`call:user:${payload.callerId}:response`, {
            config: { broadcast: { self: false } },
          })
          callerChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              callerChannel.send({
                type: 'broadcast',
                event: 'call-busy',
                payload: { callLogId: payload.callLogId },
              })
              setTimeout(() => supabase.removeChannel(callerChannel), 1000)
            }
          })
          return
        }

        dispatch({
          type: 'INCOMING_CALL',
          conversationId: payload.conversationId,
          callLogId: payload.callLogId,
          remoteUser: payload.caller,
        })

        // Play ringtone
        stopTone.current = playRingtone()

        // Auto-reject after timeout
        ringTimeout.current = setTimeout(() => {
          if (callStateRef.current.status === 'incoming_ringing') {
            rejectCallInternal(payload.callLogId, payload.callerId, 'no_answer')
          }
        }, RING_TIMEOUT_MS)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(userChannel)
    }
  }, [session?.user?.id])

  // --- Start a call (caller side) ---

  const startCall = useCallback(async (conversationId: string, remoteUser: CallState['remoteUser'], voiceEffect: VoiceEffect = 'disguise') => {
    if (!session?.user?.id || !remoteUser || callStateRef.current.status !== 'idle') return
    voiceEffectRef.current = voiceEffect

    // Create call log
    const { data: callLog, error } = await supabase
      .from('call_logs')
      .insert({
        conversation_id: conversationId,
        caller_id: session.user.id,
        callee_id: remoteUser.id,
        status: 'initiated',
      })
      .select('id')
      .single()

    if (error || !callLog) return

    dispatch({
      type: 'START_OUTGOING',
      conversationId,
      callLogId: callLog.id,
      remoteUser,
    })

    // Play ringback tone
    stopTone.current = playRingback()

    // Send invite via callee's user channel
    const calleeChannel = supabase.channel(`call:user:${remoteUser.id}`, {
      config: { broadcast: { self: false } },
    })
    calleeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        calleeChannel.send({
          type: 'broadcast',
          event: 'call-invite',
          payload: {
            conversationId,
            callLogId: callLog.id,
            callerId: session.user.id,
            caller: {
              id: session.user.id,
              displayName: session.user.user_metadata?.display_name || 'Unknown',
              avatarUrl: null,
            },
          },
        })
        // Don't remove — keep for responses
      }
    })

    // Listen for response on own channel
    const responseChannel = supabase.channel(`call:user:${session.user.id}:response`, {
      config: { broadcast: { self: false } },
    })
    responseChannel
      .on('broadcast', { event: 'call-accept' }, async ({ payload }) => {
        if (payload.callLogId !== callLog.id) return
        stopAllTones()
        dispatch({ type: 'CALL_ACCEPTED' })

        // Update call log
        await supabase.from('call_logs').update({ answered_at: new Date().toISOString() }).eq('id', callLog.id)

        // Create peer connection and session channel
        const pc = await createPeerConnection(callLog.id, voiceEffectRef.current)
        joinSessionChannel(callLog.id, true)

        // Caller creates offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        // Small delay to let channel stabilize
        setTimeout(() => {
          sessionChannel.current?.send({
            type: 'broadcast',
            event: 'offer',
            payload: { sdp: offer },
          })
        }, 500)

        supabase.removeChannel(responseChannel)
        supabase.removeChannel(calleeChannel)
      })
      .on('broadcast', { event: 'call-reject' }, ({ payload }) => {
        if (payload.callLogId !== callLog.id) return
        supabase.from('call_logs').update({ status: 'rejected', ended_at: new Date().toISOString() }).eq('id', callLog.id).then()
        cleanup()
        dispatch({ type: 'CALL_ENDED' })
        setTimeout(() => dispatch({ type: 'RESET' }), 2000)
        supabase.removeChannel(responseChannel)
        supabase.removeChannel(calleeChannel)
      })
      .on('broadcast', { event: 'call-busy' }, ({ payload }) => {
        if (payload.callLogId !== callLog.id) return
        supabase.from('call_logs').update({ status: 'missed', ended_at: new Date().toISOString() }).eq('id', callLog.id).then()
        cleanup()
        dispatch({ type: 'CALL_ENDED' })
        setTimeout(() => dispatch({ type: 'RESET' }), 2000)
        supabase.removeChannel(responseChannel)
        supabase.removeChannel(calleeChannel)
      })
      .subscribe()

    // Timeout for no answer
    ringTimeout.current = setTimeout(() => {
      if (callStateRef.current.status === 'outgoing_ringing') {
        supabase.from('call_logs').update({ status: 'no_answer', ended_at: new Date().toISOString() }).eq('id', callLog.id).then()
        cleanup()
        dispatch({ type: 'CALL_ENDED' })
        setTimeout(() => dispatch({ type: 'RESET' }), 2000)
        supabase.removeChannel(responseChannel)
        supabase.removeChannel(calleeChannel)
      }
    }, RING_TIMEOUT_MS)
  }, [session, createPeerConnection, joinSessionChannel, cleanup])

  // --- Accept call (callee side) ---

  const acceptCall = useCallback(async () => {
    const state = callStateRef.current
    if (state.status !== 'incoming_ringing' || !state.remoteUser || !state.callLogId) return

    stopAllTones()
    if (ringTimeout.current) {
      clearTimeout(ringTimeout.current)
      ringTimeout.current = null
    }

    dispatch({ type: 'CALL_ACCEPTED' })

    // Send accept to caller's response channel
    const callerResponseChannel = supabase.channel(`call:user:${state.remoteUser.id}:response`, {
      config: { broadcast: { self: false } },
    })
    callerResponseChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        callerResponseChannel.send({
          type: 'broadcast',
          event: 'call-accept',
          payload: { callLogId: state.callLogId },
        })
        setTimeout(() => supabase.removeChannel(callerResponseChannel), 1000)
      }
    })

    // Create peer connection and join session channel
    await createPeerConnection(state.callLogId)
    joinSessionChannel(state.callLogId, false)
  }, [createPeerConnection, joinSessionChannel])

  // --- Reject call helper ---

  const rejectCallInternal = useCallback((callLogId: string, callerId: string, status: string) => {
    stopAllTones()
    if (ringTimeout.current) {
      clearTimeout(ringTimeout.current)
      ringTimeout.current = null
    }

    // Send reject to caller
    const callerResponseChannel = supabase.channel(`call:user:${callerId}:response`, {
      config: { broadcast: { self: false } },
    })
    callerResponseChannel.subscribe((st) => {
      if (st === 'SUBSCRIBED') {
        callerResponseChannel.send({
          type: 'broadcast',
          event: 'call-reject',
          payload: { callLogId },
        })
        setTimeout(() => supabase.removeChannel(callerResponseChannel), 1000)
      }
    })

    supabase.from('call_logs').update({ status, ended_at: new Date().toISOString() }).eq('id', callLogId).then()

    cleanup()
    dispatch({ type: 'CALL_ENDED' })
    setTimeout(() => dispatch({ type: 'RESET' }), 2000)
  }, [cleanup])

  // --- Reject call (callee side) ---

  const rejectCall = useCallback(() => {
    const state = callStateRef.current
    if (state.status !== 'incoming_ringing' || !state.remoteUser || !state.callLogId) return
    rejectCallInternal(state.callLogId, state.remoteUser.id, 'rejected')
  }, [rejectCallInternal])

  // --- End active call ---

  const endCall = useCallback(() => {
    // Send end signal via session channel
    if (sessionChannel.current) {
      sessionChannel.current.send({
        type: 'broadcast',
        event: 'call-end',
        payload: {},
      })
    }
    endCallInternal()
  }, [endCallInternal])

  // --- Toggle mute ---

  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = callStateRef.current.isMuted // will be toggled
      }
    }
    dispatch({ type: 'TOGGLE_MUTE' })
  }, [])

  // --- Toggle speaker ---

  const toggleSpeaker = useCallback(() => {
    if (remoteAudio.current) {
      const audioEl = remoteAudio.current as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }
      if (audioEl.setSinkId) {
        const useSpeaker = !callStateRef.current.isSpeaker
        audioEl.setSinkId(useSpeaker ? 'default' : '').catch(() => {})
      }
    }
    dispatch({ type: 'TOGGLE_SPEAKER' })
  }, [])

  // --- Cleanup on unmount ---

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <CallContext.Provider value={{ callState, voiceEffect: voiceEffectRef.current, startCall, acceptCall, rejectCall, endCall, toggleMute, toggleSpeaker }}>
      {children}
    </CallContext.Provider>
  )
}

export function useCall() {
  const context = useContext(CallContext)
  if (!context) throw new Error('useCall must be used within CallProvider')
  return context
}
