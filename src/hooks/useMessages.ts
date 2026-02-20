import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { playMessageSound } from '../lib/notificationSound'
import type { Message, Profile } from '../lib/types'

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null
}

export function useMessages(conversationId: string | undefined) {
  const { session } = useAuth()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const profileCache = useRef<Map<string, Pick<Profile, 'id' | 'display_name' | 'avatar_url'>>>(new Map())

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !session) return
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const mapped = data.map(m => {
        const sender = Array.isArray(m.sender) ? m.sender[0] : m.sender
        if (sender) profileCache.current.set(sender.id, sender)
        return { ...m, sender }
      })
      setMessages(mapped)
    }
    setLoading(false)
  }, [conversationId, session])

  useEffect(() => {
    fetchMessages()

    if (!conversationId) return

    // Subscribe to ALL inserts on messages table (no filter) - more reliable
    // Then filter client-side
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as Message
          // Client-side filter for this conversation
          if (newMsg.conversation_id !== conversationId) return

          let sender = profileCache.current.get(newMsg.sender_id) ?? null
          if (!sender) {
            const { data } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single()
            if (data) {
              sender = data
              profileCache.current.set(data.id, data)
            }
          }
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            // Play sound for incoming messages from others
            if (newMsg.sender_id !== session?.user.id) {
              playMessageSound()
            }
            return [...prev, { ...newMsg, sender }]
          })
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for messages:${conversationId}:`, status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, fetchMessages])

  async function sendMessage(content: string) {
    if (!conversationId || !session) return
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: session.user.id,
      content: content.trim(),
    })
  }

  return { messages, loading, sendMessage }
}
