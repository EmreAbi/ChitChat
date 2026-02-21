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
import type { CallState, CallParticipant, CallEndReason } from '../lib/types'

// --- Actions ---

type CallAction =
  | { type: 'START_OUTGOING'; conversationId: string; callLogId: string; remoteUser: CallState['remoteUser'] }
  | { type: 'INCOMING_CALL'; conversationId: string; callLogId: string; remoteUser: CallState['remoteUser'] }
  | { type: 'START_GROUP_CALL'; conversationId: string; callLogId: string; participants: Map<string, CallParticipant> }
  | { type: 'INCOMING_GROUP_CALL'; conversationId: string; callLogId: string; remoteUser: CallState['remoteUser']; participants: Map<string, CallParticipant> }
  | { type: 'CALL_ACCEPTED' }
  | { type: 'CONNECTED' }
  | { type: 'CALL_ENDED'; reason?: CallEndReason }
  | { type: 'RESET' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SPEAKER' }
  | { type: 'PARTICIPANT_CONNECTED'; userId: string }
  | { type: 'PARTICIPANT_LEFT'; userId: string }

const initialState: CallState = {
  status: 'idle',
  conversationId: null,
  callLogId: null,
  remoteUser: null,
  isMuted: false,
  isSpeaker: false,
  startedAt: null,
  isGroup: false,
  participants: new Map(),
  endReason: null,
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
    case 'START_GROUP_CALL':
      return {
        ...initialState,
        status: 'outgoing_ringing',
        conversationId: action.conversationId,
        callLogId: action.callLogId,
        isGroup: true,
        participants: action.participants,
      }
    case 'INCOMING_GROUP_CALL':
      return {
        ...initialState,
        status: 'incoming_ringing',
        conversationId: action.conversationId,
        callLogId: action.callLogId,
        remoteUser: action.remoteUser,
        isGroup: true,
        participants: action.participants,
      }
    case 'CALL_ACCEPTED':
      return { ...state, status: 'connecting' }
    case 'CONNECTED':
      return { ...state, status: 'connected', startedAt: state.startedAt ?? Date.now() }
    case 'CALL_ENDED':
      return { ...state, status: 'ended', endReason: action.reason ?? null }
    case 'RESET':
      return initialState
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }
    case 'TOGGLE_SPEAKER':
      return { ...state, isSpeaker: !state.isSpeaker }
    case 'PARTICIPANT_CONNECTED': {
      const p = state.participants.get(action.userId)
      if (!p) return state
      const next = new Map(state.participants)
      next.set(action.userId, { ...p, status: 'connected' })
      // If this is the first connected participant in a group call, set startedAt
      const hasConnected = [...next.values()].some(v => v.status === 'connected')
      return {
        ...state,
        participants: next,
        status: hasConnected ? 'connected' : state.status,
        startedAt: hasConnected && !state.startedAt ? Date.now() : state.startedAt,
      }
    }
    case 'PARTICIPANT_LEFT': {
      const p = state.participants.get(action.userId)
      if (!p) return state
      const next = new Map(state.participants)
      next.set(action.userId, { ...p, status: 'left' })
      return { ...state, participants: next }
    }
    default:
      return state
  }
}

// --- Context ---

interface CallContextType {
  callState: CallState
  voiceEffect: VoiceEffect
  startCall: (conversationId: string, remoteUser: CallState['remoteUser'], voiceEffect?: VoiceEffect, groupMembers?: { id: string; displayName: string; avatarUrl: string | null }[]) => Promise<void>
  acceptCall: (effect?: VoiceEffect) => void
  rejectCall: () => void
  endCall: () => void
  toggleMute: () => void
  toggleSpeaker: () => void
}

const CallContext = createContext<CallContextType | undefined>(undefined)

// --- Provider ---

const RING_TIMEOUT_MS = 30000
const MAX_PARTICIPANTS = 5

interface PeerEntry {
  pc: RTCPeerConnection
  audioCtx: AudioContext
  audioEl: HTMLAudioElement
}

