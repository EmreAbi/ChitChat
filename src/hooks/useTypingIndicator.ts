import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useTypingIndicator(conversationId: string | undefined) {
  const { session, profile } = useAuth()
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (!conversationId || !session) return

    const channel = supabase.channel(`typing:${conversationId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id === session.user.id) return
        setTypingUsers(prev => new Map(prev).set(payload.user_id, payload.display_name))

        // Clear after 3 seconds
        const existing = timeoutsRef.current.get(payload.user_id)
        if (existing) clearTimeout(existing)
        timeoutsRef.current.set(
          payload.user_id,
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Map(prev)
              next.delete(payload.user_id)
              return next
            })
          }, 3000)
        )
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        setTypingUsers(prev => {
          const next = new Map(prev)
          next.delete(payload.user_id)
          return next
        })
      })
      .subscribe()

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t))
      timeoutsRef.current.clear()
      supabase.removeChannel(channel)
    }
  }, [conversationId, session])

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !session || !profile) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: session.user.id, display_name: profile.display_name },
    })
  }, [session, profile])

  const sendStopTyping = useCallback(() => {
    if (!channelRef.current || !session) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'stop_typing',
      payload: { user_id: session.user.id },
    })
  }, [session])

  return { typingUsers, sendTyping, sendStopTyping }
}