export function CallProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [callState, dispatch] = useReducer(callReducer, initialState)

  // 1:1 refs (kept for backward compatibility)
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const remoteAudio = useRef<HTMLAudioElement | null>(null)
  const sessionChannel = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const stopTone = useRef<(() => void) | null>(null)
  const ringTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const voiceEffectRef = useRef<VoiceEffect>(getStoredVoiceEffect())

  // Group call refs
  const peers = useRef<Map<string, PeerEntry>>(new Map())
  const processedStream = useRef<MediaStream | null>(null)

  // Store callState in ref for use in callbacks
  const callStateRef = useRef(callState)
  callStateRef.current = callState

  // --- Init local media (shared for group calls) ---

  const initLocalMedia = useCallback(async (effect: VoiceEffect) => {
    if (localStream.current) return // already captured

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    localStream.current = stream

    // Create a shared AudioContext for processing
    const actx = new AudioContext()
    audioContextRef.current = actx
    if (actx.state === 'suspended') await actx.resume()
    const source = actx.createMediaStreamSource(stream)
    const effectOutput = await applyVoiceEffect(actx, source, effect)
    const destination = actx.createMediaStreamDestination()
    effectOutput.connect(destination)
    processedStream.current = destination.stream
  }, [])

  // --- Create peer for a specific user (group calls) ---

  const createPeerForUser = useCallback(async (userId: string, isCaller: boolean) => {
    const iceServers = await getTurnCredentials()
    const pc = new RTCPeerConnection({ iceServers })

    // Add processed tracks to this peer
    if (processedStream.current) {
      processedStream.current.getTracks().forEach(track => pc.addTrack(track, processedStream.current!))
    }

    // Remote audio element for this peer
    const audioEl = new Audio()
    audioEl.autoplay = true

    pc.ontrack = (event) => {
      audioEl.srcObject = event.streams[0]
    }

    // ICE candidates with senderId + targetId
    pc.onicecandidate = (event) => {
      if (event.candidate && sessionChannel.current) {
        sessionChannel.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate.toJSON(),
            senderId: session?.user?.id,
            targetId: userId,
          },
        })
      }
    }

    // Connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        stopAllTones()
        dispatch({ type: 'PARTICIPANT_CONNECTED', userId })
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        dispatch({ type: 'PARTICIPANT_LEFT', userId })
        removePeer(userId)
      }
    }

    peers.current.set(userId, { pc, audioCtx: audioContextRef.current!, audioEl })

    if (isCaller) {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      // Small delay to let channel stabilize
      setTimeout(() => {
        sessionChannel.current?.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            sdp: offer,
            senderId: session?.user?.id,
            targetId: userId,
          },
        })
      }, 500)
    }

    return pc
  }, [session])

  // --- Remove a peer ---

  const removePeer = useCallback((userId: string) => {
    const entry = peers.current.get(userId)
    if (entry) {
      entry.pc.close()
      entry.audioEl.srcObject = null
      peers.current.delete(userId)
    }
  }, [])

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

    // Clean up group peers
    peers.current.forEach((entry) => {
      entry.pc.close()
      entry.audioEl.srcObject = null
    })
    peers.current.clear()
    processedStream.current = null

    // Clean up 1:1 peer
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

  // --- Create WebRTC Peer Connection (1:1 — unchanged) ---

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
    if (actx.state === 'suspended') await actx.resume()
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

    // ICE candidates -> send via session channel
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

  // --- Join session channel for WebRTC signaling (1:1 — unchanged) ---

  const joinSessionChannel1to1 = useCallback((callLogId: string, _isCaller: boolean) => {
    const channel = supabase.channel(`call:session:${callLogId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (!peerConnection.current) return
        // 1:1: no targetId check needed
        if (payload.targetId) return // skip group messages
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
        if (payload.targetId) return // skip group messages
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (!peerConnection.current) return
        if (payload.targetId) return // skip group messages
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

  // --- Join session channel for group call ---

  const joinSessionChannelGroup = useCallback((callLogId: string) => {
    const myUserId = session?.user?.id
    if (!myUserId) return

    const channel = supabase.channel(`call:session:${callLogId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.targetId !== myUserId) return
        const senderId = payload.senderId as string
        // Create peer for this sender if not exists
        if (!peers.current.has(senderId)) {
          await createPeerForUser(senderId, false)
        }
        const entry = peers.current.get(senderId)
        if (!entry) return
        await entry.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        const answer = await entry.pc.createAnswer()
        await entry.pc.setLocalDescription(answer)
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: { sdp: answer, senderId: myUserId, targetId: senderId },
        })
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.targetId !== myUserId) return
        const senderId = payload.senderId as string
        const entry = peers.current.get(senderId)
        if (!entry) return
        await entry.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.targetId !== myUserId) return
        const senderId = payload.senderId as string
        const entry = peers.current.get(senderId)
        if (!entry) return
        try {
          await entry.pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
        } catch {
          // Candidate may arrive before remote description
        }
      })
      .on('broadcast', { event: 'peer-joined' }, async ({ payload }) => {
        const joinedUserId = payload.userId as string
        if (joinedUserId === myUserId) return
        if (peers.current.has(joinedUserId)) return
        // Existing participants create offers to the new peer
        dispatch({ type: 'PARTICIPANT_CONNECTED', userId: joinedUserId })
        await createPeerForUser(joinedUserId, true)
      })
      .on('broadcast', { event: 'peer-left' }, ({ payload }) => {
        const leftUserId = payload.userId as string
        if (leftUserId === myUserId) return
        dispatch({ type: 'PARTICIPANT_LEFT', userId: leftUserId })
        removePeer(leftUserId)

        // If all participants left, end the call
        const remaining = [...peers.current.keys()]
        if (remaining.length === 0) {
          endCallInternal()
        }
      })
      .on('broadcast', { event: 'call-end' }, () => {
        endCallInternal()
      })
      .subscribe()

    sessionChannel.current = channel
    return channel
  }, [session, createPeerForUser, removePeer])

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
        // Busy -- reject if already in a call
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

        const isGroup = payload.isGroup === true

        if (isGroup) {
          // Build participants map from payload
          const participantsMap = new Map<string, CallParticipant>()
          if (payload.participants) {
            for (const p of payload.participants as { id: string; displayName: string; avatarUrl: string | null }[]) {
              participantsMap.set(p.id, {
                ...p,
                status: p.id === payload.callerId ? 'connecting' : 'ringing',
              })
            }
          }

          dispatch({
            type: 'INCOMING_GROUP_CALL',
            conversationId: payload.conversationId,
            callLogId: payload.callLogId,
            remoteUser: payload.caller,
            participants: participantsMap,
          })
        } else {
          dispatch({
            type: 'INCOMING_CALL',
            conversationId: payload.conversationId,
            callLogId: payload.callLogId,
            remoteUser: payload.caller,
          })
        }

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

  const startCall = useCallback(async (
    conversationId: string,
    remoteUser: CallState['remoteUser'],
    voiceEffect: VoiceEffect = 'disguise',
    groupMembers?: { id: string; displayName: string; avatarUrl: string | null }[]
  ) => {
    if (!session?.user?.id || callStateRef.current.status !== 'idle') return
    voiceEffectRef.current = voiceEffect

    const isGroup = !!groupMembers && groupMembers.length > 0
    const allMembers = groupMembers || (remoteUser ? [remoteUser] : [])

    // Enforce max participants
    if (allMembers.length + 1 > MAX_PARTICIPANTS) return

    // For 1:1, remoteUser is required
    if (!isGroup && !remoteUser) return

    // Create call log (use first member as callee for 1:1, self for group)
    const { data: callLog, error } = await supabase
      .from('call_logs')
      .insert({
        conversation_id: conversationId,
        caller_id: session.user.id,
        callee_id: isGroup ? session.user.id : remoteUser!.id,
        status: 'initiated',
      })
      .select('id')
      .single()

    if (error || !callLog) return

    if (isGroup) {
      // --- GROUP CALL ---
      const participantsMap = new Map<string, CallParticipant>()
      for (const m of allMembers) {
        participantsMap.set(m.id, {
          id: m.id,
          displayName: m.displayName,
          avatarUrl: m.avatarUrl,
          status: 'ringing',
        })
      }

      dispatch({
        type: 'START_GROUP_CALL',
        conversationId,
        callLogId: callLog.id,
        participants: participantsMap,
      })

      stopTone.current = playRingback()

      // Init local media
      await initLocalMedia(voiceEffect)

      // Join session channel for group
      joinSessionChannelGroup(callLog.id)

      // Build participants payload for invites
      const participantsPayload = [
        { id: session.user.id, displayName: session.user.user_metadata?.display_name || 'Unknown', avatarUrl: null },
        ...allMembers,
      ]

      // Send invite to all members
      for (const member of allMembers) {
        const memberChannel = supabase.channel(`call:user:${member.id}`, {
          config: { broadcast: { self: false } },
        })
        memberChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            memberChannel.send({
              type: 'broadcast',
              event: 'call-invite',
              payload: {
                conversationId,
                callLogId: callLog.id,
                callerId: session.user.id,
                isGroup: true,
                caller: {
                  id: session.user.id,
                  displayName: session.user.user_metadata?.display_name || 'Unknown',
                  avatarUrl: null,
                },
                participants: participantsPayload,
              },
            })
            setTimeout(() => supabase.removeChannel(memberChannel), 2000)
          }
        })
      }

      // Timeout for no answer
      ringTimeout.current = setTimeout(() => {
        if (callStateRef.current.status === 'outgoing_ringing') {
          // No one joined, end call
          supabase.from('call_logs').update({ status: 'no_answer', ended_at: new Date().toISOString() }).eq('id', callLog.id).then()
          cleanup()
          dispatch({ type: 'CALL_ENDED', reason: 'no_answer' })
          setTimeout(() => dispatch({ type: 'RESET' }), 3000)
        }
      }, RING_TIMEOUT_MS)
    } else {
      // --- 1:1 CALL (unchanged) ---
      dispatch({
        type: 'START_OUTGOING',
        conversationId,
        callLogId: callLog.id,
        remoteUser,
      })

      // Play ringback tone
      stopTone.current = playRingback()

      // Send invite via callee's user channel
      const calleeChannel = supabase.channel(`call:user:${remoteUser!.id}`, {
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
          // Don't remove -- keep for responses
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
          joinSessionChannel1to1(callLog.id, true)

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
          dispatch({ type: 'CALL_ENDED', reason: 'rejected' })
          setTimeout(() => dispatch({ type: 'RESET' }), 3000)
          supabase.removeChannel(responseChannel)
          supabase.removeChannel(calleeChannel)
        })
        .on('broadcast', { event: 'call-busy' }, ({ payload }) => {
          if (payload.callLogId !== callLog.id) return
          supabase.from('call_logs').update({ status: 'missed', ended_at: new Date().toISOString() }).eq('id', callLog.id).then()
          cleanup()
          dispatch({ type: 'CALL_ENDED', reason: 'busy' })
          setTimeout(() => dispatch({ type: 'RESET' }), 3000)
          supabase.removeChannel(responseChannel)
          supabase.removeChannel(calleeChannel)
        })
        .subscribe()

      // Timeout for no answer
      ringTimeout.current = setTimeout(() => {
        if (callStateRef.current.status === 'outgoing_ringing') {
          supabase.from('call_logs').update({ status: 'no_answer', ended_at: new Date().toISOString() }).eq('id', callLog.id).then()
          cleanup()
          dispatch({ type: 'CALL_ENDED', reason: 'no_answer' })
          setTimeout(() => dispatch({ type: 'RESET' }), 3000)
          supabase.removeChannel(responseChannel)
          supabase.removeChannel(calleeChannel)
        }
      }, RING_TIMEOUT_MS)
    }
  }, [session, createPeerConnection, joinSessionChannel1to1, joinSessionChannelGroup, initLocalMedia, cleanup])

  // --- Accept call (callee side) ---

  const acceptCall = useCallback(async (effect?: VoiceEffect) => {
    const state = callStateRef.current
    if (state.status !== 'incoming_ringing' || !state.remoteUser || !state.callLogId) return

    const selectedEffect = effect || getStoredVoiceEffect()
    voiceEffectRef.current = selectedEffect

    stopAllTones()
    if (ringTimeout.current) {
      clearTimeout(ringTimeout.current)
      ringTimeout.current = null
    }

    dispatch({ type: 'CALL_ACCEPTED' })

    try {
      if (state.isGroup) {
        // --- GROUP CALL ACCEPT ---
        await initLocalMedia(selectedEffect)
        joinSessionChannelGroup(state.callLogId)

        // Broadcast peer-joined so existing participants connect to us
        setTimeout(() => {
          sessionChannel.current?.send({
            type: 'broadcast',
            event: 'peer-joined',
            payload: { userId: session?.user?.id },
          })
        }, 500)
      } else {
        // --- 1:1 CALL ACCEPT ---
        // Create peer connection first (may fail if mic permission denied)
        await createPeerConnection(state.callLogId, selectedEffect)

        // Only send accept AFTER peer connection is ready
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

        joinSessionChannel1to1(state.callLogId, false)
      }
    } catch (err) {
      console.error('[Call] Failed to accept call (mic permission denied?):', err)
      // Notify the caller that the call failed
      const callerResponseChannel = supabase.channel(`call:user:${state.remoteUser.id}:response`, {
        config: { broadcast: { self: false } },
      })
      callerResponseChannel.subscribe((st) => {
        if (st === 'SUBSCRIBED') {
          callerResponseChannel.send({
            type: 'broadcast',
            event: 'call-reject',
            payload: { callLogId: state.callLogId },
          })
          setTimeout(() => supabase.removeChannel(callerResponseChannel), 1000)
        }
      })

      supabase.from('call_logs').update({ status: 'rejected', ended_at: new Date().toISOString() }).eq('id', state.callLogId).then()
      cleanup()
      dispatch({ type: 'CALL_ENDED', reason: 'failed' })
      setTimeout(() => dispatch({ type: 'RESET' }), 3000)
    }
  }, [session, createPeerConnection, joinSessionChannel1to1, joinSessionChannelGroup, initLocalMedia, cleanup])

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
    const state = callStateRef.current

    // Send end signal via session channel
    if (sessionChannel.current) {
      if (state.isGroup) {
        // For group: broadcast peer-left, don't end whole call
        sessionChannel.current.send({
          type: 'broadcast',
          event: 'peer-left',
          payload: { userId: session?.user?.id },
        })
      } else {
        sessionChannel.current.send({
          type: 'broadcast',
          event: 'call-end',
          payload: {},
        })
      }
    }
    endCallInternal()
  }, [endCallInternal, session])

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
    if (callStateRef.current.isGroup) {
      // Toggle speaker for all peer audio elements
      const useSpeaker = !callStateRef.current.isSpeaker
      peers.current.forEach((entry) => {
        const audioEl = entry.audioEl as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }
        if (audioEl.setSinkId) {
          audioEl.setSinkId(useSpeaker ? 'default' : '').catch(() => {})
        }
      })
    } else {
      if (remoteAudio.current) {
        const audioEl = remoteAudio.current as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }
        if (audioEl.setSinkId) {
          const useSpeaker = !callStateRef.current.isSpeaker
          audioEl.setSinkId(useSpeaker ? 'default' : '').catch(() => {})
        }
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
